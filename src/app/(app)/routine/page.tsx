"use client";

import { useEffect, useState } from "react";
import { PreMarketRoutine } from "@/components/routine/PreMarketRoutine";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function RoutinePage() {
  const [todayCompleted, setTodayCompleted] = useState<boolean | null>(null);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    async function checkRoutine() {
      try {
        const res = await fetch("/api/routine/today");
        if (res.ok) {
          const data = await res.json();
          setTodayCompleted(!!data.entry);
        } else {
          setTodayCompleted(false);
        }

        const streakRes = await fetch("/api/routine/streak");
        if (streakRes.ok) {
          const streakData = await streakRes.json();
          setStreak(streakData.streak);
        }
      } catch {
        setTodayCompleted(false);
      }
    }
    checkRoutine();
  }, []);

  if (todayCompleted === null) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-text-muted">Loading...</p>
      </div>
    );
  }

  if (todayCompleted) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-3">
          <h1 className="font-display text-3xl text-text-primary">Routine Complete</h1>
          <p className="text-text-secondary">
            You&apos;ve already completed today&apos;s pre-market routine.
          </p>
          {streak > 0 && (
            <p className="text-accent-gold font-mono text-lg">{streak} day streak</p>
          )}
        </div>
        <Card>
          <CardContent className="flex justify-center">
            <Button variant="secondary" onClick={() => setTodayCompleted(false)}>
              Redo Routine
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <PreMarketRoutine onComplete={() => setTodayCompleted(true)} />
    </div>
  );
}
