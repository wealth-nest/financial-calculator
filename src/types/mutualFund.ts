export interface MutualFundScheme {
  schemeCode: number;
  schemeName: string;
  isinGrowth: string | null;
  isinDivReinvestment: string | null;
}

export interface SchemeNav {
  date: string;
  nav: string;
}

export interface SchemeDetail {
  meta: {
    fund_house: string;
    scheme_type: string;
    scheme_category: string;
    scheme_code: number;
    scheme_name: string;
  };
  data: SchemeNav[];
}
