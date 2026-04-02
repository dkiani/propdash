"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { StatusIndicator } from "@/components/ui/StatusIndicator";
import { ProgressBar } from "@/components/ui/ProgressBar";

type Mood = "Frustrated" | "Anxious" | "Neutral" | "Calm" | "Locked In";
type SleepQuality = "Under 5h" | "5-6h" | "6-7h" | "7+h";

interface Account {
  id: string;
  name: string;
  drawdownRemaining: number;
  maxDrawdown: number;
  health: "healthy" | "caution" | "danger" | "critical";
}

interface RoutineData {
  mood: Mood | null;
  sleep: SleepQuality | null;
  outsideStress: boolean | null;
  rulesCommitted: boolean;
  journal: string;
}

interface PreMarketRoutineProps {
  onComplete: () => void;
  accounts?: Account[];
  rules?: {
    dailyTarget: number;
    maxTrades: number;
    stopAfterLosses: number;
  };
}

const STEPS = [
  "Check In",
  "Account Awareness",
  "Adaptive Insights",
  "Breathwork",
  "Rules & Commitment",
  "Journal",
  "Summary",
];

const MOODS: Mood[] = ["Frustrated", "Anxious", "Neutral", "Calm", "Locked In"];
const MOOD_ICONS: Record<Mood, string> = {
  Frustrated: "\uD83D\uDE24",
  Anxious: "\uD83D\uDE1F",
  Neutral: "\uD83D\uDE10",
  Calm: "\uD83D\uDE0C",
  "Locked In": "\uD83C\uDFAF",
};

const SLEEP_OPTIONS: SleepQuality[] = ["Under 5h", "5-6h", "6-7h", "7+h"];

const DEFAULT_ACCOUNTS: Account[] = [
  { id: "1", name: "FTMO Challenge", drawdownRemaining: 72, maxDrawdown: 100, health: "healthy" },
  { id: "2", name: "MFF Funded", drawdownRemaining: 25, maxDrawdown: 100, health: "danger" },
];

const DEFAULT_RULES = {
  dailyTarget: 500,
  maxTrades: 5,
  stopAfterLosses: 2,
};

