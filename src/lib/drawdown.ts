export type DrawdownType = "trailing" | "eod" | "static";

export interface DrawdownInput {
  drawdownType: DrawdownType;
  startingBalance: number;
  maxDrawdown: number;
  currentBalance: number;
  highWaterMark: number;
}

export interface DrawdownResult {
  drawdownFloor: number;
  drawdownRemaining: number;
  drawdownPercentUsed: number;
  highWaterMark: number;
  healthStatus: "healthy" | "caution" | "danger" | "critical";
}

export function calculateDrawdown(input: DrawdownInput): DrawdownResult {
  const { drawdownType, startingBalance, maxDrawdown, currentBalance, highWaterMark: prevHWM } = input;

  // Update high water mark
  const highWaterMark = Math.max(startingBalance, prevHWM, currentBalance);

  let drawdownFloor: number;

  switch (drawdownType) {
    case "trailing":
      // Floor trails up with new highs, never moves down
      drawdownFloor = highWaterMark - maxDrawdown;
      break;
    case "eod":
      // Same as trailing but only evaluated at end of day
      // During the day, use the previous EOD high water mark
      drawdownFloor = highWaterMark - maxDrawdown;
      break;
    case "static":
      // Floor never moves — always based on starting balance
      drawdownFloor = startingBalance - maxDrawdown;
      break;
    default:
      drawdownFloor = highWaterMark - maxDrawdown;
  }

  const drawdownRemaining = currentBalance - drawdownFloor;
  const drawdownPercentUsed = ((maxDrawdown - drawdownRemaining) / maxDrawdown) * 100;

  let healthStatus: DrawdownResult["healthStatus"];
  const remainingPercent = (drawdownRemaining / maxDrawdown) * 100;

  if (drawdownRemaining <= 500) {
    healthStatus = "critical";
  } else if (remainingPercent < 30) {
    healthStatus = "danger";
  } else if (remainingPercent < 60) {
    healthStatus = "caution";
  } else {
    healthStatus = "healthy";
  }

  return {
    drawdownFloor,
    drawdownRemaining: Math.max(0, drawdownRemaining),
    drawdownPercentUsed: Math.min(100, Math.max(0, drawdownPercentUsed)),
    highWaterMark,
    healthStatus,
  };
}

export function calculateEvalProgress(input: {
  currentBalance: number;
  startingBalance: number;
  profitTarget: number;
  tradingDaysCount: number;
  minTradingDays: number;
}) {
  const { currentBalance, startingBalance, profitTarget, tradingDaysCount, minTradingDays } = input;

  const currentProfit = currentBalance - startingBalance;
  const profitProgress = Math.min(100, Math.max(0, (currentProfit / profitTarget) * 100));
  const daysProgress = Math.min(100, Math.max(0, (tradingDaysCount / minTradingDays) * 100));
  const remainingProfit = Math.max(0, profitTarget - currentProfit);
  const remainingDays = Math.max(0, minTradingDays - tradingDaysCount);

  return {
    currentProfit,
    profitProgress,
    daysProgress,
    remainingProfit,
    remainingDays,
    profitTargetMet: currentProfit >= profitTarget,
    daysTargetMet: tradingDaysCount >= minTradingDays,
    passed: currentProfit >= profitTarget && tradingDaysCount >= minTradingDays,
  };
}
