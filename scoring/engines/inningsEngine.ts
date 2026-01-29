
import { MatchState, Team } from '../../types.ts';

export type EndReason = 'All Out' | 'Overs Completed' | 'Target Chased' | 'Declared' | null;

export const checkEndOfInnings = (state: MatchState, totalOversAllowed: number, battingTeamPlayers: number = 11, allowFlexibleSquad: boolean = false): EndReason => {
  // 0. Declaration Check
  if (state.adjustments?.declared) return 'Declared';

  // 1. Wickets Logic
  // Ensure we have a valid player count (fallback to 11 if data missing)
  const effectivePlayers = battingTeamPlayers > 0 ? battingTeamPlayers : 11;
  
  // In cricket, you need a pair to bat. So max wickets is players - 1.
  const maxPossibleWickets = Math.max(0, effectivePlayers - 1);
  
  // If not flexible (Standard Rules), cap wickets at 10 (even if 15 players in squad, usually only 11 bat).
  // If flexible, play until everyone batted.
  const wicketLimit = allowFlexibleSquad ? maxPossibleWickets : Math.min(10, maxPossibleWickets);

  if (state.wickets >= wicketLimit) return 'All Out';

  // 2. Overs Completed
  if (state.totalBalls >= totalOversAllowed * 6) return 'Overs Completed';

  // 3. Target Chased (2nd innings only)
  // Note: Match ends immediately when score >= target
  if (state.innings === 2 && state.target !== undefined && state.score >= state.target) return 'Target Chased';

  return null;
};

export const endInnings = (state: MatchState, reason: string): MatchState => {
  // Logic to finalize innings state if needed (e.g. timestamps)
  return {
    ...state,
    // matchTimer adjustments could happen here
  };
};
