"use client";

import { useState, useEffect } from "react";

interface RoutineEntry {
  id: string;
  date: string;
  mood: string;
  sleep: string;
  outsideStress: string;
  journal: string | null;
  rulesCommitted: boolean;
  breathworkDone: boolean;
  completedAt: string | null;
}

export function useRoutine() {
  const [todayEntry, setTodayEntry] = useState<RoutineEntry | null>(null);
  const [streak, setStreak] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchRoutineData() {
      try {
        const [todayRes, streakRes] = await Promise.all([
          fetch("/api/routine/today"),
          fetch("/api/routine/streak"),
        ]);

        if (todayRes.ok) {
          const data = await todayRes.json();
          setTodayEntry(data.entry || null);
        }

        if (streakRes.ok) {
          const data = await streakRes.json();
          setStreak(data.streak);
        }
      } catch (error) {
        console.error("Failed to fetch routine data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchRoutineData();
  }, []);

  const saveEntry = async (entry: Omit<RoutineEntry, "id" | "date" | "completedAt">) => {
    const res = await fetch("/api/routine", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry),
    });

    if (res.ok) {
      const data = await res.json();
      setTodayEntry(data.entry);
      setStreak((s) => s + 1);
      return true;
    }
    return false;
  };

  return { todayEntry, streak, isLoading, saveEntry, isCompleted: !!todayEntry };
}
