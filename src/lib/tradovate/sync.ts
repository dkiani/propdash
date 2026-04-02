import { prisma } from "../db";
import { TradovateClient } from "./client";
import { calculateDrawdown } from "../drawdown";

export async function syncAccount(accountId: string): Promise<void> {
  const account = await prisma.propAccount.findUnique({
    where: { id: accountId },
    include: {
      connection: true,
      plan: true,
    },
  });

  if (!account) throw new Error(`Account ${accountId} not found`);

  const client = new TradovateClient(
    account.connection.usernameEncrypted,
    account.connection.passwordEncrypted
  );

  try {
    // Fetch current balance
    const cashBalance = await client.getCashBalance(
      parseInt(account.externalAccountId)
    );

    const currentBalance = cashBalance.amount;

    // Calculate drawdown
    const drawdown = calculateDrawdown({
      drawdownType: account.plan.drawdownType as "trailing" | "eod" | "static",
      startingBalance: account.plan.startingBalance,
      maxDrawdown: account.plan.maxDrawdown,
      currentBalance,
      highWaterMark: account.highWaterMark,
    });

    // Fetch recent fills
    const fills = await client.getFills(parseInt(account.externalAccountId));

    // Store new fills (dedup by externalFillId)
    for (const fill of fills) {
      const fillId = fill.id.toString();
      const existing = await prisma.trade.findUnique({
        where: { externalFillId: fillId },
      });

      if (!existing) {
        await prisma.trade.create({
          data: {
            accountId: account.id,
            externalFillId: fillId,
            instrument: `Contract-${fill.contractId}`, // TODO: resolve contract name
            side: fill.action === "Buy" ? "long" : "short",
            entryPrice: fill.price,
            quantity: fill.qty,
            entryTime: new Date(fill.timestamp),
            createdAt: new Date(),
          },
        });
      }
    }

    // Update account
    await prisma.propAccount.update({
      where: { id: accountId },
      data: {
        currentBalance,
        highWaterMark: drawdown.highWaterMark,
        drawdownFloor: drawdown.drawdownFloor,
        drawdownRemaining: drawdown.drawdownRemaining,
        lastSyncAt: new Date(),
      },
    });
  } catch (error) {
    console.error(`Sync failed for account ${accountId}:`, error);
    throw error;
  }
}

export async function syncAllAccounts(userId: string): Promise<void> {
  const accounts = await prisma.propAccount.findMany({
    where: { userId, status: "active" },
  });

  const results = await Promise.allSettled(
    accounts.map((account) => syncAccount(account.id))
  );

  const failures = results.filter((r) => r.status === "rejected");
  if (failures.length > 0) {
    console.error(`${failures.length}/${accounts.length} account syncs failed`);
  }
}
