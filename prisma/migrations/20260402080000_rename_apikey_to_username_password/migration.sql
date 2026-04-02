-- Rename apiKeyEncrypted to usernameEncrypted
ALTER TABLE "BrokerConnection" RENAME COLUMN "apiKeyEncrypted" TO "usernameEncrypted";

-- Rename apiSecEncrypted to passwordEncrypted
ALTER TABLE "BrokerConnection" RENAME COLUMN "apiSecEncrypted" TO "passwordEncrypted";
