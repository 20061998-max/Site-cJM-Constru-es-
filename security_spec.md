# Security Specification — JM Construções (Firestore)

## 1. Data Invariants
1. **Default-Deny Baseline**: Every path not explicitly matched is denied for all reads and writes.
2. **PII Isolation (`/leads`)**: Customer phone numbers and quote details (`leads`) can be created by public visitors with status strictly equal to `'Novo'`, and can ONLY be read, listed, updated, or deleted by verified admins (`isAdmin()`).
3. **Referential Integrity**: A `QuoteLead` document can only be created if `sectorId` references an existing document in `/channels/{sectorId}`.
4. **Public Catalogs (`/channels`, `/projects`, `/partners`)**: Publicly readable (`get`, `list`), strictly writable (`create`, `update`, `delete`) by verified admins (`isAdmin()`) only.
5. **Temporal Integrity & Immutability**: All `createdAt` fields must equal `request.time` on creation and remain immutable on updates (`incoming().createdAt == existing().createdAt`). Updates must set `updatedAt == request.time`.
6. **Strict Keys & Size Boundaries**: Every write validates exact required and allowed keys (`keys().hasAll(...) && keys().hasOnly(...)`) and enforces `.size()` limits on all strings, plus `isValidId()` regex (`^[a-zA-Z0-9_\\-]+$`, max 128 chars) on document IDs.
7. **Verified Admin Authentication**: Admin privileges require `request.auth != null && request.auth.token.email_verified == true` and either the bootstrapped owner email (`josuelroque05052020@gmail.com`) or existence in `/admins/$(request.auth.uid)`.
8. **Site Launch Settings (`/site_settings/launch`)**: Publicly readable (`get` only on `'launch'`), strictly writable only by verified admins (`isAdmin()`). Cannot be listed or deleted.

## 2. The "Dirty Dozen" Attack Payloads (All Must Return PERMISSION_DENIED)
1. **Unauthenticated Channel Creation**: Anonymous user writes to `/channels/fake-1` -> Denied (`!isAdmin()`).
2. **Shadow / Ghost Field Injection on Lead**: Public visitor creates `/leads/lead-1` with extra `isAdmin: true` field -> Denied (`keys().hasOnly(...)`).
3. **Lead Status Shortcutting on Create**: Public visitor creates `/leads/lead-2` with `status: "Fechado"` instead of `"Novo"` -> Denied.
4. **Orphaned Lead Sector Reference**: Public visitor creates `/leads/lead-3` with non-existent `sectorId: "nonexistent"` -> Denied (`!exists(...)`).
5. **Client-Spoofed Timestamp on Lead**: Public visitor creates `/leads/lead-4` with backdated `createdAt` != `request.time` -> Denied.
6. **PII Scraping (`list /leads`)**: Non-admin authenticated user attempts `list` on `/leads` -> Denied (`!isAdmin()`).
7. **PII Direct Read (`get /leads/{id}`)**: Non-admin user attempts `get` on `/leads/lead-1` -> Denied (`!isAdmin()`).
8. **ID Poisoning**: Attacker attempts `create` at `/leads/bad$id` or >128 char ID -> Denied (`!isValidId()`).
9. **Resource Exhaustion / Oversized String**: Attacker submits `details` with >2000 characters on `/leads/lead-5` -> Denied.
10. **Unverified Admin Email Spoof**: User with `email: "josuelroque05052020@gmail.com"` and `email_verified: false` tries to read `/leads` -> Denied.
11. **Self-Assigned Admin Escalation**: Non-admin user tries to create `/admins/{theirUid}` -> Denied.
12. **Immutable `createdAt` Mutation**: Admin update on `/leads/lead-1` attempts to alter `createdAt` or mutate `clientName` -> Denied (`affectedKeys().hasOnly(['status', 'updatedAt'])`).
13. **Unauthorized Launch Mode Override**: Non-admin visitor attempts to write to `/site_settings/launch` -> Denied (`!isAdmin()`).
