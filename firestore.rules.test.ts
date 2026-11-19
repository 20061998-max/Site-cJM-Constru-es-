/**
 * Security Rules Specification Verification (Dirty Dozen Test Matrix)
 * Validates structural invariants for JM Construções Firestore rules.
 */
export const DIRTY_DOZEN_CASES = [
  { id: 1, name: 'Unauthenticated Channel Creation', path: '/channels/fake-1', expected: 'PERMISSION_DENIED' },
  { id: 2, name: 'Shadow Field Injection on Lead', path: '/leads/lead-1', expected: 'PERMISSION_DENIED' },
  { id: 3, name: 'Lead Status Shortcutting on Create', path: '/leads/lead-2', expected: 'PERMISSION_DENIED' },
  { id: 4, name: 'Orphaned Lead Sector Reference', path: '/leads/lead-3', expected: 'PERMISSION_DENIED' },
  { id: 5, name: 'Client-Spoofed Timestamp on Lead', path: '/leads/lead-4', expected: 'PERMISSION_DENIED' },
  { id: 6, name: 'PII Scraping via List on Leads', path: '/leads', expected: 'PERMISSION_DENIED' },
  { id: 7, name: 'PII Direct Read by Non-Admin', path: '/leads/lead-1', expected: 'PERMISSION_DENIED' },
  { id: 8, name: 'ID Poisoning with Invalid Chars', path: '/leads/bad$id', expected: 'PERMISSION_DENIED' },
  { id: 9, name: 'Oversized Details String (>2000)', path: '/leads/lead-5', expected: 'PERMISSION_DENIED' },
  { id: 10, name: 'Unverified Admin Email Spoof', path: '/leads', expected: 'PERMISSION_DENIED' },
  { id: 11, name: 'Self-Assigned Admin Escalation', path: '/admins/attacker', expected: 'PERMISSION_DENIED' },
  { id: 12, name: 'Immutable createdAt Mutation', path: '/leads/lead-1', expected: 'PERMISSION_DENIED' },
] as const;
