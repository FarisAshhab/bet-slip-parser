// src/lib/parse.ts
import { ParsedBet, BetLeg } from '@/types/bet'

/**
 * Parses raw OCR output from a betting slip into structured bet data.
 * 
 * Handles noisy lines, duplicate entries, and known FanDuel formatting structures.
 */
export function parseBetSlipText(raw: string): ParsedBet {
  // Split raw text into trimmed, non-empty lines
  const rawLines = raw
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)

  // Remove exact adjacent duplicate lines (common in OCR)
  const dedupedLines: string[] = []
  for (let i = 0; i < rawLines.length; i++) {
    if (i === 0 || rawLines[i] !== rawLines[i - 1]) {
      dedupedLines.push(rawLines[i])
    }
  }

  // Extract the full line that includes bet type and odds (e.g., "Same Game Parlay +612")
  const typeLineFull = dedupedLines.find((line) =>
    /same game parlay/i.test(line)
  ) || ''

  const oddsMatch = typeLineFull.match(/\+\d+/)
  const odds = oddsMatch?.[0] || 'N/A'
  const type = typeLineFull.replace(/\+\d+/, '').trim()

  // Find game line that includes the team matchup and possibly time
  const gameLineRaw = dedupedLines.find((line) => / v /i.test(line)) || ''
  const game = gameLineRaw.replace(/\d{1,2}:\d{2}(?:AM|PM)?(?: ET)?/, '').trim()

  const startTimeMatch = gameLineRaw.match(/\d{1,2}:\d{2}(?:AM|PM)?(?: ET)?/)
  const startTime = startTimeMatch?.[0] || 'Unknown'

  // Filter out lines that are UI noise, metadata, or already parsed above
  const cleanedLines = dedupedLines.filter(
    (l) =>
      l !== typeLineFull &&
      l !== gameLineRaw &&
      !/^My Bets$/i.test(l) &&
      !/Settled|Open/i.test(l) &&
      !/Recent/i.test(l) &&
      !/^o\)?\\?/.test(l) && // filters garbage like "(o)\"
      !/^[\d\s]*BMA/i.test(l) // filters weird OCR prefix like "32 BMA"
  )

  // Attempt to find stake and payout by detecting currency values above labeled lines
  let stake = 'N/A'
  let payout = 'N/A'
  for (let i = 0; i < cleanedLines.length - 1; i++) {
    const moneyLine = cleanedLines[i]
    const labelLine = cleanedLines[i + 1]

    if (
      /\$[\d.]+/.test(moneyLine) &&
      /wager/i.test(labelLine) &&
      /payout/i.test(labelLine)
    ) {
      const dollarMatches = moneyLine.match(/\$[\d.]+/g)
      if (dollarMatches?.length === 2) {
        stake = dollarMatches[0]
        payout = dollarMatches[1]
        break
      }
    }
  }

  // Try to extract metadata line like: "BET ID: ... PLACED: ..."
  const betMetaLine = cleanedLines.find((line) =>
    /BET ID:.*PLACED:/i.test(line)
  )
  let betId = 'N/A'
  let placedAt = 'N/A'

  if (betMetaLine) {
    const betIdMatch = betMetaLine.match(/BET ID:\s*([^ ]+)/i)
    const placedMatch = betMetaLine.match(/PLACED:\s*(.+)$/i)

    betId = betIdMatch?.[1]?.trim() || 'N/A'
    placedAt = placedMatch?.[1]?.trim() || 'N/A'
  }

  // Parse each player-action pair (e.g., "Kylian Mbappe" + "ANYTIME GOALSCORER")
  const legs: BetLeg[] = []

  for (let i = 0; i < cleanedLines.length - 1; i++) {
    let playerLine = cleanedLines[i]
    const actionLine = cleanedLines[i + 1]

    playerLine = playerLine.replace(/^\d+\s*/, '') // Strip numeric prefixes like "3 Real Madrid"

    // Basic validation heuristics: player names start with capital letters, actions are upper case
    if (
      /^[A-Z][a-z]+(?: [A-Z][a-z]+)*$/.test(playerLine) &&
      /[A-Z]{3,}|[A-Z][a-z]+ [A-Z]+/.test(actionLine)
    ) {
      legs.push({
        player: playerLine,
        action: actionLine,
      })
    }
  }

  return {
    type,
    odds,
    game,
    startTime,
    stake,
    payout,
    betId,
    placedAt,
    legs,
  }
}






