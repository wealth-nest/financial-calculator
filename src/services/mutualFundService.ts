import { MutualFundScheme, SchemeDetail } from '../types/mutualFund';

const API_URL = '/api/mutual-funds';

export async function fetchAllMutualFunds(): Promise<MutualFundScheme[]> {
  const response = await fetch(API_URL);
  if (!response.ok) {
    throw new Error('Failed to fetch mutual funds');
  }
  return response.json();
}

export async function fetchSchemeDetail(schemeCode: number): Promise<SchemeDetail> {
  const response = await fetch(`${API_URL}/${schemeCode}`);
  if (!response.ok) {
    throw new Error('Failed to fetch scheme details');
  }
  return response.json();
}
