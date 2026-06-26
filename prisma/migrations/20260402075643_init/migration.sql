-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dailyProfitTarget" DOUBLE PRECISION,
    "maxTradesPerDay" INTEGER,
    "stopAfterConsecLoss" INTEGER DEFAULT 2,
    "emailWrapped" BOOLEAN NOT NULL DEFAULT true,
    "timezone" TEXT NOT NULL DEFAULT 'America/New_York',

    CONSTRAINT "UserSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrokerConnection" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "broker" TEXT NOT NULL,
    "apiKeyEncrypted" TEXT NOT NULL,
    "apiSecEncrypted" TEXT NOT NULL,
    "isValid" BOOLEAN NOT NULL DEFAULT true,
    "lastSyncAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BrokerConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropFirmPlan" (
    "id" TEXT NOT NULL,
    "firmName" TEXT NOT NULL,
    "planName" TEXT NOT NULL,
    "startingBalance" DOUBLE PRECISION NOT NULL,
    "drawdownType" TEXT NOT NULL,
    "maxDrawdown" DOUBLE PRECISION NOT NULL,
    "profitTarget" DOUBLE PRECISION,
    "minTradingDays" INTEGER,
    "consistencyRuleType" TEXT,
    "consistencyValue" DOUBLE PRECISION,
    "maxDailyLoss" DOUBLE PRECISION,
    "maxContracts" INTEGER,
    "payoutThreshold" DOUBLE PRECISION,
    "payoutSchedule" TEXT,
    "minPayoutDays" INTEGER,
    "isCustom" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PropFirmPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropAccount" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "connectionId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "externalAccountId" TEXT NOT NULL,
    "accountName" TEXT,
    "accountType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "currentBalance" DOUBLE PRECISION NOT NULL,
    "highWaterMark" DOUBLE PRECISION NOT NULL,
    "drawdownFloor" DOUBLE PRECISION NOT NULL,
    "drawdownRemaining" DOUBLE PRECISION NOT NULL,
    "tradingDaysCount" INTEGER NOT NULL DEFAULT 0,
    "lastSyncAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PropAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trade" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "externalFillId" TEXT NOT NULL,
    "instrument" TEXT NOT NULL,
    "side" TEXT NOT NULL,
    "entryPrice" DOUBLE PRECISION NOT NULL,
    "exitPrice" DOUBLE PRECISION,
    "quantity" INTEGER NOT NULL,
    "realizedPnl" DOUBLE PRECISION,
    "commission" DOUBLE PRECISION,
    "entryTime" TIMESTAMP(3) NOT NULL,
    "exitTime" TIMESTAMP(3),
    "duration" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Trade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailySnapshot" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "openBalance" DOUBLE PRECISION NOT NULL,
    "closeBalance" DOUBLE PRECISION NOT NULL,
    "highBalance" DOUBLE PRECISION NOT NULL,
    "lowBalance" DOUBLE PRECISION NOT NULL,
    "dailyPnl" DOUBLE PRECISION NOT NULL,
    "tradeCount" INTEGER NOT NULL,
    "winCount" INTEGER NOT NULL,
    "lossCount" INTEGER NOT NULL,
    "drawdownFloor" DOUBLE PRECISION NOT NULL,
    "drawdownRemaining" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "DailySnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoutineEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "mood" TEXT NOT NULL,
    "sleep" TEXT NOT NULL,
    "outsideStress" TEXT NOT NULL,
    "journal" TEXT,
    "rulesCommitted" BOOLEAN NOT NULL DEFAULT false,
    "breathworkDone" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "RoutineEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserSettings_userId_key" ON "UserSettings"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PropFirmPlan_firmName_planName_key" ON "PropFirmPlan"("firmName", "planName");

-- CreateIndex
CREATE UNIQUE INDEX "Trade_externalFillId_key" ON "Trade"("externalFillId");

-- CreateIndex
CREATE UNIQUE INDEX "DailySnapshot_accountId_date_key" ON "DailySnapshot"("accountId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "RoutineEntry_userId_date_key" ON "RoutineEntry"("userId", "date");

-- AddForeignKey
ALTER TABLE "UserSettings" ADD CONSTRAINT "UserSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrokerConnection" ADD CONSTRAINT "BrokerConnection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropAccount" ADD CONSTRAINT "PropAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropAccount" ADD CONSTRAINT "PropAccount_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "BrokerConnection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropAccount" ADD CONSTRAINT "PropAccount_planId_fkey" FOREIGN KEY ("planId") REFERENCES "PropFirmPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "PropAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailySnapshot" ADD CONSTRAINT "DailySnapshot_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "PropAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoutineEntry" ADD CONSTRAINT "RoutineEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
