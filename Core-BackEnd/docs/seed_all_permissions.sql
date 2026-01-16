-- Seed Complete Permission Set for RBAC System
-- Ensures all required permissions are present in the database
-- Date: 2026-01-15

BEGIN TRANSACTION;

INSERT INTO Permissions (Name, CreatedAt) SELECT 'Dashboard.View', GETDATE() WHERE NOT EXISTS (SELECT 1 FROM Permissions WHERE Name = 'Dashboard.View');
INSERT INTO Permissions (Name, CreatedAt) SELECT 'Client.View', GETDATE() WHERE NOT EXISTS (SELECT 1 FROM Permissions WHERE Name = 'Client.View');
INSERT INTO Permissions (Name, CreatedAt) SELECT 'Client.Manage', GETDATE() WHERE NOT EXISTS (SELECT 1 FROM Permissions WHERE Name = 'Client.Manage');
INSERT INTO Permissions (Name, CreatedAt) SELECT 'RBAC.View', GETDATE() WHERE NOT EXISTS (SELECT 1 FROM Permissions WHERE Name = 'RBAC.View');
INSERT INTO Permissions (Name, CreatedAt) SELECT 'User.View', GETDATE() WHERE NOT EXISTS (SELECT 1 FROM Permissions WHERE Name = 'User.View');
INSERT INTO Permissions (Name, CreatedAt) SELECT 'User.Manage', GETDATE() WHERE NOT EXISTS (SELECT 1 FROM Permissions WHERE Name = 'User.Manage');
INSERT INTO Permissions (Name, CreatedAt) SELECT 'User.Create', GETDATE() WHERE NOT EXISTS (SELECT 1 FROM Permissions WHERE Name = 'User.Create');
INSERT INTO Permissions (Name, CreatedAt) SELECT 'User.Edit', GETDATE() WHERE NOT EXISTS (SELECT 1 FROM Permissions WHERE Name = 'User.Edit');
INSERT INTO Permissions (Name, CreatedAt) SELECT 'User.Delete', GETDATE() WHERE NOT EXISTS (SELECT 1 FROM Permissions WHERE Name = 'User.Delete');
INSERT INTO Permissions (Name, CreatedAt) SELECT 'User.Deactivate', GETDATE() WHERE NOT EXISTS (SELECT 1 FROM Permissions WHERE Name = 'User.Deactivate');
INSERT INTO Permissions (Name, CreatedAt) SELECT 'Group.Manage', GETDATE() WHERE NOT EXISTS (SELECT 1 FROM Permissions WHERE Name = 'Group.Manage');
INSERT INTO Permissions (Name, CreatedAt) SELECT 'Group.Create', GETDATE() WHERE NOT EXISTS (SELECT 1 FROM Permissions WHERE Name = 'Group.Create');
INSERT INTO Permissions (Name, CreatedAt) SELECT 'Group.Update', GETDATE() WHERE NOT EXISTS (SELECT 1 FROM Permissions WHERE Name = 'Group.Update');
INSERT INTO Permissions (Name, CreatedAt) SELECT 'Group.Edit', GETDATE() WHERE NOT EXISTS (SELECT 1 FROM Permissions WHERE Name = 'Group.Edit');
INSERT INTO Permissions (Name, CreatedAt) SELECT 'Group.Delete', GETDATE() WHERE NOT EXISTS (SELECT 1 FROM Permissions WHERE Name = 'Group.Delete');
INSERT INTO Permissions (Name, CreatedAt) SELECT 'Group.View', GETDATE() WHERE NOT EXISTS (SELECT 1 FROM Permissions WHERE Name = 'Group.View');
INSERT INTO Permissions (Name, CreatedAt) SELECT 'Role.Manage', GETDATE() WHERE NOT EXISTS (SELECT 1 FROM Permissions WHERE Name = 'Role.Manage');
INSERT INTO Permissions (Name, CreatedAt) SELECT 'Role.Create', GETDATE() WHERE NOT EXISTS (SELECT 1 FROM Permissions WHERE Name = 'Role.Create');
INSERT INTO Permissions (Name, CreatedAt) SELECT 'Role.Edit', GETDATE() WHERE NOT EXISTS (SELECT 1 FROM Permissions WHERE Name = 'Role.Edit');
INSERT INTO Permissions (Name, CreatedAt) SELECT 'Role.Delete', GETDATE() WHERE NOT EXISTS (SELECT 1 FROM Permissions WHERE Name = 'Role.Delete');
INSERT INTO Permissions (Name, CreatedAt) SELECT 'Role.View', GETDATE() WHERE NOT EXISTS (SELECT 1 FROM Permissions WHERE Name = 'Role.View');
INSERT INTO Permissions (Name, CreatedAt) SELECT 'Finance.View', GETDATE() WHERE NOT EXISTS (SELECT 1 FROM Permissions WHERE Name = 'Finance.View');
INSERT INTO Permissions (Name, CreatedAt) SELECT 'Finance.Manage', GETDATE() WHERE NOT EXISTS (SELECT 1 FROM Permissions WHERE Name = 'Finance.Manage');
INSERT INTO Permissions (Name, CreatedAt) SELECT 'Finance.Approve', GETDATE() WHERE NOT EXISTS (SELECT 1 FROM Permissions WHERE Name = 'Finance.Approve');
INSERT INTO Permissions (Name, CreatedAt) SELECT 'Finance.Export', GETDATE() WHERE NOT EXISTS (SELECT 1 FROM Permissions WHERE Name = 'Finance.Export');
INSERT INTO Permissions (Name, CreatedAt) SELECT 'Invoice.Manage', GETDATE() WHERE NOT EXISTS (SELECT 1 FROM Permissions WHERE Name = 'Invoice.Manage');
INSERT INTO Permissions (Name, CreatedAt) SELECT 'Invoice.Create', GETDATE() WHERE NOT EXISTS (SELECT 1 FROM Permissions WHERE Name = 'Invoice.Create');
INSERT INTO Permissions (Name, CreatedAt) SELECT 'Invoice.Approve', GETDATE() WHERE NOT EXISTS (SELECT 1 FROM Permissions WHERE Name = 'Invoice.Approve');
INSERT INTO Permissions (Name, CreatedAt) SELECT 'Payment.Process', GETDATE() WHERE NOT EXISTS (SELECT 1 FROM Permissions WHERE Name = 'Payment.Process');
INSERT INTO Permissions (Name, CreatedAt) SELECT 'Billing.View', GETDATE() WHERE NOT EXISTS (SELECT 1 FROM Permissions WHERE Name = 'Billing.View');
INSERT INTO Permissions (Name, CreatedAt) SELECT 'Account.View', GETDATE() WHERE NOT EXISTS (SELECT 1 FROM Permissions WHERE Name = 'Account.View');
INSERT INTO Permissions (Name, CreatedAt) SELECT 'BankRec.View', GETDATE() WHERE NOT EXISTS (SELECT 1 FROM Permissions WHERE Name = 'BankRec.View');
INSERT INTO Permissions (Name, CreatedAt) SELECT 'BankRec.Manage', GETDATE() WHERE NOT EXISTS (SELECT 1 FROM Permissions WHERE Name = 'BankRec.Manage');
INSERT INTO Permissions (Name, CreatedAt) SELECT 'Journal.View', GETDATE() WHERE NOT EXISTS (SELECT 1 FROM Permissions WHERE Name = 'Journal.View');
INSERT INTO Permissions (Name, CreatedAt) SELECT 'Journal.Create', GETDATE() WHERE NOT EXISTS (SELECT 1 FROM Permissions WHERE Name = 'Journal.Create');
INSERT INTO Permissions (Name, CreatedAt) SELECT 'CashFlow.View', GETDATE() WHERE NOT EXISTS (SELECT 1 FROM Permissions WHERE Name = 'CashFlow.View');
INSERT INTO Permissions (Name, CreatedAt) SELECT 'Report.View', GETDATE() WHERE NOT EXISTS (SELECT 1 FROM Permissions WHERE Name = 'Report.View');
INSERT INTO Permissions (Name, CreatedAt) SELECT 'Report.Export', GETDATE() WHERE NOT EXISTS (SELECT 1 FROM Permissions WHERE Name = 'Report.Export');
INSERT INTO Permissions (Name, CreatedAt) SELECT 'Audit.View', GETDATE() WHERE NOT EXISTS (SELECT 1 FROM Permissions WHERE Name = 'Audit.View');
INSERT INTO Permissions (Name, CreatedAt) SELECT 'Analytics.View', GETDATE() WHERE NOT EXISTS (SELECT 1 FROM Permissions WHERE Name = 'Analytics.View');
INSERT INTO Permissions (Name, CreatedAt) SELECT 'Analytics.Access', GETDATE() WHERE NOT EXISTS (SELECT 1 FROM Permissions WHERE Name = 'Analytics.Access');
INSERT INTO Permissions (Name, CreatedAt) SELECT 'Config.Manage', GETDATE() WHERE NOT EXISTS (SELECT 1 FROM Permissions WHERE Name = 'Config.Manage');
INSERT INTO Permissions (Name, CreatedAt) SELECT 'Credit.Configure', GETDATE() WHERE NOT EXISTS (SELECT 1 FROM Permissions WHERE Name = 'Credit.Configure');
INSERT INTO Permissions (Name, CreatedAt) SELECT 'Offer.Manage', GETDATE() WHERE NOT EXISTS (SELECT 1 FROM Permissions WHERE Name = 'Offer.Manage');
INSERT INTO Permissions (Name, CreatedAt) SELECT 'System.Debug', GETDATE() WHERE NOT EXISTS (SELECT 1 FROM Permissions WHERE Name = 'System.Debug');
INSERT INTO Permissions (Name, CreatedAt) SELECT 'System.Configure', GETDATE() WHERE NOT EXISTS (SELECT 1 FROM Permissions WHERE Name = 'System.Configure');
INSERT INTO Permissions (Name, CreatedAt) SELECT 'Settings.Manage', GETDATE() WHERE NOT EXISTS (SELECT 1 FROM Permissions WHERE Name = 'Settings.Manage');
INSERT INTO Permissions (Name, CreatedAt) SELECT 'Support.View', GETDATE() WHERE NOT EXISTS (SELECT 1 FROM Permissions WHERE Name = 'Support.View');
INSERT INTO Permissions (Name, CreatedAt) SELECT 'Support.Chat', GETDATE() WHERE NOT EXISTS (SELECT 1 FROM Permissions WHERE Name = 'Support.Chat');
INSERT INTO Permissions (Name, CreatedAt) SELECT 'Admin.Access', GETDATE() WHERE NOT EXISTS (SELECT 1 FROM Permissions WHERE Name = 'Admin.Access');
INSERT INTO Permissions (Name, CreatedAt) SELECT 'Account.Audit', GETDATE() WHERE NOT EXISTS (SELECT 1 FROM Permissions WHERE Name = 'Account.Audit');
INSERT INTO Permissions (Name, CreatedAt) SELECT 'Resource.Action', GETDATE() WHERE NOT EXISTS (SELECT 1 FROM Permissions WHERE Name = 'Resource.Action');
INSERT INTO Permissions (Name, CreatedAt) SELECT 'Permission.Manage', GETDATE() WHERE NOT EXISTS (SELECT 1 FROM Permissions WHERE Name = 'Permission.Manage');

COMMIT TRANSACTION;

-- Verify all permissions
SELECT COUNT(*) as TotalPermissions FROM Permissions;
SELECT Name FROM Permissions ORDER BY Name;
