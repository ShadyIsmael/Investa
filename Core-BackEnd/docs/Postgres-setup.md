PostgreSQL setup (development)

1) Run Postgres in Docker:

```powershell
docker run --name investa-postgres -e POSTGRES_USER=investa_user -e POSTGRES_PASSWORD=ChangeMe -e POSTGRES_DB=InvestaDb -p 5432:5432 -d postgres:15
```

2) Example `DefaultConnection` string (already set in `Investa.API/appsettings.json`):

```
Host=localhost;Port=5432;Database=InvestaDb;Username=investa_user;Password=ChangeMe;Pooling=true
```

3) To apply migrations (if you create Postgres-specific migrations later):

```powershell
dotnet ef migrations add InitialPostgres -s Investa.API -p Investa.Infrastructure --output-dir "Migrations.Postgres"
dotnet ef database update -s Investa.API -p Investa.Infrastructure
```

Notes:
- We preserved existing SQL Server string in `SqlServerConnection` for rollback/reference.
- Current repository preserves existing SQL Server migrations; do not run those against Postgres.
- Secure passwords with environment variables or secret store in CI/production.
