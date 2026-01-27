INSERT INTO ApplicationUsers (Id, Name, Email, Role, ClientType, CredibilityScore, WalletBalance) 
VALUES ('99999999-9999-9999-9999-999999999999','Test User','test@example.com','Client',0,100,100.00);
SELECT @@ROWCOUNT AS RowsInserted;
SELECT Id, Name, Email, ClientType, CredibilityScore, WalletBalance FROM ApplicationUsers WHERE Id='99999999-9999-9999-9999-999999999999';
