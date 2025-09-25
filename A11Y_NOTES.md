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

Future opportunities:
- Add aria-valuetext on Humor slider to announce semantic states (e.g., "No humor", "Moderate", "Maximum humor") even when not at 0/5/10.
- Provide a global Skip to Main Content link for faster keyboard navigation.
- Evaluate color contrast of secondary text (e.g., slate-300 on dark backgrounds) against WCAG AA.
- Add reduced motion preference handling for any remaining animated transitions.
- De-duplicate repeated structural announcements (debounce identical messages within a short window).
- Optionally add inert / aria-hidden to background content while dialogs/drawers are open for stricter SR isolation.
- Provide live announcements for drag-and-drop (describe original index, new index, and department changes when reordering crew).
- Add aria-live feedback when crew constraints auto-adjust rank (currently only visual text for 2s).
- ARIA description for Seed lock toggle clarifying Produce vs Reroll behavior.
- Provide a single consolidated "Status" live region (merge toast + structural if verbosity remains low).
