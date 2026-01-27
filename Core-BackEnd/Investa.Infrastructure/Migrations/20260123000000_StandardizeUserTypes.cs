// FILE REMOVED: archived to ../ArchivedMigrations/20260123/20260123000000_StandardizeUserTypes.cs.original
// Migration removed during consolidation.
    // Migration neutralized during consolidation.
    public partial class StandardizeUserTypes : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder) { }
        protected override void Down(MigrationBuilder migrationBuilder) { }
    }
}
            // Update existing UserType values
            // Old values: Client=0, Investor=0, OrgUser=1, Founder=2
            // New values: OrgUser=0, Founder=1, Partner=2
            
            // Note: Since EF stores enums as strings by default (due to HasConversion<string>()),
            // we need to update string values, not numeric values.
            
            // Step 1: Convert any 'Client' or 'Investor' string values to 'Founder'
            migrationBuilder.Sql(@"
                UPDATE ""AuthUsers""
                SET ""UserType"" = 'Founder'
                WHERE ""UserType"" IN ('Client', 'Investor');
            ");

            // Step 2: Update numeric values (in case database has numeric representation)
            // Old numeric: 0='Client/Investor', 1='OrgUser', 2='Founder'
            // New numeric: 0='OrgUser', 1='Founder', 2='Partner'
            // This requires temporary storage to avoid conflicts
            
            migrationBuilder.Sql(@"
                -- Add temporary column to store new values
                ALTER TABLE ""AuthUsers"" ADD COLUMN ""UserType_New"" INTEGER NULL;
                
                -- Map old numeric values to new ones:
                -- Old 0 (Client/Investor) -> New 1 (Founder)
                -- Old 1 (OrgUser) -> New 0 (OrgUser)
                -- Old 2 (Founder) -> New 1 (Founder)
                
                UPDATE ""AuthUsers""
                SET ""UserType_New"" = CASE 
                    WHEN CAST(""UserType"" AS INTEGER) = 0 THEN 1  -- Client/Investor -> Founder
                    WHEN CAST(""UserType"" AS INTEGER) = 1 THEN 0  -- OrgUser -> OrgUser
                    WHEN CAST(""UserType"" AS INTEGER) = 2 THEN 1  -- Founder -> Founder
                    ELSE 1  -- Default to Founder for any unknown values
                END
                WHERE ""UserType"" ~ '^[0-9]+$';  -- Only process numeric string values
                
                -- Update original column with new values
                UPDATE ""AuthUsers""
                SET ""UserType"" = CAST(""UserType_New"" AS VARCHAR)
                WHERE ""UserType_New"" IS NOT NULL;
                
                -- Drop temporary column
                ALTER TABLE ""AuthUsers"" DROP COLUMN ""UserType_New"";
            ");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Cannot reliably reverse this migration as we've lost information
            // about which users were originally 'Client' vs 'Investor'
            migrationBuilder.Sql(@"
                -- This is a best-effort downgrade
                -- All Founder (1) will be converted back to Client (0)
                UPDATE ""AuthUsers""
                SET ""UserType"" = 'Client'
                WHERE ""UserType"" = 'Founder' OR CAST(""UserType"" AS INTEGER) = 1;
                
                UPDATE ""AuthUsers""
                SET ""UserType"" = 'OrgUser'
                WHERE CAST(""UserType"" AS INTEGER) = 0;
            ");
        }
    }
}
