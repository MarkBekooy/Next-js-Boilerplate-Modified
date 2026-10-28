---
name: try-catch-utility
description: Enforce this project's typed `tryCatch` error-handling convention. Use when creating, changing, or reviewing TypeScript or TSX code with fallible synchronous or asynchronous operations, replacing traditional try/catch blocks, or destructuring `tryCatch` results.
---

# Try-Catch Utility

Use `tryCatch` from `@/utils/try-catch` for fallible application operations instead of traditional try/catch blocks.

## Rules

- Destructure only the properties the code uses.
- Alias every destructured property with a meaningful, operation-specific name.
- Avoid generic bindings such as `{ data }`, `{ error }`, or `{ data, error }`.
- Name the success value for what it contains, such as `parsedProfile` or `savedRanking`.
- Name the error for the failed operation, such as `profileParseError` or `saveRankingError`.
- Check the named error before using the named data.
- Await `tryCatch` for asynchronous operations.
- Keep direct try/catch only inside the `tryCatch` utility implementation itself.

## Synchronous example

```typescript
import { tryCatch } from "@/utils/try-catch";

const { data: parsedProfile, error: profileParseError } = tryCatch(() => JSON.parse(profileJson));

if (profileParseError) {
  return handleProfileParseError(profileParseError);
}

return useProfile(parsedProfile);
```

## Asynchronous example

```typescript
const { data: savedRanking, error: saveRankingError } = await tryCatch(() => saveRanking(input));

if (saveRankingError) {
  return handleSaveRankingError(saveRankingError);
}

return savedRanking;
```

## Explicit error type

```typescript
const { data: parsedSettings, error: settingsParseError } = tryCatch<Settings, SyntaxError>(() =>
  JSON.parse(settingsJson),
);
```
