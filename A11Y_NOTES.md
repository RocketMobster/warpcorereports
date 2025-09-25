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

Future opportunities:
- Add aria-valuetext on Humor slider to announce semantic states (e.g., "No humor", "Moderate", "Maximum humor") even when not at 0/5/10.
- Provide a global Skip to Main Content link for faster keyboard navigation.
- Evaluate color contrast of secondary text (e.g., slate-300 on dark backgrounds) against WCAG AA.
- Add reduced motion preference handling for any remaining animated transitions.
- Announce major panel openings (e.g., Crew Manifest expand/collapse) via polite live region for context changes.
- Ensure drag-and-drop operations announce source/target positions (dnd-kit ARIA customization) for full keyboard + SR parity.
