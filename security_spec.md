# Security Specification

## Data Invariants
- A user document can only be created if the document ID matches the authenticated user's UID.
- Users can only read and write their own profile data.
- The `userId` field in the document must match the authenticated user's UID.

## The "Dirty Dozen" Payloads
1. Create a profile for a different user ID.
2. Read another user's profile.
3. Update another user's profile.
4. Delete another user's profile.
5. Create a profile with a `userId` field that doesn't match the auth UID.
6. Bypass `isValidUserProfile` by injecting large strings into the name field.
7. Inject a non-string value into the `rashi` field.
8. Update the `userId` field (immortality check).
9. Create a profile without authentication.
10. Update a profile without authentication.
11. Inject a malicious document ID (Path poisoning).
12. Bulk read (list) profiles without restriction.

## Test Runner
Testing will be performed via the app logic and manual verification during development, as the environment doesn't strictly provide a local test runner for rules. However, rules will be drafted to deny these.
