export interface ITeam {
  name: string | undefined;
  victories: number;
  defeats: number;
  code: string | undefined;
}

export interface IConference {
  name: string | null | undefined;
  teams: Array<ITeam>;
}

export interface IInfoPlayer {
  number: string | undefined | null;
  name: string | undefined | null;
  position: string | undefined | null;
  country: string | undefined | null;
  href: string | undefined;
}

export interface IGameResult {
  date: string;
  teams: string[];
  result: RegExpMatchArray | null;
  score: string[];
}

export interface IInfoTeam {
  name: string | null;
  coach: string;
  executive: string;
  record: string;
}
