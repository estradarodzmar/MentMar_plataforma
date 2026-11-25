/**
 * Adversarial Security Rules Specification Runner ("Dirty Dozen" Payloads)
 * Maps each attack vector from security_spec.md to the rule invariants in firestore.rules.
 */
export const dirtyDozenSecurityCases = [
  { id: 1, name: 'Identity Spoofing on User Create', target: '/users/victimUid', expected: 'PERMISSION_DENIED' },
  { id: 2, name: 'Shadow Field Injection (isAdmin: true)', target: '/users/attackerUid', expected: 'PERMISSION_DENIED' },
  { id: 3, name: 'Unverified Email Write', target: '/users/attackerUid', expected: 'PERMISSION_DENIED' },
  { id: 4, name: 'User PII List Scraping', target: '/users', expected: 'PERMISSION_DENIED' },
  { id: 5, name: 'Role Escalation Update', target: '/users/studentUid', expected: 'PERMISSION_DENIED' },
  { id: 6, name: 'Client Timestamp Tampering', target: '/enrollments/studentUid', expected: 'PERMISSION_DENIED' },
  { id: 7, name: 'Unbounded Array Exhaustion', target: '/enrollments/studentUid', expected: 'PERMISSION_DENIED' },
  { id: 8, name: 'Student Uploading Teacher Material', target: '/materials/mat1', expected: 'PERMISSION_DENIED' },
  { id: 9, name: 'Certificate Forgery Update', target: '/certificates/cert1', expected: 'PERMISSION_DENIED' },
  { id: 10, name: 'Path Variable ID Poisoning', target: '/materials/invalid_id_too_long', expected: 'PERMISSION_DENIED' },
  { id: 11, name: 'Cross-User Notification Read', target: '/notifications/notifOther', expected: 'PERMISSION_DENIED' },
  { id: 12, name: 'Blanket List Scraping on Notifications', target: '/notifications', expected: 'PERMISSION_DENIED' },
] as const;
