using System;
using Npgsql;

class Program
{
    static int Main(string[] args)
    {
        if (args.Length >= 3 && args[0]=="exec")
        {
            var conn = args[1];
            var sql = args[2];
            try
            {
                using var c = new NpgsqlConnection(conn);
                c.Open();
                using var cmd = c.CreateCommand();
                cmd.CommandText = sql;
                cmd.ExecuteNonQuery();
                Console.WriteLine("OK: SQL executed");
                return 0;
            }
            catch (Exception ex)
            {
                Console.WriteLine("ERROR: " + ex.ToString());
                return 2;
            }
        }

        var connStr = args.Length > 0 ? args[0] : "Host=localhost;Port=5432;Database=Investa;Username=postgres;Password=123";
        try
        {
            using var c = new NpgsqlConnection(connStr);
            c.Open();
            Console.WriteLine("OK: connected");
            return 0;
        }
        catch (Exception ex)
        {
            Console.WriteLine("ERROR: " + ex.ToString());
            return 2;
        }
    }
}
