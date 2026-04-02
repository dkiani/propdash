"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card } from "@/components/ui/Card";

interface FoundAccount {
  id: string;
  name: string;
  firm: string;
  plan: string;
  accountType: "evaluation" | "funded";
}

interface PlanOption {
  value: string;
  label: string;
}

const FIRM_OPTIONS = [
  { value: "tradeify", label: "Tradeify" },
  { value: "apex", label: "Apex" },
  { value: "topstep", label: "TopStep" },
  { value: "other", label: "Other" },
];

const ACCOUNT_TYPE_OPTIONS = [
  { value: "evaluation", label: "Evaluation" },
  { value: "funded", label: "Funded" },
];

const STEPS = ["Welcome", "Connect", "Accounts", "Targets"];

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {STEPS.map((label, i) => (
        <div key={label} className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
              i < currentStep
                ? "bg-accent-gold text-bg-primary"
                : i === currentStep
                ? "bg-accent-gold text-bg-primary"
                : "bg-bg-elevated text-text-muted"
            }`}
          >
            {i < currentStep ? (
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : (
              i + 1
            )}
          </div>
          <span
            className={`text-xs hidden sm:inline ${
              i <= currentStep ? "text-text-primary" : "text-text-muted"
            }`}
          >
            {label}
          </span>
          {i < STEPS.length - 1 && (
            <div
              className={`w-8 h-px ${
                i < currentStep ? "bg-accent-gold" : "bg-border-subtle"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);

  // Step 1 — Connection state
  const [tvUsername, setTvUsername] = useState("");
  const [tvPassword, setTvPassword] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState("");
  const [verifySuccess, setVerifySuccess] = useState(false);
  const [foundAccounts, setFoundAccounts] = useState<FoundAccount[]>([]);
  const [connectionSaved, setConnectionSaved] = useState(false);

  // Step 2 — Account configuration
  const [accountConfigs, setAccountConfigs] = useState<
    Record<
      string,
      { firm: string; plan: string; accountType: string }
    >
  >({});
  const [planOptions, setPlanOptions] = useState<
    Record<string, PlanOption[]>
  >({});

  // Step 3 — Targets
  const [dailyProfitTarget, setDailyProfitTarget] = useState("");
  const [maxTradesPerDay, setMaxTradesPerDay] = useState("");
  const [stopAfterLosses, setStopAfterLosses] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function handleVerifyConnection() {
    setIsVerifying(true);
    setVerifyError("");
    setVerifySuccess(false);

    try {
      const res = await fetch("/api/connections/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: tvUsername, password: tvPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setVerifyError(data.error || "Verification failed. Check your credentials.");
        return;
      }

      setVerifySuccess(true);
      setFoundAccounts(data.accounts || []);

      // Initialize account configs
      const configs: Record<string, { firm: string; plan: string; accountType: string }> = {};
      (data.accounts || []).forEach((acc: FoundAccount) => {
        configs[acc.id] = { firm: "", plan: "", accountType: "evaluation" };
      });
      setAccountConfigs(configs);

      // Save the connection
      const saveRes = await fetch("/api/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: tvUsername, password: tvPassword }),
      });

      if (saveRes.ok) {
        setConnectionSaved(true);
      }
    } catch {
      setVerifyError("Network error. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  }

  async function handleFirmChange(accountId: string, firm: string) {
    setAccountConfigs((prev) => ({
      ...prev,
      [accountId]: { ...prev[accountId], firm, plan: "" },
    }));

    if (firm && firm !== "other") {
      try {
        const res = await fetch(`/api/plans?firm=${firm}`);
        if (res.ok) {
          const data = await res.json();
          setPlanOptions((prev) => ({
            ...prev,
            [accountId]: data.plans || [],
          }));
        }
      } catch {
        // TODO: Handle plan fetch failure
        setPlanOptions((prev) => ({
          ...prev,
          [accountId]: [
            { value: "50k", label: "50K Challenge" },
            { value: "100k", label: "100K Challenge" },
            { value: "150k", label: "150K Challenge" },
          ],
        }));
      }
    }
  }

  async function handleLaunchDashboard() {
    setIsSaving(true);

    try {
      // Save account configurations
      for (const [accountId, config] of Object.entries(accountConfigs)) {
        await fetch(`/api/accounts/${accountId}/configure`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(config),
        });
      }

      // Save targets/preferences
      await fetch("/api/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dailyProfitTarget: dailyProfitTarget
            ? parseFloat(dailyProfitTarget)
            : null,
          maxTradesPerDay: maxTradesPerDay
            ? parseInt(maxTradesPerDay, 10)
            : null,
          stopAfterConsecutiveLosses: stopAfterLosses
            ? parseInt(stopAfterLosses, 10)
            : null,
        }),
      });
    } catch (error) {
      console.error("Failed to save settings:", error);
    } finally {
      setIsSaving(false);
      router.push("/dashboard");
    }
  }

  return (
    <div className="w-full max-w-lg">
      <StepIndicator currentStep={currentStep} />

      {/* Step 0 — Welcome */}
      {currentStep === 0 && (
        <Card className="p-8 text-center">
          <div className="space-y-6">
            <div className="w-16 h-16 rounded-full bg-accent-gold-dim flex items-center justify-center mx-auto">
              <svg
                className="w-8 h-8 text-accent-gold"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-display font-bold text-text-primary">
              Welcome to PropDash
            </h1>
            <p className="text-text-secondary leading-relaxed">
              Track your prop firm accounts, monitor drawdown in real-time, and
              stay on top of your evaluation progress. Let&apos;s get your
              account connected in just a few steps.
            </p>
            <Button
              size="lg"
              onClick={() => setCurrentStep(1)}
              className="w-full"
            >
              Let&apos;s Get Started &rarr;
            </Button>
          </div>
        </Card>
      )}

      {/* Step 1 — Connect Tradovate */}
      {currentStep === 1 && (
        <Card className="p-8">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-display font-semibold text-text-primary mb-2">
                Connect Tradovate
              </h2>
              <p className="text-sm text-text-secondary">
                Sign in with your Tradovate credentials. We&apos;ll securely connect
                to pull your account data. Read-only — we never place trades.
              </p>
            </div>

            <div className="bg-bg-elevated rounded-lg p-4 space-y-3">
              <p className="text-xs text-text-muted uppercase tracking-wider font-medium">
                How it works
              </p>
              <ol className="text-sm text-text-secondary space-y-2 list-decimal list-inside">
                <li>Enter the same username and password you use to log into Tradovate</li>
                <li>We verify your credentials and find your accounts</li>
                <li>Your credentials are encrypted and stored securely (AES-256)</li>
                <li>PropDash syncs your balances and trades automatically</li>
              </ol>
            </div>

            <div className="space-y-4">
              <Input
                label="Tradovate Username"
                type="text"
                placeholder="Enter your Tradovate username"
                value={tvUsername}
                onChange={(e) => setTvUsername(e.target.value)}
              />
              <Input
                label="Tradovate Password"
                type="password"
                placeholder="Enter your Tradovate password"
                value={tvPassword}
                onChange={(e) => setTvPassword(e.target.value)}
              />
            </div>

            {verifyError && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-status-red/10 border border-status-red/20">
                <svg
                  className="w-5 h-5 text-status-red flex-shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-sm text-status-red">{verifyError}</p>
              </div>
            )}

            {verifySuccess && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-status-green/10 border border-status-green/20">
                <svg
                  className="w-5 h-5 text-status-green flex-shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <div>
                  <p className="text-sm text-status-green font-medium">
                    Connection verified!
                  </p>
                  <p className="text-xs text-text-muted mt-1">
                    Found {foundAccounts.length} account
                    {foundAccounts.length !== 1 ? "s" : ""}:
                  </p>
                  <ul className="text-xs text-text-secondary mt-1 space-y-0.5">
                    {foundAccounts.map((acc) => (
                      <li key={acc.id}>&bull; {acc.name}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <p className="text-xs text-text-muted">
              Your credentials are encrypted with AES-256 and never exposed to
              the browser. We only read account data — we cannot place trades.
            </p>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => setCurrentStep(0)}
                className="flex-1"
              >
                Back
              </Button>
              {verifySuccess && connectionSaved ? (
                <Button
                  onClick={() => setCurrentStep(2)}
                  className="flex-1"
                >
                  Continue &rarr;
                </Button>
              ) : (
                <Button
                  onClick={handleVerifyConnection}
                  isLoading={isVerifying}
                  disabled={!tvUsername || !tvPassword}
                  className="flex-1"
                >
                  Verify Connection &rarr;
                </Button>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Step 2 — Select Prop Firm & Plan */}
      {currentStep === 2 && (
        <Card className="p-8">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-display font-semibold text-text-primary mb-2">
                Configure Accounts
              </h2>
              <p className="text-sm text-text-secondary">
                Tell us about each account so we can track the correct drawdown
                rules and targets.
              </p>
            </div>

            <div className="space-y-6">
              {foundAccounts.map((acc) => (
                <div
                  key={acc.id}
                  className="bg-bg-elevated rounded-lg p-4 space-y-4"
                >
                  <p className="text-sm font-medium text-text-primary">
                    {acc.name}
                  </p>

                  <Select
                    label="Prop Firm"
                    options={FIRM_OPTIONS}
                    placeholder="Select firm..."
                    value={accountConfigs[acc.id]?.firm || ""}
                    onChange={(e) =>
                      handleFirmChange(acc.id, e.target.value)
                    }
                  />

                  <Select
                    label="Plan"
                    options={planOptions[acc.id] || []}
                    placeholder={
                      accountConfigs[acc.id]?.firm
                        ? "Select plan..."
                        : "Select a firm first"
                    }
                    value={accountConfigs[acc.id]?.plan || ""}
                    onChange={(e) =>
                      setAccountConfigs((prev) => ({
                        ...prev,
                        [acc.id]: { ...prev[acc.id], plan: e.target.value },
                      }))
                    }
                    disabled={!accountConfigs[acc.id]?.firm}
                  />

                  <Select
                    label="Account Type"
                    options={ACCOUNT_TYPE_OPTIONS}
                    value={accountConfigs[acc.id]?.accountType || "evaluation"}
                    onChange={(e) =>
                      setAccountConfigs((prev) => ({
                        ...prev,
                        [acc.id]: {
                          ...prev[acc.id],
                          accountType: e.target.value,
                        },
                      }))
                    }
                  />
                </div>
              ))}
            </div>

            {foundAccounts.length === 0 && (
              <div className="text-center py-8 text-text-muted">
                <p className="text-sm">No accounts found.</p>
                <p className="text-xs mt-1">
                  Go back and verify your connection.
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => setCurrentStep(1)}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={() => setCurrentStep(3)}
                disabled={
                  foundAccounts.length > 0 &&
                  !Object.values(accountConfigs).every(
                    (c) => c.firm && c.accountType
                  )
                }
                className="flex-1"
              >
                Continue &rarr;
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Step 3 — Set Targets */}
      {currentStep === 3 && (
        <Card className="p-8">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-display font-semibold text-text-primary mb-2">
                Set Your Targets
              </h2>
              <p className="text-sm text-text-secondary">
                Configure your daily trading guardrails. These can be changed
                later in Settings.
              </p>
            </div>

            <div className="space-y-4">
              <Input
                label="Daily Profit Target ($)"
                type="number"
                placeholder="e.g. 500"
                value={dailyProfitTarget}
                onChange={(e) => setDailyProfitTarget(e.target.value)}
              />
              <Input
                label="Max Trades Per Day"
                type="number"
                placeholder="e.g. 5"
                value={maxTradesPerDay}
                onChange={(e) => setMaxTradesPerDay(e.target.value)}
              />
              <Input
                label="Stop After X Consecutive Losses"
                type="number"
                placeholder="e.g. 3"
                value={stopAfterLosses}
                onChange={(e) => setStopAfterLosses(e.target.value)}
              />
            </div>

            <p className="text-xs text-text-muted">
              All fields are optional. You can always adjust these from the
              Settings page.
            </p>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => setCurrentStep(2)}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={handleLaunchDashboard}
                isLoading={isSaving}
                className="flex-1"
              >
                Launch Dashboard &rarr;
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
