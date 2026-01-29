
import { useState, useCallback } from 'react';
import { MatchState, BallEvent, WicketEvent, Player } from '../../types.ts';
import { applyDelivery } from '../engines/applyDelivery.ts';
import { getOverString } from '../../utils/cricket-engine.ts';

/**
 * Hook-based Match Engine
 * Manages the progression of a cricket match state with undo support.
 * Enhanced with Correction Mode and Player Replacement logic.
 */
export const useMatchEngine = (initialState: MatchState) => {
  const [state, setState] = useState<MatchState>(initialState);
  const [history, setHistory] = useState<MatchState[]>([]);

  const applyBall = useCallback((ball: Partial<BallEvent>) => {
    setHistory(prev => [...prev, state]);
    setState(prev => applyDelivery(prev, ball, null));
  }, [state]);

  const recordWicket = useCallback((event: WicketEvent) => {
    applyBall({
      runs: 0,
      extraRuns: 0,
      extraType: 'None',
      isWicket: true,
      wicketType: event.wicketType,
      outPlayerId: event.batterId,
      fielderId: event.fielderId,
      commentary: `WICKET! ${event.wicketType}`
    });
  }, [applyBall]);

  const undoBall = useCallback(() => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setState(previous);
    setHistory(prev => prev.slice(0, -1));
  }, [history]);

  /**
   * FEATURE 1: Correction Mode
   * Retroactively replaces a player in the current innings history.
   */
  const correctPlayerIdentity = useCallback((oldId: string, newId: string, role: 'striker' | 'nonStriker' | 'bowler') => {
    setHistory(prev => [...prev, state]);
    setState(prev => {
      const next = { ...prev };
      // Update current pointers
      if (role === 'striker' && next.strikerId === oldId) next.strikerId = newId;
      if (role === 'nonStriker' && next.nonStrikerId === oldId) next.nonStrikerId = newId;
      if (role === 'bowler' && next.bowlerId === oldId) next.bowlerId = newId;

      // Atomic update of history
      next.history = next.history.map(ball => {
        const b = { ...ball };
        if (role === 'striker' && b.strikerId === oldId) b.strikerId = newId;
        if (role === 'nonStriker' && b.nonStrikerId === oldId) b.nonStrikerId = newId;
        if (role === 'bowler' && b.bowlerId === oldId) b.bowlerId = newId;
        if (b.outPlayerId === oldId) b.outPlayerId = newId;
        return b;
      });
      return next;
    });
  }, [state]);

  /**
   * FEATURE 2: Player Replacement (Retire/Injury)
   */
  const retireBatter = useCallback((playerId: string, reason: 'Retired Hurt' | 'Retired Out') => {
    applyBall({
      isWicket: reason === 'Retired Out',
      wicketType: reason,
      outPlayerId: playerId,
      commentary: `EVENT: ${reason}`,
      innings: state.innings
    });
  }, [applyBall, state.innings]);

  const replaceBowlerMidOver = useCallback((newBowlerId: string) => {
    applyBall({
      commentary: 'EVENT: Injury Replacement (Bowler)',
      bowlerId: newBowlerId,
      innings: state.innings
    });
  }, [applyBall, state.innings]);

  const declareInnings = useCallback(() => {
    setHistory(prev => [...prev, state]);
    setState(prev => ({
      ...prev,
      adjustments: {
        ...prev.adjustments,
        declared: true,
        oversLost: prev.adjustments?.oversLost || 0,
        isLastHour: prev.adjustments?.isLastHour || false,
        dayNumber: prev.adjustments?.dayNumber || 1,
        session: prev.adjustments?.session || '',
      }
    }));
  }, [state]);

  const startInnings = useCallback((battingTeamId: string, bowlingTeamId: string, target?: number) => {
    setHistory(prev => [...prev, state]);
    setState(prev => ({
      ...prev,
      innings: prev.innings + 1,
      battingTeamId,
      bowlingTeamId,
      score: 0,
      wickets: 0,
      totalBalls: 0,
      strikerId: '',
      nonStrikerId: '',
      bowlerId: '',
      target, // Set the chase target
      adjustments: { ...prev.adjustments, declared: false } // Reset declaration flag for new innings
    }));
  }, [state]);

  const endInnings = useCallback(() => {
    setHistory(prev => [...prev, state]);
    setState(prev => ({
      ...prev,
      inningsScores: [...prev.inningsScores, {
        innings: prev.innings,
        teamId: prev.battingTeamId,
        score: prev.score,
        wickets: prev.wickets,
        overs: getOverString(prev.totalBalls)
      }],
      // Don't auto-complete match here, let the UI handle the transition or victory check
    }));
  }, [state]);

  return {
    state,
    history,
    applyBall,
    recordWicket,
    undoBall,
    canUndo: history.length > 0,
    startInnings,
    endInnings,
    correctPlayerIdentity,
    retireBatter,
    replaceBowlerMidOver,
    declareInnings
  };
};
