# Phase 3: Component Deconstruction - Plan

## Goal
Refactor monolithic components (`Profile.tsx`, `Home.tsx`, `Groups.tsx`) into smaller, functional sub-components to improve maintainability and readability.

## Waves

### Wave 1: Profile Refactor
- **Task 1**: Create `src/components/profile/` directory.
- **Task 2**: Extract `ProfileHeader.tsx`.
- **Task 3**: Extract `ProfileOverview.tsx`.
- **Task 4**: Extract `ProfileStats.tsx`.
- **Task 5**: Extract `ProfileAchievements.tsx`.
- **Task 6**: Extract `ProfileTrust.tsx`.
- **Task 7**: Extract `ProfileRides.tsx`.
- **Task 8**: Extract `EditProfileModal.tsx`.
- **Task 9**: Update `Profile.tsx` to use new components.

### Wave 2: Home Refactor
- **Task 1**: Create `src/components/home/` directory.
- **Task 2**: Extract `HomeHero.tsx`.
- **Task 3**: Extract `HomeEcosystem.tsx`.
- **Task 4**: Extract `HomeMission.tsx`.
- **Task 5**: Extract `HomeDispatches.tsx`.
- **Task 6**: Extract `HomeTelemetry.tsx`.
- **Task 7**: Update `Home.tsx` to use new components.

### Wave 3: Groups Refactor
- **Task 1**: Create `src/components/groups/` directory.
- **Task 2**: Extract `GroupsSearch.tsx`.
- **Task 3**: Extract `RideCard.tsx`.
- **Task 4**: Extract `PasscodeModal.tsx`.
- **Task 5**: Update `Groups.tsx` to use new components.

## Verification
- Run `npm run dev` and verify each view looks and behaves identically.
- Check console for prop errors or missing context usage.
- Verify modal states (Edit Profile, Passcode) work correctly.
