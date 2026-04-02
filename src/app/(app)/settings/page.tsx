"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { StatusIndicator } from "@/components/ui/StatusIndicator";

interface ProfileSettings {
  name: string;
  email: string;
  timezone: string;
}

interface TradingRules {
  dailyTarget: number;
  maxTrades: number;
  stopAfterLosses: number;
}

interface ConnectedAccount {
  id: string;
  broker: string;
  accountName: string;
  status: "healthy" | "caution" | "danger" | "offline" | "syncing";
}

interface SettingsData {
  profile: ProfileSettings;
  tradingRules: TradingRules;
  connectedAccounts: ConnectedAccount[];
  plan: "free" | "pro";
}

const TIMEZONES = [
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "America/Phoenix", label: "Arizona (MST)" },
  { value: "Europe/London", label: "London (GMT/BST)" },
  { value: "Europe/Berlin", label: "Central European (CET)" },
  { value: "Asia/Tokyo", label: "Japan (JST)" },
  { value: "Asia/Singapore", label: "Singapore (SGT)" },
  { value: "Australia/Sydney", label: "Sydney (AEST)" },
];

const DEFAULT_SETTINGS: SettingsData = {
  profile: {
    name: "Trader",
    email: "trader@example.com",
    timezone: "America/New_York",
  },
  tradingRules: {
    dailyTarget: 500,
    maxTrades: 5,
    stopAfterLosses: 2,
  },
  connectedAccounts: [
    {
      id: "1",
      broker: "FTMO",
      accountName: "FTMO Challenge #1234",
      status: "healthy",
    },
    {
      id: "2",
      broker: "MyForexFunds",
      accountName: "MFF Funded #5678",
      status: "syncing",
    },
  ],
  plan: "free",
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsData>(DEFAULT_SETTINGS);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingRules, setSavingRules] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [rulesSaved, setRulesSaved] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          setSettings(data);
        }
      } catch {
        // Use defaults
      }
    }
    loadSettings();
  }, []);

  const saveProfile = async () => {
    setSavingProfile(true);
    setProfileSaved(false);
    try {
      await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile: settings.profile }),
      });
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    } catch {
      // Handle silently
    } finally {
      setSavingProfile(false);
    }
  };

  const saveRules = async () => {
    setSavingRules(true);
    setRulesSaved(false);
    try {
      await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tradingRules: settings.tradingRules }),
      });
      setRulesSaved(true);
      setTimeout(() => setRulesSaved(false), 3000);
    } catch {
      // Handle silently
    } finally {
      setSavingRules(false);
    }
  };

  const removeAccount = async (id: string) => {
    try {
      await fetch(`/api/connections/${id}`, { method: "DELETE" });
      setSettings((prev) => ({
        ...prev,
        connectedAccounts: prev.connectedAccounts.filter((a) => a.id !== id),
      }));
    } catch {
      // Handle silently
    }
  };

  const deleteAccount = async () => {
    try {
      await fetch("/api/account", { method: "DELETE" });
      window.location.href = "/";
    } catch {
      // Handle silently
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="font-display text-3xl text-text-primary">Settings</h1>

      {/* Profile */}
      <Card>
        <CardHeader>
          <h2 className="text-text-primary font-medium">Profile</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Name"
            value={settings.profile.name}
            onChange={(e) =>
              setSettings((prev) => ({
                ...prev,
                profile: { ...prev.profile, name: e.target.value },
              }))
            }
          />
          <Input
            label="Email"
            value={settings.profile.email}
            readOnly
            className="opacity-60 cursor-not-allowed"
          />
          <Select
            label="Timezone"
            options={TIMEZONES}
            value={settings.profile.timezone}
            onChange={(e) =>
              setSettings((prev) => ({
                ...prev,
                profile: { ...prev.profile, timezone: e.target.value },
              }))
            }
          />
          <div className="flex items-center gap-3">
            <Button onClick={saveProfile} isLoading={savingProfile}>
              Save Profile
            </Button>
            {profileSaved && (
              <span className="text-status-green text-sm">Saved</span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Trading Rules */}
      <Card>
        <CardHeader>
          <h2 className="text-text-primary font-medium">Trading Rules</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Daily Profit Target ($)"
            type="number"
            min={0}
            value={settings.tradingRules.dailyTarget}
            onChange={(e) =>
              setSettings((prev) => ({
                ...prev,
                tradingRules: {
                  ...prev.tradingRules,
                  dailyTarget: Number(e.target.value),
                },
              }))
            }
          />
          <Input
            label="Max Trades Per Day"
            type="number"
            min={1}
            value={settings.tradingRules.maxTrades}
            onChange={(e) =>
              setSettings((prev) => ({
                ...prev,
                tradingRules: {
                  ...prev.tradingRules,
                  maxTrades: Number(e.target.value),
                },
              }))
            }
          />
          <Input
            label="Stop After Consecutive Losses"
            type="number"
            min={1}
            value={settings.tradingRules.stopAfterLosses}
            onChange={(e) =>
              setSettings((prev) => ({
                ...prev,
                tradingRules: {
                  ...prev.tradingRules,
                  stopAfterLosses: Number(e.target.value),
                },
              }))
            }
          />
          <div className="flex items-center gap-3">
            <Button onClick={saveRules} isLoading={savingRules}>
              Save Rules
            </Button>
            {rulesSaved && (
              <span className="text-status-green text-sm">Saved</span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Connected Accounts */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-text-primary font-medium">Connected Accounts</h2>
            <Button size="sm" variant="secondary">
              Add Connection
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {settings.connectedAccounts.length === 0 ? (
            <p className="text-text-muted text-sm py-4 text-center">
              No accounts connected. Add a broker connection to get started.
            </p>
          ) : (
            settings.connectedAccounts.map((account) => (
              <div
                key={account.id}
                className="flex items-center justify-between p-4 bg-bg-elevated rounded-lg border border-border-subtle"
              >
                <div className="space-y-1">
                  <p className="text-text-primary font-medium text-sm">
                    {account.accountName}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-text-muted text-xs">{account.broker}</span>
                    <StatusIndicator status={account.status} />
                  </div>
                </div>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => removeAccount(account.id)}
                >
                  Remove
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Plan & Billing */}
      <Card>
        <CardHeader>
          <h2 className="text-text-primary font-medium">Plan & Billing</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-bg-elevated rounded-lg">
            <div className="flex items-center gap-3">
              <span className="text-text-primary font-medium">Current Plan</span>
              <Badge variant={settings.plan === "pro" ? "gold" : "default"}>
                {settings.plan === "pro" ? "Pro" : "Free"}
              </Badge>
            </div>
            {settings.plan !== "pro" && (
              <Button size="sm">Upgrade to Pro</Button>
            )}
          </div>
          {settings.plan === "pro" && (
            <p className="text-text-muted text-xs">
              You are on the Pro plan. Manage your subscription in the billing portal.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card health="danger">
        <CardHeader>
          <h2 className="text-status-red font-medium">Danger Zone</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-text-secondary text-sm">
            Permanently delete your account and all associated data. This action cannot
            be undone.
          </p>
          {!showDeleteConfirm ? (
            <Button variant="danger" onClick={() => setShowDeleteConfirm(true)}>
              Delete Account
            </Button>
          ) : (
            <div className="flex items-center gap-3">
              <Button variant="danger" onClick={deleteAccount}>
                Yes, Delete My Account
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
