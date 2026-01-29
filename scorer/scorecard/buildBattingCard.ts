
import { BallEvent, Player } from '../../types.ts';
import { isLegalBall } from '../../utils/cricket-engine.ts';

export function buildBattingCard(
  history: BallEvent[],
  batters: Player[],
  innings: number,
  strikerId: string,
  nonStrikerId: string
): any[] {
  const card = new Map<string, any>();

  batters.forEach(p => {
    card.set(p.id, {
      playerId: p.id,
      name: p.name,
      runs: 0,
      balls: 0,
      fours: 0,
      sixes: 0,
      isOut: false,
      dismissal: '',
      atCrease: p.id === strikerId || p.id === nonStrikerId
    });
  });

  // History is latest-first, we process chronologically for dismissal logic
  const chronHistory = [...history].filter(b => b.innings === innings).reverse();

  chronHistory.forEach(b => {
    if (b.commentary?.startsWith('EVENT')) return;

    const row = card.get(b.strikerId);
    if (!row) return;

    // Bat runs (exclude wides for batter runs)
    if (b.extraType !== 'Wide') {
      row.runs += b.batRuns ?? b.runs ?? 0;
      if (b.batRuns === 4) row.fours += 1;
      if (b.batRuns === 6) row.sixes += 1;
      
      // Only increment balls faced for legal deliveries
      if (isLegalBall(b.extraType)) {
        row.balls += 1;
      }
    }

    if (b.isWicket && b.outPlayerId) {
      const outRow = card.get(b.outPlayerId);
      if (outRow) {
        outRow.isOut = true;
        outRow.dismissal = b.commentary || 'Out';
      }
    }
  });

  return Array.from(card.values())
    .filter(r => r.balls > 0 || r.isOut || r.atCrease)
    .map(r => ({
      ...r,
      strikeRate: r.balls ? parseFloat(((r.runs / r.balls) * 100).toFixed(1)) : 0
    }));
}
