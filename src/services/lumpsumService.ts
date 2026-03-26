import { LumpsumCalculationRequest, LumpsumCalculationResult } from '../types/lumpsum';

const API_URL = '/api/calculate-lumpsum';

export async function calculateLumpsum(
  request: LumpsumCalculationRequest
): Promise<LumpsumCalculationResult> {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to calculate lumpsum');
  }

  return response.json();
}
