Runner to execute scripts/delete_all_clients_and_users.sql

Usage (from repo root):

dotnet run --project Tools/DeleteAllUsersRunner/DeleteAllUsersRunner.csproj

The runner reads `Investa.API/appsettings.json` to get `ConnectionStrings:DefaultConnection` and prompts for `CONFIRM` before running.
