---
wave: 2
depends_on: [01-PLAN-1.md]
files_modified: [src/lib/utils.ts, src/lib/insights.ts]
autonomous: true
---

# Plan 2: Unit Testing Core Logic

Add initial unit tests for core utility and insight libraries to verify the testing setup and ensure logic correctness.

## Tasks

### 1. Test utils.ts
<read_first>
- `src/lib/utils.ts`
</read_first>
<action>
Create `src/lib/__tests__/utils.test.ts` and add tests for:
- `safeFetch`: Success and failure cases.
- `delay`: Verification of timing.
</action>
<acceptance_criteria>
- `src/lib/__tests__/utils.test.ts` exists.
- `npm test -- --run` passes the new tests.
</acceptance_criteria>

### 2. Test insights.ts
<read_first>
- `src/lib/insights.ts`
</read_first>
<action>
Create `src/lib/__tests__/insights.test.ts` and add tests for:
- `getTrafficLevel`
- `getBestTimeToLeave`
- `getTrafficColor`
</action>
<acceptance_criteria>
- `src/lib/__tests__/insights.test.ts` exists.
- `npm test -- --run` passes the new tests.
</acceptance_criteria>

## Verification
- All tests in `src/lib/__tests__` pass.
