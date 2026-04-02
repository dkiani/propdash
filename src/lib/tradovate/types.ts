export interface TradovateAuthRequest {
  name: string;
  password: string;
  appId?: string;
  appVersion?: string;
  cid?: number;
  sec?: string;
}

export interface TradovateAuthResponse {
  accessToken: string;
  expirationTime: string;
  userId: number;
  name: string;
}

export interface TradovateAccount {
  id: number;
  name: string;
  userId: number;
  accountType: string;
  active: boolean;
  clearingHouseId: number;
  riskCategoryId: number;
  autoLiqProfileId: number;
  marginAccountType: string;
  legalStatus: string;
  archived: boolean;
  timestamp: string;
}

export interface TradovateCashBalance {
  accountId: number;
  timestamp: string;
  tradeDate: { year: number; month: number; day: number };
  currencyId: number;
  amount: number;
  realizedPnL: number;
  weekRealizedPnL: number;
}

export interface TradovateFill {
  id: number;
  orderId: number;
  contractId: number;
  timestamp: string;
  tradeDate: { year: number; month: number; day: number };
  action: "Buy" | "Sell";
  qty: number;
  price: number;
  active: boolean;
  finallyPaired: number;
}

export interface TradovatePosition {
  id: number;
  accountId: number;
  contractId: number;
  timestamp: string;
  tradeDate: { year: number; month: number; day: number };
  netPos: number;
  netPrice: number;
  bought: number;
  boughtValue: number;
  sold: number;
  soldValue: number;
  prevPos: number;
  prevPrice: number;
}

export interface TradovateOrder {
  id: number;
  accountId: number;
  contractId: number;
  timestamp: string;
  action: "Buy" | "Sell";
  ordStatus: string;
  ordType: string;
  price: number;
  qty: number;
  filledQty: number;
  avgFillPrice: number;
}

export interface TradovateContract {
  id: number;
  name: string;
  contractMaturityId: number;
}