function StepIndicator({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  return (
    <div className="flex items-center gap-1 mb-8">
      {Array.from({ length: totalSteps }).map((_, i) => (
        <div key={i} className="flex-1 flex items-center">
          <div
            className={`h-1.5 w-full rounded-full transition-colors duration-300 ${
              i <= currentStep ? "bg-accent-gold" : "bg-bg-elevated"
            }`}
          />
        </div>
      ))}
    </div>
  );
}

function BreathworkExercise({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<"idle" | "inhale" | "hold" | "exhale" | "done">("idle");
  const [round, setRound] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const INHALE = 4;
  const HOLD = 7;
  const EXHALE = 8;
  const TOTAL_ROUNDS = 3;

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTimer((prev) => {
        const next = prev + 1;

        if (phase === "inhale" && next >= INHALE) {
          setPhase("hold");
          return 0;
        }
        if (phase === "hold" && next >= HOLD) {
          setPhase("exhale");
          return 0;
        }
        if (phase === "exhale" && next >= EXHALE) {
          const nextRound = round + 1;
          if (nextRound >= TOTAL_ROUNDS) {
            setPhase("done");
            setIsRunning(false);
            return 0;
          }
          setRound(nextRound);
          setPhase("inhale");
          return 0;
        }

        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, phase, round]);

  const start = () => {
    setPhase("inhale");
    setRound(0);
    setTimer(0);
    setIsRunning(true);
  };

  const getCircleScale = () => {
    if (phase === "inhale") return 1 + (timer / INHALE) * 0.5;
    if (phase === "hold") return 1.5;
    if (phase === "exhale") return 1.5 - (timer / EXHALE) * 0.5;
    return 1;
  };

  const getPhaseLabel = () => {
    if (phase === "inhale") return `Inhale... ${INHALE - timer}`;
    if (phase === "hold") return `Hold... ${HOLD - timer}`;
    if (phase === "exhale") return `Exhale... ${EXHALE - timer}`;
    if (phase === "done") return "Complete";
    return "Ready";
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <p className="text-text-secondary text-sm text-center">
        4-7-8 breathing technique. {TOTAL_ROUNDS} rounds.
      </p>

      <div className="relative flex items-center justify-center h-48 w-48">
        <div
          className="absolute rounded-full bg-accent-gold/20 border-2 border-accent-gold/40 transition-transform duration-1000 ease-in-out"
          style={{
            width: "100px",
            height: "100px",
            transform: `scale(${getCircleScale()})`,
          }}
        />
        <span className="relative text-text-primary font-mono text-sm z-10">
          {getPhaseLabel()}
        </span>
      </div>

      {isRunning && (
        <p className="text-text-muted text-xs font-mono">
          Round {round + 1} of {TOTAL_ROUNDS}
        </p>
      )}

      {phase === "idle" && (
        <Button onClick={start}>Start Breathing Exercise</Button>
      )}

      {phase === "done" && (
        <div className="text-center space-y-3">
          <p className="text-status-green font-medium">Well done. You&apos;re centered.</p>
          <Button onClick={onComplete}>Continue</Button>
        </div>
      )}
    </div>
  );
}

export function PreMarketRoutine({
  onComplete,
  accounts = DEFAULT_ACCOUNTS,
  rules = DEFAULT_RULES,
}: PreMarketRoutineProps) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<RoutineData>({
    mood: null,
    sleep: null,
    outsideStress: null,
    rulesCommitted: false,
    journal: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [breathworkDone, setBreathworkDone] = useState(false);

  const canProceed = useCallback(() => {
    switch (step) {
      case 0:
        return data.mood !== null && data.sleep !== null && data.outsideStress !== null;
      case 1:
        return true;
      case 2:
        return true;
      case 3:
        return breathworkDone;
      case 4:
        return data.rulesCommitted;
      case 5:
        return true;
      case 6:
        return true;
      default:
        return false;
    }
  }, [step, data, breathworkDone]);

  const nextStep = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 0) setStep(step - 1);
  };

  const getInsights = () => {
    const insights: string[] = [];
    if (data.mood === "Frustrated" || data.mood === "Anxious") {
      insights.push("Consider sitting out today or trading with reduced size.");
    }
    if (data.sleep === "Under 5h" || data.sleep === "5-6h") {
      insights.push("Sleep deprivation impacts decision-making. Trade cautiously.");
    }
    if (data.outsideStress) {
      insights.push("External stress can leak into your trading. Stay aware.");
    }
    accounts.forEach((acc) => {
      if (acc.drawdownRemaining < 30) {
        insights.push(
          `Account "${acc.name}" is in the danger zone. Consider not trading this account today.`
        );
      }
    });
    if (insights.length === 0) {
      insights.push("You're in a solid position. Stick to your plan.");
    }
    return insights;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await fetch("/api/routine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mood: data.mood,
          sleep: data.sleep,
          outsideStress: data.outsideStress,
          rulesCommitted: data.rulesCommitted,
          journal: data.journal,
          completedAt: new Date().toISOString(),
        }),
      });
      setCompleted(true);
      setTimeout(() => onComplete(), 2000);
    } catch {
      // Silently handle - still mark as complete locally
      setCompleted(true);
      setTimeout(() => onComplete(), 2000);
    } finally {
      setSubmitting(false);
    }
  };

  if (completed) {
    return (
      <div className="text-center space-y-4 py-12">
        <div className="text-5xl mb-4">
          {["*", "*", "*", "*", "*"].map((s, i) => (
            <span
              key={i}
              className="inline-block text-accent-gold animate-bounce"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              {s}
            </span>
          ))}
        </div>
        <h2 className="font-display text-2xl text-text-primary">Routine Complete!</h2>
        <p className="text-text-secondary">You&apos;re ready to trade with discipline today.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-text-primary mb-1">Pre-Market Routine</h1>
        <p className="text-text-muted text-sm">
          Step {step + 1} of {STEPS.length}: {STEPS[step]}
        </p>
      </div>

      <StepIndicator currentStep={step} totalSteps={STEPS.length} />

      {/* Step 0: Check In */}
      {step === 0 && (
        <Card>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-text-primary font-medium mb-3">How are you feeling?</h3>
              <div className="flex flex-wrap gap-2">
                {MOODS.map((mood) => (
                  <button
                    key={mood}
                    onClick={() => setData({ ...data, mood })}
                    className={`px-4 py-2 rounded-lg border text-sm transition-colors ${
                      data.mood === mood
                        ? "bg-accent-gold-dim border-accent-gold text-accent-gold"
                        : "bg-bg-elevated border-border-default text-text-secondary hover:border-border-default hover:text-text-primary"
                    }`}
                  >
                    {MOOD_ICONS[mood]} {mood}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-text-primary font-medium mb-3">Sleep quality</h3>
              <div className="flex flex-wrap gap-2">
                {SLEEP_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setData({ ...data, sleep: opt })}
                    className={`px-4 py-2 rounded-lg border text-sm transition-colors ${
                      data.sleep === opt
                        ? "bg-accent-gold-dim border-accent-gold text-accent-gold"
                        : "bg-bg-elevated border-border-default text-text-secondary hover:border-border-default hover:text-text-primary"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-text-primary font-medium mb-3">Outside stress today?</h3>
              <div className="flex gap-2">
                {[
                  { label: "Yes", value: true },
                  { label: "No", value: false },
                ].map(({ label, value }) => (
                  <button
                    key={label}
                    onClick={() => setData({ ...data, outsideStress: value })}
                    className={`px-6 py-2 rounded-lg border text-sm transition-colors ${
                      data.outsideStress === value
                        ? "bg-accent-gold-dim border-accent-gold text-accent-gold"
                        : "bg-bg-elevated border-border-default text-text-secondary hover:border-border-default hover:text-text-primary"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 1: Account Awareness */}
      {step === 1 && (
        <Card>
          <CardContent className="space-y-4">
            <p className="text-text-secondary text-sm italic">
              Take a moment to acknowledge where each account stands.
            </p>
            <div className="space-y-3">
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className="flex items-center justify-between p-4 bg-bg-elevated rounded-lg border border-border-subtle"
                >
                  <div className="space-y-1">
                    <p className="text-text-primary font-medium">{account.name}</p>
                    <StatusIndicator status={account.health} />
                  </div>
                  <div className="text-right space-y-1">
                    <p className="font-mono text-text-primary">
                      {account.drawdownRemaining}%
                    </p>
                    <p className="text-xs text-text-muted">drawdown remaining</p>
                    <ProgressBar
                      value={account.drawdownRemaining}
                      color={
                        account.drawdownRemaining > 60
                          ? "green"
                          : account.drawdownRemaining > 30
                          ? "yellow"
                          : "red"
                      }
                      size="sm"
                      className="w-24"
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Adaptive Insights */}
      {step === 2 && (
        <Card>
          <CardContent className="space-y-4">
            <h3 className="text-text-primary font-medium">Your Insights for Today</h3>
            <div className="space-y-3">
              {getInsights().map((insight, i) => {
                const isPositive = insight.includes("solid position");
                return (
                  <div
                    key={i}
                    className={`p-4 rounded-lg border ${
                      isPositive
                        ? "bg-status-green/5 border-status-green/20"
                        : "bg-status-yellow/5 border-status-yellow/20"
                    }`}
                  >
                    <p
                      className={`text-sm ${
                        isPositive ? "text-status-green" : "text-status-yellow"
                      }`}
                    >
                      {insight}
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Breathwork */}
      {step === 3 && (
        <Card>
          <CardContent>
            <h3 className="text-text-primary font-medium mb-4 text-center">Breathwork</h3>
            <BreathworkExercise onComplete={() => setBreathworkDone(true)} />
            {breathworkDone && (
              <p className="text-center text-status-green text-sm mt-4">
                Breathwork complete
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 4: Rules & Commitment */}
      {step === 4 && (
        <Card>
          <CardContent className="space-y-4">
            <h3 className="text-text-primary font-medium">Your Trading Rules</h3>
            <div className="space-y-3">
              <div className="flex justify-between p-3 bg-bg-elevated rounded-lg">
                <span className="text-text-secondary text-sm">Daily Profit Target</span>
                <span className="text-text-primary font-mono">${rules.dailyTarget}</span>
              </div>
              <div className="flex justify-between p-3 bg-bg-elevated rounded-lg">
                <span className="text-text-secondary text-sm">Max Trades Per Day</span>
                <span className="text-text-primary font-mono">{rules.maxTrades}</span>
              </div>
              <div className="flex justify-between p-3 bg-bg-elevated rounded-lg">
                <span className="text-text-secondary text-sm">Stop After Consecutive Losses</span>
                <span className="text-text-primary font-mono">{rules.stopAfterLosses}</span>
              </div>
            </div>
            <label className="flex items-center gap-3 p-4 bg-bg-elevated rounded-lg border border-border-subtle cursor-pointer">
              <input
                type="checkbox"
                checked={data.rulesCommitted}
                onChange={(e) => setData({ ...data, rulesCommitted: e.target.checked })}
                className="h-5 w-5 rounded accent-accent-gold"
              />
              <span className="text-text-primary text-sm font-medium">
                I commit to following these rules today.
              </span>
            </label>
          </CardContent>
        </Card>
      )}

      {/* Step 5: Journal */}
      {step === 5 && (
        <Card>
          <CardContent className="space-y-4">
            <h3 className="text-text-primary font-medium">Morning Journal</h3>
            <p className="text-text-muted text-sm">Optional but encouraged.</p>
            <textarea
              value={data.journal}
              onChange={(e) => setData({ ...data, journal: e.target.value })}
              placeholder="What's your plan for today? Any setups you're watching?"
              rows={6}
              className="w-full px-3 py-2 bg-bg-elevated border border-border-default rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-gold/50 focus:border-accent-gold transition-colors resize-none"
            />
          </CardContent>
        </Card>
      )}

      {/* Step 6: Summary */}
      {step === 6 && (
        <Card>
          <CardContent className="space-y-4">
            <h3 className="text-text-primary font-medium">Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between p-3 bg-bg-elevated rounded-lg">
                <span className="text-text-muted">Mood</span>
                <span className="text-text-primary">{data.mood}</span>
              </div>
              <div className="flex justify-between p-3 bg-bg-elevated rounded-lg">
                <span className="text-text-muted">Sleep</span>
                <span className="text-text-primary">{data.sleep}</span>
              </div>
              <div className="flex justify-between p-3 bg-bg-elevated rounded-lg">
                <span className="text-text-muted">Outside Stress</span>
                <span className="text-text-primary">{data.outsideStress ? "Yes" : "No"}</span>
              </div>
              <div className="flex justify-between p-3 bg-bg-elevated rounded-lg">
                <span className="text-text-muted">Rules Committed</span>
                <span className="text-status-green">Yes</span>
              </div>
              {data.journal && (
                <div className="p-3 bg-bg-elevated rounded-lg">
                  <span className="text-text-muted block mb-1">Journal</span>
                  <p className="text-text-primary whitespace-pre-wrap">{data.journal}</p>
                </div>
              )}
            </div>
            <Button
              onClick={handleSubmit}
              isLoading={submitting}
              className="w-full"
              size="lg"
            >
              Complete Routine
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      {step !== 6 && (
        <div className="flex justify-between">
          <Button variant="ghost" onClick={prevStep} disabled={step === 0}>
            Back
          </Button>
          <Button onClick={nextStep} disabled={!canProceed()}>
            {step === STEPS.length - 2 ? "Review" : "Next"}
          </Button>
        </div>
      )}
    </div>
  );
}
