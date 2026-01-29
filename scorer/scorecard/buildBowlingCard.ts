
import { BallEvent, Player } from '../../types.ts';
import { isLegalBall, getOverString } from '../../utils/cricket-engine.ts';

export function buildBowlingCard(
  history: BallEvent[],
  bowlers: Player[],
  innings: number
): any[] {
  const card = new Map<string, any>();

  bowlers.forEach(p => {
    card.set(p.id, {
      playerId: p.id,
      name: p.name,
      balls: 0,
      runs: 0,
      wickets: 0,
      maidens: 0
    });
  });

  const filteredHistory = history.filter(b => b.innings === innings && !b.commentary?.startsWith('EVENT'));

  filteredHistory.forEach(b => {
    const row = card.get(b.bowlerId);
    if (!row) return;

    // Bowler runs (exclude byes/legbyes)
    if (b.extraType !== 'Bye' && b.extraType !== 'LegBye') {
      const penalty = (b.extraType === 'Wide' || b.extraType === 'NoBall') ? 1 : 0;
      row.runs += (b.runs + (b.extraRuns || 0) + penalty);
    }

    if (isLegalBall(b.extraType)) {
      row.balls += 1;
    }

    // Bowler gets credit for most wickets except run outs, etc.
    if (b.isWicket && b.creditBowler !== false) {
      row.wickets += 1;
    }
  });

  return Array.from(card.values())
    .filter(r => r.balls > 0)
    .map(r => {
      const totalOvers = r.balls / 6;
      return {
        ...r,
        overs: getOverString(r.balls),
        economy: totalOvers > 0 ? parseFloat(((r.runs / totalOvers)).toFixed(2)) : 0
      };
    });
}
