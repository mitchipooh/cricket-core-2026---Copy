
export type UserProfile = {
  id: string;
  name: string;
  handle: string;
  role: 'Administrator' | 'Scorer' | 'Match Official';
  createdAt: number;
};

export type Player = {
  id: string;
  name: string;
  role: 'Batsman' | 'Bowler' | 'All-rounder' | 'Wicket-keeper';
  photoUrl?: string;
  stats: {
    runs: number;
    wickets: number;
    ballsFaced: number;
    ballsBowled: number;
    runsConceded: number;
    matches: number;
    catches: number;
    runOuts: number;
    stumpings: number;
    highestScore?: number;
    bestBowling?: string;
  };
};

export type WicketType =
  | 'Bowled'
  | 'Caught'
  | 'LBW'
  | 'Run Out'
  | 'Stumped'
  | 'Hit Wicket'
  | 'Handled Ball'
  | 'Obstructing Field'
  | 'Timed Out'
  | 'Retired Out'
  | 'Retired Hurt';

export interface WicketEvent {
  type: 'WICKET';
  wicketType: WicketType;
  batterId: string;
  bowlerId?: string;
  fielderId?: string;
}

export type PlayerWithContext = Player & { 
  teamName: string; 
  teamId: string; 
  orgId: string;
  orgName: string;
};

export type Team = {
  id: string;
  name: string;
  logoUrl?: string;
  location?: string;
  management?: string;
  players: Player[];
};

export type Group = {
  id: string;
  name: string;
  teams: Team[];
};

export type TournamentFormat = 'Test' | 'T10' | 'T20' | '40-over' | '50-over';

export type PointsConfig = {
  win: number;
  loss: number;
  tie: number;
  noResult: number;
  bonusBatting?: number;
  bonusBowling?: number;
};

export type Standing = {
  teamId: string;
  teamName: string;
  played: number;
  won: number;
  lost: number;
  drawn: number;
  tied: number;
  points: number;
  nrr: number;
  runsFor: number;
  oversFor: number;
  runsAgainst: number;
  oversAgainst: number;
};

export type Tournament = {
  id: string;
  name: string;
  format: TournamentFormat;
  groups: Group[];
  pointsConfig: PointsConfig;
  overs: number;
  status?: 'Upcoming' | 'Ongoing' | 'Completed';
};

export type Organization = {
  id: string;
  name: string;
  description?: string;
  logoUrl?: string;
  address?: string;
  establishedYear?: number;
  country?: string;
  groundLocation?: string;
  tournaments: Tournament[];
  groups: Group[];
  memberTeams: Team[];
  fixtures: MatchFixture[];
};

export type BallEvent = {
  timestamp: number;
  over: number;
  ballNumber: number;
  strikerId: string;
  nonStrikerId?: string;
  bowlerId: string;
  runs: number;
  batRuns?: number; // Runs off the bat specifically
  extraRuns?: number;
  extraType?: 'Wide' | 'NoBall' | 'Bye' | 'LegBye' | 'None';
  isWicket: boolean;
  wicketType?: string;
  dismissalType?: string; // Synonym for wicketType
  creditBowler?: boolean; // Does the bowler get credit?
  outPlayerId?: string;
  fielderId?: string;
  assistFielderId?: string;
  commentary: string;
  innings: number;
  teamScoreAtBall?: number; // Total team score after this ball
};

export type MatchState = {
  battingTeamId: string;
  bowlingTeamId: string;
  score: number;
  wickets: number;
  totalBalls: number;
  strikerId: string;
  nonStrikerId: string;
  bowlerId: string;
  innings: number; 
  target?: number;
  history: BallEvent[];
  inningsScores: { innings: number; teamId: string; score: number; wickets: number; overs: string }[]; 
  isCompleted: boolean;
  isSuperOver?: boolean; 
  tossWinnerId?: string;
  tossDecision?: 'Bat' | 'Bowl';
  umpires?: string[];
  teamASquadIds?: string[];
  teamBSquadIds?: string[];
  matchTimer: {
    startTime: number | null; 
    totalAllowances: number; 
    isPaused: boolean;
    lastPauseTime: number | null;
  };
  adjustments?: {
    oversLost: number;
    isLastHour: boolean;
    dayNumber: number;
    session: string;
    declared: boolean;
  };
};

export type MatchFixture = {
  id: string;
  tournamentId?: string;
  groupId?: string;
  format?: TournamentFormat; 
  customOvers?: number; 
  teamAId: string;
  teamBId: string;
  teamAName: string;
  teamBName: string;
  date: string;
  venue: string;
  status: 'Scheduled' | 'Live' | 'Completed';
  result?: string;
  winnerId?: string; 
  teamAScore?: string; 
  teamBScore?: string;
  tossWinnerId?: string;
  tossDecision?: 'Bat' | 'Bowl';
  umpires?: string[];
  teamASquadIds?: string[];
  teamBSquadIds?: string[];
  savedState?: MatchState;
  allowFlexibleSquad?: boolean;
  initialPlayers?: {
    strikerId: string;
    nonStrikerId: string;
    bowlerId: string;
  };
};

export interface Comment {
  id: string;
  author: string;
  text: string;
  timestamp: number;
}

export interface MediaPost {
  id: string;
  type: 'IMAGE' | 'VIDEO' | 'LIVE_STATUS';
  authorName: string;
  authorAvatar?: string;
  contentUrl?: string; // For images/video
  caption: string;
  timestamp: number;
  likes: number;
  shares: number;
  comments: Comment[];
  matchId?: string;
}
