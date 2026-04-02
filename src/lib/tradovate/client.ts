import { decrypt } from "../encryption";
import type {
  TradovateAuthResponse,
  TradovateAccount,
  TradovateCashBalance,
  TradovateFill,
  TradovatePosition,
} from "./types";

const API_URL = process.env.TRADOVATE_API_URL || "https://demo.tradovateapi.com/v1";

export class TradovateClient {
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;
  private username: string;
  private password: string;

  constructor(encryptedUsername: string, encryptedPassword: string) {
    this.username = decrypt(encryptedUsername);
    this.password = decrypt(encryptedPassword);
  }

  private async authenticate(): Promise<void> {
    if (this.accessToken && this.tokenExpiry && this.tokenExpiry > new Date()) {
      return;
    }

    const response = await fetch(`${API_URL}/auth/accesstokenrequest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: this.username,
        password: this.password,
        appId: "PropDash",
        appVersion: "1.0.0",
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Tradovate auth failed: ${error}`);
    }

    const data: TradovateAuthResponse = await response.json();
    this.accessToken = data.accessToken;
    this.tokenExpiry = new Date(data.expirationTime);
  }

  private async request<T>(endpoint: string): Promise<T> {
    await this.authenticate();

    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Tradovate API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getAccounts(): Promise<TradovateAccount[]> {
    return this.request<TradovateAccount[]>("/account/list");
  }

  async getCashBalance(accountId: number): Promise<TradovateCashBalance> {
    return this.request<TradovateCashBalance>(
      `/cashBalance/getCashBalanceSnapshot?accountId=${accountId}`
    );
  }

  async getFills(accountId?: number): Promise<TradovateFill[]> {
    const endpoint = accountId ? `/fill/list?accountId=${accountId}` : "/fill/list";
    return this.request<TradovateFill[]>(endpoint);
  }

  async getPositions(): Promise<TradovatePosition[]> {
    return this.request<TradovatePosition[]>("/position/list");
  }

  async verifyConnection(): Promise<{ success: boolean; accounts: TradovateAccount[] }> {
    try {
      const accounts = await this.getAccounts();
      return { success: true, accounts };
    } catch {
      return { success: false, accounts: [] };
    }
  }
}

export async function createTradovateClient(
  encryptedUsername: string,
  encryptedPassword: string
): Promise<TradovateClient> {
  return new TradovateClient(encryptedUsername, encryptedPassword);
}
