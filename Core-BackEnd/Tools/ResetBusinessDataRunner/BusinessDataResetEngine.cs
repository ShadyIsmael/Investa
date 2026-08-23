using System.Data;
using System.Data.Common;

namespace ResetBusinessDataRunner;

public sealed record ResetTableResult(string Schema, string Table, long Before, long Deleted, long After);

public sealed record BusinessDataResetReport(
    IReadOnlyList<ResetTableResult> Tables,
    IReadOnlyList<string> DeleteOrder,
    IReadOnlyList<string> PreservedTables);

public sealed class BusinessDataResetEngine
{
    private sealed record TableRef(string Schema, string Name)
    {
        public string Key => $"{Schema}.{Name}";
        public override string ToString() => Key;
    }

    private sealed record ForeignKey(TableRef Child, TableRef Parent, IReadOnlyList<(string Child, string Parent, bool ChildNullable)> Columns);

    public async Task<BusinessDataResetReport> ExecuteAsync(
        DbConnection connection,
        bool dryRun = false,
        CancellationToken cancellationToken = default)
    {
        if (connection.State != ConnectionState.Open)
            await connection.OpenAsync(cancellationToken);

        var tables = await LoadTablesAsync(connection, cancellationToken);
        var existingNames = tables.Select(t => t.Name).ToArray();
        var targetNames = BusinessDataResetCatalog.ResolveExistingTables(existingNames);
        var target = tables
            .Where(t => targetNames.Contains(t.Name, StringComparer.OrdinalIgnoreCase))
            .ToDictionary(t => t.Key, StringComparer.OrdinalIgnoreCase);

        if (target.Count == 0)
            return new BusinessDataResetReport([], [], BusinessDataResetCatalog.PreservedTables.OrderBy(x => x).ToArray());

        var foreignKeys = await LoadForeignKeysAsync(connection, cancellationToken);
        EnsurePreservedTablesDoNotReferenceBusinessRows(target, foreignKeys);
        var nullableEdges = foreignKeys
            .Where(fk => target.ContainsKey(fk.Child.Key)
                     && target.ContainsKey(fk.Parent.Key)
                     && fk.Columns.All(column => column.ChildNullable))
            .Select(fk => (fk.Child.Key, fk.Parent.Key))
            .ToHashSet();
        var deleteOrder = BuildDeleteOrder(
            target.Keys,
            foreignKeys
                .Where(fk => !nullableEdges.Contains((fk.Child.Key, fk.Parent.Key)))
                .Select(fk => (fk.Child.Key, fk.Parent.Key)));
        var before = await ReadCountsAsync(connection, target.Values, transaction: null, cancellationToken);
        var deleted = new Dictionary<string, long>(StringComparer.OrdinalIgnoreCase);
        var after = new Dictionary<string, long>(StringComparer.OrdinalIgnoreCase);

        if (dryRun)
        {
            foreach (var table in target.Values)
                deleted[table.Key] = 0;
            after = before.ToDictionary(x => x.Key, x => x.Value, StringComparer.OrdinalIgnoreCase);
        }
        else
        {
            await using var transaction = await connection.BeginTransactionAsync(IsolationLevel.Serializable, cancellationToken);
            try
            {
                await BreakNullableForeignKeysAsync(connection, transaction, foreignKeys, target, cancellationToken);
                foreach (var key in deleteOrder)
                {
                    cancellationToken.ThrowIfCancellationRequested();
                    var table = target[key];
                    await using var command = connection.CreateCommand();
                    command.Transaction = transaction;
                    command.CommandTimeout = 300;
                    command.CommandText = $"DELETE FROM {Quote(table)};";
                    deleted[key] = await command.ExecuteNonQueryAsync(cancellationToken);
                }

                after = await ReadCountsAsync(connection, target.Values, transaction, cancellationToken);
                await transaction.CommitAsync(cancellationToken);
            }
            catch
            {
                await transaction.RollbackAsync(CancellationToken.None);
                throw;
            }
        }

        return new BusinessDataResetReport(
            target.Values
                .OrderBy(t => t.Key, StringComparer.OrdinalIgnoreCase)
                .Select(t => new ResetTableResult(
                    t.Schema,
                    t.Name,
                    before.GetValueOrDefault(t.Key),
                    deleted.GetValueOrDefault(t.Key),
                    after.GetValueOrDefault(t.Key)))
                .ToArray(),
            deleteOrder,
            BusinessDataResetCatalog.PreservedTables.OrderBy(x => x).ToArray());
    }

    public static IReadOnlyList<string> BuildDeleteOrder(
        IEnumerable<string> targetTableKeys,
        IEnumerable<(string Child, string Parent)> dependencies)
    {
        var keys = targetTableKeys.ToHashSet(StringComparer.OrdinalIgnoreCase);
        var childrenByParent = keys.ToDictionary(k => k, _ => new HashSet<string>(StringComparer.OrdinalIgnoreCase), StringComparer.OrdinalIgnoreCase);
        foreach (var (child, parent) in dependencies)
        {
            if (string.Equals(child, parent, StringComparison.OrdinalIgnoreCase)) continue;
            if (keys.Contains(child) && keys.Contains(parent)) childrenByParent[parent].Add(child);
        }

        var result = new List<string>(keys.Count);
        while (childrenByParent.Count > 0)
        {
            // A table is safe to delete when no remaining target table has a
            // foreign key pointing at it: children must be deleted first.
            var ready = childrenByParent
                .Where(x => x.Value.Count == 0)
                .Select(x => x.Key)
                .OrderBy(x => x, StringComparer.OrdinalIgnoreCase)
                .ToArray();
            if (ready.Length == 0)
                throw new InvalidOperationException("The business delete graph contains a foreign-key cycle. Reset aborted before deleting any rows.");

            foreach (var key in ready) childrenByParent.Remove(key);
            foreach (var childrenForTable in childrenByParent.Values)
                foreach (var key in ready) childrenForTable.Remove(key);
            result.AddRange(ready);
        }

        return result;
    }

