export async function enroll(payload: any) {
  // Replace with real API endpoint
  console.log('Enroll payload', payload);
  return { enrollmentId: 'mock' };
}
export async function auth(payload: any) {
  console.log('Auth payload', payload);
  return { token: 'mock', riskTier: 'low' };
}