# ReseedDatabase safety

This utility deletes and recreates a database. It is deliberately guarded and
must only be used on a disposable Development database.

It refuses to run unless all of the following are true:

- `ASPNETCORE_ENVIRONMENT=Development`
- `--confirm-drop-and-reseed` is supplied
- `--target-server=<server>` and `--target-database=<database>` both exactly match `ConnectionStrings:DefaultConnection`

Example invocation (only after verifying the configured database and backup):

```powershell
$env:ASPNETCORE_ENVIRONMENT = "Development"
dotnet run --project .\ReseedDatabase.csproj -- --target-server=localhost --target-database=InvestaDb --confirm-drop-and-reseed
```

The command is destructive. Do not run it against a database containing
authoritative business data. The application does not create a database as a
side effect of normal startup.
