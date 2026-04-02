import { create } from "zustand";

interface Account {
  id: string;
  accountName: string | null;
  accountType: string;
  status: string;
  currentBalance: number;
  highWaterMark: number;
  drawdownFloor: number;
  drawdownRemaining: number;
  tradingDaysCount: number;
  lastSyncAt: string | null;
  plan: {
    firmName: string;
    planName: string;
    startingBalance: number;
    maxDrawdown: number;
    drawdownType: string;
    profitTarget: number | null;
    minTradingDays: number | null;
  };
}

interface DashboardState {
  accounts: Account[];
  isLoading: boolean;
  isSyncing: boolean;
  lastSyncAt: string | null;
  setAccounts: (accounts: Account[]) => void;
  setLoading: (loading: boolean) => void;
  setSyncing: (syncing: boolean) => void;
  updateAccount: (id: string, data: Partial<Account>) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  accounts: [],
  isLoading: true,
  isSyncing: false,
  lastSyncAt: null,
  setAccounts: (accounts) => set({ accounts, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
  setSyncing: (isSyncing) => set({ isSyncing }),
  updateAccount: (id, data) =>
    set((state) => ({
      accounts: state.accounts.map((a) => (a.id === id ? { ...a, ...data } : a)),
    })),
}));
