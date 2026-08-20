export interface RequestOptions {
  /** AllRatesToday API key — free at https://allratestoday.com/register */
  apiKey: string;
}

export interface RateEntry {
  base: string;
  quote: string;
  type: string;
  value: number;
}

export interface LatestRates {
  bank: 'bot';
  name: string;
  rate_date: string;
  rates: RateEntry[];
  disclaimer: string;
}

export interface PairRate {
  bank: 'bot';
  name: string;
  rate_date: string;
  source: string;
  target: string;
  rate: number;
  rate_type: string;
  /** true when the pair was computed (inverse/cross) rather than published directly */
  derived: boolean;
  method: 'published' | 'inverse' | 'cross';
  disclaimer: string;
}

export interface DatedRates extends Omit<LatestRates, 'rate_date'> {
  requested_date: string;
  rate_date: string;
  published_on_requested_date: boolean;
}

export interface HistoryQuery {
  symbol?: string;
  source?: string;
  target?: string;
  from?: string;
  to?: string;
}

export declare function getLatestRates(options: RequestOptions): Promise<LatestRates>;
export declare function getRate(source: string, target: string, options: RequestOptions): Promise<PairRate>;
export declare function getRatesForDate(date: string, options: RequestOptions & { source?: string; target?: string }): Promise<DatedRates>;
export declare function getHistory(query: HistoryQuery, options: RequestOptions): Promise<unknown>;
