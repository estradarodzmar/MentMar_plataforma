# Security Specification & Payload-First TDD (`MentMar`)

## 1. Data Invariants
1. **User PII Isolation**: `/users/{userId}` holds `email`, `displayName`, `twoFactorSecretEnc`, `role`, and `academicGrade`. Only the owning authenticated user (`request.auth.uid == userId`) or verified platform admin (`margaritarodriguezg77@gmail.com`) may `get`, `create`, or `update` it. `list` is strictly denied (`false`).
2. **Academic Progress Ownership & Teacher Visibility**: `/enrollments/{enrollmentId}` stores non-PII progress summaries (`studentName`, `academicGrade`, `teacherUid`, `completedCount`, `levelProgress`, `weeklyMinutes`). Students can only create/update their own `enrollmentId == request.auth.uid`, and `list` queries are enforced at the rule level (`resource.data.uid == request.auth.uid || resource.data.teacherUid == request.auth.uid || isAdminByEmail()`).
3. **Master Gate on Subcollections**: `/enrollments/{enrollmentId}/lessonProgress/{lessonId}` uses `get()` on the parent enrollment on `get`, `create`, and `update` to ensure ownership or assigned teacher verification, and strict `resource.data.uid == request.auth.uid` on `list`.
4. **Immutable Certificates**: `/certificates/{certificateId}` cannot be modified or deleted by students once issued; `create` validates `uid == request.auth.uid`, `issuedAt == request.time`, and bounded string sizes.
5. **Teacher-Only Material Uploads**: `/materials/{materialId}` `create` and `update` verify `authorUid == request.auth.uid` and check `get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'teacher'` (or admin).
6. **Strict Timestamps & Key Whitelists**: Every write enforces `request.time` for `createdAt`/`updatedAt`, rejects shadow fields via `keys().hasAll(...) && keys().hasOnly(...)`, and restricts updates via `affectedKeys().hasOnly(...)`.

## 2. Dirty Dozen Attack Payloads (All Must Return `PERMISSION_DENIED`)
1. **Identity Spoofing on User Create**: Creating `/users/victimUid` while authenticated as `attackerUid`.
2. **Shadow Field Injection on User Create**: Creating `/users/attackerUid` with extra field `isAdmin: true`.
3. **Email Unverified Write**: Writing to `/users/attackerUid` when `request.auth.token.email_verified == false`.
4. **User List Scraping**: Executing `list` query on `/users` as a student or non-admin teacher.
5. **Role Escalation Update**: Updating `/users/studentUid` to change `role: "teacher"` via `update`.
6. **CreatedAt Tampering**: Creating `/enrollments/studentUid` with a backdated client `createdAt` instead of `request.time`.
7. **Unbounded Array Exhaustion**: Creating `/enrollments/studentUid` with `weeklyMinutes` array of 500 elements (must enforce `.size() <= 7`).
8. **Student Uploading Teacher Material**: Creating `/materials/mat1` while `users/{uid}.role == "student"`.
9. **Certificate Forgery Update**: Student attempting to update `score: 100` on an existing `/certificates/cert1`.
10. **Path Variable ID Poisoning**: Creating `/materials/invalid id with spaces and 2000 chars...`.
11. **Cross-User Notification Read**: Reading `/notifications/notifOfOtherUser` where `uid != request.auth.uid`.
12. **Blanket List Scraping on Notifications**: Querying `/notifications` without matching `uid == request.auth.uid`.
