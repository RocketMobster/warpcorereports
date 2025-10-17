# Accessibility Enhancements (Work In Progress)

This file documents recent a11y upgrades so future changes can follow the same patterns.

Enhancements implemented:
- Global visible focus ring using :focus-visible on interactive controls (buttons, lcars-btn, lcars-cta, inputs, selects, sliders).
- Dynamic aria-labels for randomizer (dice) buttons include current value context (e.g. humor level, problems count, problem detail level, graph count).
- ShareDialog: role="dialog", aria-modal, Escape close, initial focus, focus trap (Tab/Shift+Tab cycles within dialog).
- HelpPanel: focus trap and Escape close support.
- Added dynamic aria-label for crew lock toggle reflecting state (Locked vs Unlock).
- Consistent title + aria-label alignment across action buttons.
- Added dual aria-live regions for toast messages: assertive (onscreen) and polite (off-screen) to balance immediacy and verbosity.
- Added aria-describedby connections for all sliders (mobile + desktop) linking helper text (counts, units, conditional humor labels, memory window) so screen readers announce context.
- Hybrid accessible-disabled pattern for export / share / print buttons (focusable, aria-disabled, shared descriptive hint, consistent visual state).
- Copy Full (TXT) buttons aligned with disabled styling pattern (desktop + mobile).
- Escape key now closes ALL modal surfaces: ShareDialog, HelpPanel, CrewManifestPanel, and every Drawer (Export, Settings, Crew, etc.).
- Focus trapping added to Drawers (previously only HelpPanel / ShareDialog trapped focus).
- Focus return: each dialog/panel restores focus to the invoking control when closed (ShareDialog, HelpPanel, CrewManifestPanel, Drawers).
- Structural live region (polite) announces open/close events: "Share dialog opened/closed", "Crew manifest panel opened", etc.
- CrewManifestPanel now announces open/close and restores focus to its trigger.
- Drawer initial automatic focus (first focusable or close button) for keyboard efficiency.

Current Status and Future Opportunities:

Recently Completed:
✅ Added live announcements for crew rank adjustments
✅ Enhanced focus ring visibility and contrast
✅ Added CSS design tokens for consistent theming
✅ Improved contrast ratios for borders and text
✅ Added high contrast mode toggle
✅ Enhanced keyboard navigation feedback
✅ Unified status messaging regions
✅ Enhanced drag and drop accessibility

Temporarily Reverted (Due to Interaction Issues):
❌ Inert/aria-hidden background content during modal display
❌ Aggressive pointer-events handling
❌ Complex z-index layer changes

Remaining Backlog:
🔲 Skip to Main Content link for faster keyboard navigation
🔲 Evaluate remaining color contrasts against WCAG AA
🔲 Add reduced motion preference handling for remaining transitions
🔲 De-duplicate repeated structural announcements
🔲 Complete drag-and-drop announcements
🔲 ARIA description for Seed lock toggle
🔲 Consider consolidating status regions if verbosity stays low

Note: Some features were temporarily reverted due to interaction issues with modals and drawers. These will be revisited with a different implementation approach in the future.

---

## Mirrored Public Checklist (Source of Truth Mapping)

This section mirrors the concise checklist in `README.md` and maps it to the more detailed implementation notes above. If you update one, update the other to keep external and internal narratives aligned.

### Legend
✅ Implemented  |  ⏳ Planned / Backlog

### Checklist
✅ Global visible focus indicator (see: focus ring strategy, top section)
✅ Escape close + focus return for dialogs, drawers, and panels (ShareDialog, HelpPanel, CrewManifestPanel, all Drawers)
✅ Focus trap for modal/dialog surfaces (ShareDialog, HelpPanel, Drawers)
✅ Dual live regions (assertive + polite) for toasts/status (toast vs structural separation)
✅ Structural open/close announcements (polite region events)
✅ `aria-describedby` wiring for all sliders (desktop + mobile variants)
✅ Dynamic aria labels for per-control randomize buttons (dice buttons contextualized)
✅ Accessible disabled pattern for gated export/share actions (focusable + aria-disabled + shared hint)
✅ Crew lock toggle announces current state (dynamic aria-label)
✅ Initial focus placement in dialogs/drawers (deterministic first-focus rule)
✅ Consistent icon button labeling (title + aria-label parity)
✅ `aria-valuetext` on Humor slider (semantic mid-values)
✅ Skip to “Main Content” link (keyboard efficiency)
✅ Drag & drop live announcements (initial grab / move / drop scaffolding)
⏳ Live announcement for auto rank adjustments (constraint enforcement)
✅ Debounce duplicate structural announcements (spam prevention)
⏳ Optional background inerting (`inert` / `aria-hidden` layering) while modals are open
⏳ Contrast audit of secondary text & borders (WCAG AA validation)
✅ Reduced motion refinements (respect prefers-reduced-motion fully)
⏳ Consolidated single status region (evaluate merging toast + structural)
✅ ARIA description for Seed lock toggle (clarify Produce vs Reroll nuance)

### Update Procedure
1. Implement feature.
2. Update "Enhancements implemented" list (with concise bullet).
3. Mark corresponding checklist line ✅ here and in `README.md`.
4. If adding a new future item, append to both the Future opportunities list and the mirrored checklist (⏳ state) to maintain parity.

### Notes
- Some backlog items (DnD announcements, consolidated status region) may influence existing architecture—flag them as potential refactors during implementation planning.
- Debounce logic should avoid swallowing legitimate rapid sequential announcements (e.g., user rapidly opening/closing two distinct panels) by scoping uniqueness to message + 800–1000ms window.
- When adding `aria-valuetext` for Humor, preserve existing descriptive helpers—SR output should become: numeric value + qualitative state + any existing described-by context (consider order).

