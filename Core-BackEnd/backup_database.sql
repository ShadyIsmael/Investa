-- ================================================================
-- BACKUP SCRIPT: Create Full Database Backup
-- Database: InvestaDb
-- Purpose: Safety backup before Identity key type conversion
-- ================================================================

USE master;
GO

DECLARE @BackupPath NVARCHAR(500);
DECLARE @BackupFile NVARCHAR(500);
DECLARE @Timestamp NVARCHAR(50);

-- Generate timestamp for backup file
SET @Timestamp = CONVERT(NVARCHAR(50), GETDATE(), 112) + '_' + REPLACE(CONVERT(NVARCHAR(50), GETDATE(), 108), ':', '');

-- Set backup path (adjust if needed)
SET @BackupPath = 'C:\Backups\';
SET @BackupFile = @BackupPath + 'InvestaDb_BeforeIdentityMigration_' + @Timestamp + '.bak';

PRINT '================================================================';
PRINT 'Creating database backup...';
PRINT 'File: ' + @BackupFile;
PRINT '================================================================';

-- Create backup
BACKUP DATABASE [InvestaDb]
TO DISK = @BackupFile
WITH FORMAT,
     NAME = 'InvestaDb Full Backup Before Identity Migration',
     DESCRIPTION = 'Full backup before converting Identity keys from nvarchar to uniqueidentifier',
     COMPRESSION,
     STATS = 10;

PRINT '';
PRINT '✓ Backup completed successfully!';
PRINT 'Backup file: ' + @BackupFile;
PRINT '';
PRINT 'To restore if needed, run:';
PRINT 'RESTORE DATABASE [InvestaDb] FROM DISK = ''' + @BackupFile + ''' WITH REPLACE;';
PRINT '';
