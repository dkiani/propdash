// Tradovate auth helpers for verifying credentials

const API_URL = process.env.TRADOVATE_API_URL || "https://demo.tradovateapi.com/v1";

export async function verifyTradovateCredentials(
  username: string,
  password: string
): Promise<{
  success: boolean;
  error?: string;
  accounts?: Array<{ id: number; name: string }>;
}> {
  try {
    // Step 1: Authenticate with Tradovate username/password
    const authResponse = await fetch(`${API_URL}/auth/accesstokenrequest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: username,
        password: password,
        appId: "PropDash",
        appVersion: "1.0.0",
      }),
    });

    if (!authResponse.ok) {
      const errorText = await authResponse.text();
      if (authResponse.status === 401) {
        return { success: false, error: "Invalid username or password" };
      }
      return { success: false, error: `Authentication failed: ${errorText}` };
    }

    const authData = await authResponse.json();

    // Step 2: Fetch account list
    const accountsResponse = await fetch(`${API_URL}/account/list`, {
      headers: {
        Authorization: `Bearer ${authData.accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!accountsResponse.ok) {
      return { success: false, error: "Failed to fetch accounts" };
    }

    const accounts = await accountsResponse.json();

    return {
      success: true,
      accounts: accounts.map((a: any) => ({ id: a.id, name: a.name })),
    };
  } catch {
    return {
      success: false,
      error: "Could not connect to Tradovate. Please check your internet connection.",
    };
  }
}
