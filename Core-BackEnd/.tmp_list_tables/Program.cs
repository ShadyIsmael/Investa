// See https://aka.ms/new-console-template for more information
using System;
using Npgsql;

const string Conn = "Host=localhost;Port=5432;Database=Investa;Username=postgres;Password=123";

try
{
	using var conn = new NpgsqlConnection(Conn);
	conn.Open();

	using var cmd = new NpgsqlCommand("SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;", conn);
	using var reader = cmd.ExecuteReader();

	Console.WriteLine("Public tables in database 'Investa':");
	while (reader.Read())
	{
		Console.WriteLine("- " + reader.GetString(0));
	}

	conn.Close();
}
catch (Exception ex)
{
	Console.Error.WriteLine("Error: " + ex.Message);
	Environment.ExitCode = 1;
}
