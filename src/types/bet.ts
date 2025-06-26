// src/types/bet.ts

export type BetLeg = {
  player: string
  action: string
}

export type ParsedBet = {
  type: string
  odds: string
  game: string
  startTime: string
  stake: string
  payout: string
  betId: string
  placedAt: string
  legs: BetLeg[]
}