    private static async Task<List<TableRef>> LoadTablesAsync(DbConnection connection, CancellationToken cancellationToken)
    {
        await using var command = connection.CreateCommand();
        command.CommandText = "SELECT s.name, t.name FROM sys.tables t INNER JOIN sys.schemas s ON s.schema_id = t.schema_id WHERE t.is_ms_shipped = 0;";
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        var result = new List<TableRef>();
        while (await reader.ReadAsync(cancellationToken))
            result.Add(new TableRef(reader.GetString(0), reader.GetString(1)));
        return result;
    }

    private static async Task<List<ForeignKey>> LoadForeignKeysAsync(DbConnection connection, CancellationToken cancellationToken)
    {
        await using var command = connection.CreateCommand();
        command.CommandText = @"
SELECT
    fk.name,
    childSchema.name,
    childTable.name,
    parentSchema.name,
    parentTable.name,
    childColumn.name,
    parentColumn.name,
    childColumn.is_nullable
FROM sys.foreign_keys fk
JOIN sys.tables childTable ON childTable.object_id = fk.parent_object_id
JOIN sys.schemas childSchema ON childSchema.schema_id = childTable.schema_id
JOIN sys.tables parentTable ON parentTable.object_id = fk.referenced_object_id
JOIN sys.schemas parentSchema ON parentSchema.schema_id = parentTable.schema_id
JOIN sys.foreign_key_columns fkc ON fkc.constraint_object_id = fk.object_id
JOIN sys.columns childColumn ON childColumn.object_id = fkc.parent_object_id AND childColumn.column_id = fkc.parent_column_id
JOIN sys.columns parentColumn ON parentColumn.object_id = fkc.referenced_object_id AND parentColumn.column_id = fkc.referenced_column_id
ORDER BY fk.object_id, fkc.constraint_column_id;";
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        var byName = new Dictionary<string, (TableRef Child, TableRef Parent, List<(string Child, string Parent, bool ChildNullable)> Columns)>(StringComparer.OrdinalIgnoreCase);
        while (await reader.ReadAsync(cancellationToken))
        {
            var name = reader.GetString(0);
            var child = new TableRef(reader.GetString(1), reader.GetString(2));
            var parent = new TableRef(reader.GetString(3), reader.GetString(4));
            if (!byName.TryGetValue(name, out var value))
                value = (child, parent, []);
            value.Columns.Add((reader.GetString(5), reader.GetString(6), reader.GetBoolean(7)));
            byName[name] = value;
        }

        return byName.Values.Select(x => new ForeignKey(x.Child, x.Parent, x.Columns)).ToList();
    }

    private static void EnsurePreservedTablesDoNotReferenceBusinessRows(
        IReadOnlyDictionary<string, TableRef> target,
        IEnumerable<ForeignKey> foreignKeys)
    {
        // A preserved table pointing at a business aggregate would make a
        // complete reset impossible without mutating preserved data. Fail fast
        // instead of weakening the FK or silently leaving an orphan.
        var invalid = foreignKeys
            .Where(fk => !target.ContainsKey(fk.Child.Key)
                      && target.ContainsKey(fk.Parent.Key)
                      && BusinessDataResetCatalog.IsPreserved(fk.Child.Name))
            .Select(fk => $"{fk.Child} -> {fk.Parent}")
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray();
        if (invalid.Length > 0)
            throw new InvalidOperationException("Preserved tables reference reset business tables: " + string.Join(", ", invalid));
    }

    private static async Task<Dictionary<string, long>> ReadCountsAsync(
        DbConnection connection,
        IEnumerable<TableRef> tables,
        DbTransaction? transaction,
        CancellationToken cancellationToken)
    {
        var result = new Dictionary<string, long>(StringComparer.OrdinalIgnoreCase);
        foreach (var table in tables)
        {
            await using var command = connection.CreateCommand();
            command.Transaction = transaction;
            command.CommandText = $"SELECT COUNT_BIG(*) FROM {Quote(table)};";
            var value = await command.ExecuteScalarAsync(cancellationToken);
            result[table.Key] = Convert.ToInt64(value);
        }
        return result;
    }

    private static async Task BreakNullableForeignKeysAsync(
        DbConnection connection,
        DbTransaction transaction,
        IEnumerable<ForeignKey> foreignKeys,
        IReadOnlyDictionary<string, TableRef> target,
        CancellationToken cancellationToken)
    {
        foreach (var foreignKey in foreignKeys.Where(fk =>
                     target.ContainsKey(fk.Child.Key)
                     && target.ContainsKey(fk.Parent.Key)
                     && fk.Columns.All(column => column.ChildNullable)))
        {
            var columns = string.Join(", ", foreignKey.Columns.Select(column => $"[{column.Child.Replace("]", "]]", StringComparison.Ordinal)}] = NULL"));
            await using var command = connection.CreateCommand();
            command.Transaction = transaction;
            command.CommandTimeout = 300;
            command.CommandText = $"UPDATE {Quote(foreignKey.Child)} SET {columns};";
            await command.ExecuteNonQueryAsync(cancellationToken);
        }
    }

    private static string Quote(TableRef table) => $"[{table.Schema.Replace("]", "]]", StringComparison.Ordinal)}].[{table.Name.Replace("]", "]]", StringComparison.Ordinal)}]";
}
