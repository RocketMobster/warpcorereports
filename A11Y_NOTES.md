# Accessibility Enhancements (Work In Progress)

This file documents recent a11y upgrades so future changes can follow the same patterns.

Enhancements implemented:
- Global visible focus ring using :focus-visible on interactive controls (buttons, lcars-btn, lcars-cta, inputs, selects, sliders).
- Dynamic aria-labels for randomizer (dice) buttons include current value context (e.g. humor level, problems count, problem detail level, graph count).
- ShareDialog: Added role="dialog", aria-modal, Escape key close, and an explicit Close button with initial focus behavior.
- Added dynamic aria-label for crew lock toggle reflecting state (Locked vs Unlock).
- Consistent title + aria-label alignment across buttons performing actions.

Future opportunities:
- Consider focus trapping inside modal dialogs (HelpPanel, ShareDialog) for stricter keyboard containment.
- Provide live region announcements for toast messages.
- Add aria-describedby to sliders to associate contextual helper text (e.g., humor level labels).
- Add reduced motion preference handling (some exists already for zoom transitions).
