# Phase 3: Component Deconstruction - Context

**Gathered:** 2026-04-24
**Status:** Ready for planning

<domain>
## Phase Boundary
Refactor monolithic components (`Profile.tsx`, `Home.tsx`, `Groups.tsx`) into smaller, functional sub-components to improve maintainability and readability.

</domain>

<decisions>
## Implementation Decisions

### Deconstruction Strategy
- **Functional Extraction**: Extract logical sections (e.g., Stats, Forms, Cards) into separate files in `src/components/profile/`, `src/components/home/`, etc.
- **Hook Extraction**: Move complex logic into custom hooks if applicable (e.g., `useProfileData`, `useHomeRides`).
- **Prop-Based Communication**: Use clean interfaces for the new sub-components.

### the agent's Discretion
- Choice of component split points.
- Naming conventions for sub-components (e.g., `ProfileHeader.tsx`, `ProfileStats.tsx`).
- File structure within `src/components/`.

</decisions>

<canonical_refs>
## Canonical References
- `src/components/Profile.tsx` - Target for refactoring
- `src/components/Home.tsx` - Target for refactoring
- `src/components/Groups.tsx` - Target for refactoring
</canonical_refs>

<specifics>
## Specific Ideas
- `Profile.tsx`: Split into `ProfileHeader`, `ProfileStats`, `ProfileBio`, `ProfileRides`, `EditProfileModal`.
- `Home.tsx`: Split into `HomeHeader`, `EcosystemSection`, `FeaturedRides`, `ActiveRides`.
- `Groups.tsx`: Split into `GroupsHeader`, `RideCard`, `PasscodeModal`.

</specifics>

<deferred>
## Deferred Ideas
- Redux/Zustand migration (out of scope for this refactor).
</deferred>

---

*Phase: 03-component-deconstruction*
*Context gathered: 2026-04-24*
