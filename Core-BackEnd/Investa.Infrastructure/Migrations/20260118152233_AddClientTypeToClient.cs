// FILE REMOVED: archived to ../ArchivedMigrations/20260123/20260118152233_AddClientTypeToClient.cs.original
// Migration removed during consolidation.
    // Migration neutralized during consolidation.
    public partial class AddClientTypeToClient : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder) { }
        protected override void Down(MigrationBuilder migrationBuilder) { }
    }
}
            migrationBuilder.AddColumn<int>(
                name: "ClientType",
                table: "Clients",
                type: "int",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ClientType",
                table: "Clients");
        }
    }
}
