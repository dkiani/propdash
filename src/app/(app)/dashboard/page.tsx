"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useDashboardStore } from "@/stores/dashboardStore";
import { PortfolioOverview } from "@/components/dashboard/PortfolioOverview";
import { AccountCard } from "@/components/dashboard/AccountCard";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";

export default function DashboardPage() {
  const { accounts, isLoading, setAccounts, setLoading } = useDashboardStore();

  useEffect(() => {
    async function fetchAccounts() {
      try {
        const res = await fetch("/api/accounts");
        if (res.ok) {
          const data = await res.json();
          setAccounts(data);
        }
      } catch (error) {
        console.error("Failed to fetch accounts:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchAccounts();
  }, [setAccounts, setLoading]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SkeletonCard />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full text-center">
          <CardContent className="py-12 space-y-4">
            <p className="text-lg font-medium text-text-primary">
              No accounts connected yet
            </p>
            <p className="text-sm text-text-muted">
              Connect your prop firm account to start tracking your drawdown and performance.
            </p>
            <Link href="/onboarding">
              <Button variant="primary" size="lg">
                Get Started
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PortfolioOverview />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {accounts.map((account) => (
          <AccountCard key={account.id} account={account} />
        ))}
      </div>
    </div>
  );
}
