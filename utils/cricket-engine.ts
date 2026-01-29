
import { Team, Player, MatchFixture, MatchState, BallEvent, Standing, PointsConfig } from '../types';

/**
 * Generates a Round Robin schedule for a list of teams.
 */
export const generateRoundRobin = (teams: Team[], tournamentId?: string, groupId?: string): MatchFixture[] => {
  const fixtures: MatchFixture[] = [];
  const n = teams.length;
  const teamPool = [...teams];
  if (n % 2 !== 0) teamPool.push({ id: 'BYE', name: 'BYE', players: [] });

  const numRounds = teamPool.length - 1;
  const half = teamPool.length / 2;

  for (let round = 0; round < numRounds; round++) {
    for (let i = 0; i < half; i++) {
      const teamA = teamPool[i];
      const teamB = teamPool[teamPool.length - 1 - i];

      if (teamA.id !== 'BYE' && teamB.id !== 'BYE') {
        fixtures.push({
          id: `match-${Date.now()}-${round}-${i}`,
          tournamentId,
          groupId,
          teamAId: teamA.id,
          teamBId: teamB.id,
          teamAName: teamA.name,
          teamBName: teamB.name,
          date: new Date(Date.now() + round * 86400000).toISOString().split('T')[0],
          venue: 'Arena ' + (i + 1),
          status: 'Scheduled',
          format: 'T20' // Default, can be overridden
        });
      }
    }
    // Rotate pool
    const last = teamPool.pop()!;
    teamPool.splice(1, 0, last);
  }
  return fixtures;
};

/**
 * Calculate Standings for a group based on fixtures
 */
export const calculateStandings = (teams: Team[], fixtures: MatchFixture[], pointsConfig: PointsConfig): Standing[] => {
  const standingsMap: Record<string, Standing> = {};

  // Initialize
  teams.forEach(t => {
    standingsMap[t.id] = {
      teamId: t.id,
      teamName: t.name,
      played: 0,
      won: 0,
      lost: 0,
      drawn: 0,
      tied: 0,
      points: 0,
      nrr: 0,
      runsFor: 0,
      oversFor: 0,
      runsAgainst: 0,
      oversAgainst: 0
    };
  });

  fixtures.forEach(match => {
    if (match.status !== 'Completed' || !match.winnerId) return;

    const tA = standingsMap[match.teamAId];
    const tB = standingsMap[match.teamBId];

    if (!tA || !tB) return; // Team might have been deleted

    tA.played++;
    tB.played++;

    if (match.winnerId === match.teamAId) {
      tA.won++;
      tA.points += pointsConfig.win;
      tB.lost++;
      tB.points += pointsConfig.loss;
    } else if (match.winnerId === match.teamBId) {
      tB.won++;
      tB.points += pointsConfig.win;
      tA.lost++;
      tA.points += pointsConfig.loss;
    } else if (match.winnerId === 'TIE') {
      tA.tied++;
      tB.tied++;
      tA.points += pointsConfig.tie;
      tB.points += pointsConfig.tie;
    } else {
      tA.drawn++;
      tB.drawn++;
      tA.points += pointsConfig.noResult;
      tB.points += pointsConfig.noResult;
    }

    // TODO: Advanced NRR calculation parsing from score strings would go here
    // For now, we rely on the manual override or complex parsing logic not fully implemented
    // in this snippet to extract exact runs/overs from "150/4 (20.0)" strings.
  });

  return Object.values(standingsMap).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    return b.nrr - a.nrr;
  });
};

/**
 * DLS Resource Table approximation logic.
 * In a real production environment, this would use the official ICC DLS standard table.
 */
export const calculateDLSTarget = (
  firstInningsTotal: number,
  oversLost: number,
  wicketsDown: number,
  totalOvers: number = 20
): number => {
  // Simple resource percentage calculation for demonstration
  const resourceLeft = (totalOvers - oversLost) / totalOvers;
  const wicketPenalty = 1 - (wicketsDown * 0.05); // Rough heuristic
  const adjustedTarget = Math.ceil(firstInningsTotal * resourceLeft * wicketPenalty) + 1;
  return adjustedTarget;
};

/**
 * Standard Cricket logic for over progression.
 */
export const isLegalBall = (extraType?: string): boolean => {
  return extraType !== 'Wide' && extraType !== 'NoBall';
};

export const getOverString = (balls: number): string => {
  const overs = Math.floor(balls / 6);
  const remainder = balls % 6;
  return `${overs}.${remainder}`;
};
