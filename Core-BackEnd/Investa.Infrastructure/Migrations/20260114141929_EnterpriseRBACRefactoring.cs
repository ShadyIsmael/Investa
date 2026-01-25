// FILE REMOVED: archived to ../ArchivedMigrations/20260123/20260114141929_EnterpriseRBACRefactoring.cs.original
// Migration removed during consolidation.

            migrationBuilder.DropPrimaryKey(
                name: "PK_GroupPermissions",
                table: "GroupPermissions");

            migrationBuilder.DeleteData(
                table: "GroupPermissions",
                keyColumns: new[] { "GroupId", "PermissionId" },
                keyValues: new object[] { 1000, 2000 });

            migrationBuilder.DeleteData(
                table: "GroupPermissions",
                keyColumns: new[] { "GroupId", "PermissionId" },
                keyValues: new object[] { 1000, 2001 });

            migrationBuilder.DeleteData(
                table: "GroupPermissions",
                keyColumns: new[] { "GroupId", "PermissionId" },
                keyValues: new object[] { 1000, 2002 });

            migrationBuilder.DeleteData(
                table: "GroupPermissions",
                keyColumns: new[] { "GroupId", "PermissionId" },
                keyValues: new object[] { 1000, 2003 });

            migrationBuilder.DeleteData(
                table: "GroupPermissions",
                keyColumns: new[] { "GroupId", "PermissionId" },
                keyValues: new object[] { 1000, 2004 });

            migrationBuilder.DeleteData(
                table: "GroupPermissions",
                keyColumns: new[] { "GroupId", "PermissionId" },
                keyValues: new object[] { 1000, 2005 });

            migrationBuilder.AddColumn<Guid>(
                name: "AssignedBy",
                table: "UserGroups",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "UserId1",
                table: "UserGroups",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "Groups",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "ModifiedAt",
                table: "Groups",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                table: "Groups",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Id",
                table: "GroupPermissions",
                type: "int",
                nullable: false,
                defaultValue: 0)
                .Annotation("SqlServer:Identity", "1, 1");

            migrationBuilder.AddColumn<int>(
                name: "ApplicationPermissionId",
                table: "GroupPermissions",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "AssignedAt",
                table: "GroupPermissions",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<Guid>(
                name: "AssignedBy",
                table: "GroupPermissions",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                table: "AuthUsers",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_GroupPermissions",
                table: "GroupPermissions",
                column: "Id");

            migrationBuilder.CreateTable(
                name: "ApplicationPermissions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Key = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ResourceType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Action = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Scope = table.Column<int>(type: "int", nullable: false),
                    ParentPermissionId = table.Column<int>(type: "int", nullable: true),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ModifiedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ModifiedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ApplicationPermissions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ApplicationPermissions_ApplicationPermissions_ParentPermissionId",
                        column: x => x.ParentPermissionId,
                        principalTable: "ApplicationPermissions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "AuditLogs",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UserName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    EntityType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    EntityId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Action = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Changes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    OldValues = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NewValues = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IpAddress = table.Column<string>(type: "nvarchar(45)", maxLength: 45, nullable: true),
                    UserAgent = table.Column<string>(type: "nvarchar(512)", maxLength: 512, nullable: true),
                    Timestamp = table.Column<DateTime>(type: "datetime2", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Severity = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AuditLogs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "UserSessions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    RefreshTokenHash = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: false),
                    DeviceFingerprint = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    UserAgent = table.Column<string>(type: "nvarchar(512)", maxLength: 512, nullable: true),
                    IpAddress = table.Column<string>(type: "nvarchar(45)", maxLength: 45, nullable: false),
                    Location = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    LastUsedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsRevoked = table.Column<bool>(type: "bit", nullable: false),
                    RevokedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    RevocationReason = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserSessions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserSessions_AuthUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AuthUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "GroupPermissions",
                columns: new[] { "Id", "ApplicationPermissionId", "AssignedAt", "AssignedBy", "GroupId", "PermissionId" },
                values: new object[,]
                {
                    { 1, null, new DateTime(2025, 12, 29, 0, 0, 0, 0, DateTimeKind.Utc), null, 1000, 2000 },
                    { 2, null, new DateTime(2025, 12, 29, 0, 0, 0, 0, DateTimeKind.Utc), null, 1000, 2001 },
                    { 3, null, new DateTime(2025, 12, 29, 0, 0, 0, 0, DateTimeKind.Utc), null, 1000, 2002 },
                    { 4, null, new DateTime(2025, 12, 29, 0, 0, 0, 0, DateTimeKind.Utc), null, 1000, 2003 },
                    { 5, null, new DateTime(2025, 12, 29, 0, 0, 0, 0, DateTimeKind.Utc), null, 1000, 2004 },
                    { 6, null, new DateTime(2025, 12, 29, 0, 0, 0, 0, DateTimeKind.Utc), null, 1000, 2005 }
                });

            migrationBuilder.UpdateData(
                table: "Groups",
                keyColumn: "Id",
                keyValue: 1000,
                columns: new[] { "IsActive", "ModifiedAt", "TenantId" },
                values: new object[] { true, null, null });

            migrationBuilder.UpdateData(
                table: "Groups",
                keyColumn: "Id",
                keyValue: 1001,
                columns: new[] { "IsActive", "ModifiedAt", "TenantId" },
                values: new object[] { true, null, null });

            migrationBuilder.UpdateData(
                table: "Groups",
                keyColumn: "Id",
                keyValue: 1002,
                columns: new[] { "IsActive", "ModifiedAt", "TenantId" },
                values: new object[] { true, null, null });

            migrationBuilder.UpdateData(
                table: "Groups",
                keyColumn: "Id",
                keyValue: 1003,
                columns: new[] { "IsActive", "ModifiedAt", "TenantId" },
                values: new object[] { true, null, null });

            migrationBuilder.CreateIndex(
                name: "IX_UserGroups_UserId1",
                table: "UserGroups",
                column: "UserId1");

            migrationBuilder.CreateIndex(
                name: "IX_GroupPermissions_ApplicationPermissionId",
                table: "GroupPermissions",
                column: "ApplicationPermissionId");

            migrationBuilder.CreateIndex(
                name: "IX_GroupPermissions_GroupId_PermissionId",
                table: "GroupPermissions",
                columns: new[] { "GroupId", "PermissionId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ApplicationPermissions_Key",
                table: "ApplicationPermissions",
                column: "Key",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ApplicationPermissions_ParentPermissionId",
                table: "ApplicationPermissions",
                column: "ParentPermissionId");

            migrationBuilder.CreateIndex(
                name: "IX_ApplicationPermissions_ResourceType_Action",
                table: "ApplicationPermissions",
                columns: new[] { "ResourceType", "Action" });

            migrationBuilder.CreateIndex(
                name: "IX_ApplicationPermissions_TenantId",
                table: "ApplicationPermissions",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_AuditLogs_EntityType",
                table: "AuditLogs",
                column: "EntityType");

            migrationBuilder.CreateIndex(
                name: "IX_AuditLogs_EntityType_EntityId",
                table: "AuditLogs",
                columns: new[] { "EntityType", "EntityId" });

            migrationBuilder.CreateIndex(
                name: "IX_AuditLogs_TenantId",
                table: "AuditLogs",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_AuditLogs_Timestamp",
                table: "AuditLogs",
                column: "Timestamp");

            migrationBuilder.CreateIndex(
                name: "IX_AuditLogs_UserId",
                table: "AuditLogs",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_UserSessions_RefreshTokenHash",
                table: "UserSessions",
                column: "RefreshTokenHash",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserSessions_UserId",
                table: "UserSessions",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_UserSessions_UserId_ExpiresAt",
                table: "UserSessions",
                columns: new[] { "UserId", "ExpiresAt" });

            migrationBuilder.AddForeignKey(
                name: "FK_GroupPermissions_ApplicationPermissions_ApplicationPermissionId",
                table: "GroupPermissions",
                column: "ApplicationPermissionId",
                principalTable: "ApplicationPermissions",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_UserGroups_ApplicationUsers_UserId1",
                table: "UserGroups",
                column: "UserId1",
                principalTable: "ApplicationUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_UserGroups_AuthUsers_UserId",
                table: "UserGroups",
                column: "UserId",
                principalTable: "AuthUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_GroupPermissions_ApplicationPermissions_ApplicationPermissionId",
                table: "GroupPermissions");

            migrationBuilder.DropForeignKey(
                name: "FK_UserGroups_ApplicationUsers_UserId1",
                table: "UserGroups");

            migrationBuilder.DropForeignKey(
                name: "FK_UserGroups_AuthUsers_UserId",
                table: "UserGroups");

            migrationBuilder.DropTable(
                name: "ApplicationPermissions");

            migrationBuilder.DropTable(
                name: "AuditLogs");

            migrationBuilder.DropTable(
                name: "UserSessions");

            migrationBuilder.DropIndex(
                name: "IX_UserGroups_UserId1",
                table: "UserGroups");

            migrationBuilder.DropPrimaryKey(
                name: "PK_GroupPermissions",
                table: "GroupPermissions");

            migrationBuilder.DropIndex(
                name: "IX_GroupPermissions_ApplicationPermissionId",
                table: "GroupPermissions");

            migrationBuilder.DropIndex(
                name: "IX_GroupPermissions_GroupId_PermissionId",
                table: "GroupPermissions");

            migrationBuilder.DeleteData(
                table: "GroupPermissions",
                keyColumn: "Id",
                keyColumnType: "int",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "GroupPermissions",
                keyColumn: "Id",
                keyColumnType: "int",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "GroupPermissions",
                keyColumn: "Id",
                keyColumnType: "int",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "GroupPermissions",
                keyColumn: "Id",
                keyColumnType: "int",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "GroupPermissions",
                keyColumn: "Id",
                keyColumnType: "int",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "GroupPermissions",
                keyColumn: "Id",
                keyColumnType: "int",
                keyValue: 6);

            migrationBuilder.DropColumn(
                name: "AssignedBy",
                table: "UserGroups");

            migrationBuilder.DropColumn(
                name: "UserId1",
                table: "UserGroups");

            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "Groups");

            migrationBuilder.DropColumn(
                name: "ModifiedAt",
                table: "Groups");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "Groups");

            migrationBuilder.DropColumn(
                name: "Id",
                table: "GroupPermissions");

            migrationBuilder.DropColumn(
                name: "ApplicationPermissionId",
                table: "GroupPermissions");

            migrationBuilder.DropColumn(
                name: "AssignedAt",
                table: "GroupPermissions");

            migrationBuilder.DropColumn(
                name: "AssignedBy",
                table: "GroupPermissions");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "AuthUsers");

            migrationBuilder.AddPrimaryKey(
                name: "PK_GroupPermissions",
                table: "GroupPermissions",
                columns: new[] { "GroupId", "PermissionId" });

            migrationBuilder.InsertData(
                table: "GroupPermissions",
                columns: new[] { "GroupId", "PermissionId" },
                values: new object[,]
                {
                    { 1000, 2000 },
                    { 1000, 2001 },
                    { 1000, 2002 },
                    { 1000, 2003 },
                    { 1000, 2004 },
                    { 1000, 2005 }
                });

            migrationBuilder.AddForeignKey(
                name: "FK_UserGroups_ApplicationUsers_UserId",
                table: "UserGroups",
                column: "UserId",
                principalTable: "ApplicationUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
