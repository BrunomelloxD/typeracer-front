# LESSONS - auto-maintained by scripts/lessons.py

> Machine-owned. Do NOT hand-edit. Changes are overwritten on the next `lessons.py` write.
> Canonical state lives in `.specs/lessons.json`. Edit lessons only via the script.
> promote_threshold=2 distinct features · window_days=45 · quarantine_threshold=2

## Confirmed (load these at Specify/Design)

Corroborated across multiple features. Safe to apply as guidance.

_none_

## Candidates (under observation - do NOT load as guidance yet)

Seen once or not yet corroborated. Tracked, not trusted.

### L-001 - State whether keyboard-only controls such as skip links are in scope of touch-target size requirements and size them to the same minimum
- signal: `spec_precision_gap` · recurrence: 1 feature(s) · scope: `ui-a11y` · harmful: 0
- features: ux-redesign
- evidence: GLOB-07 src/App.tsx:13 (ui-a11y)
- last seen: 2026-10-16T19:19:32Z

### L-002 - Define the focus indicator for visually hidden proxy inputs explicitly instead of relying on the global focus-visible outline
- signal: `spec_precision_gap` · recurrence: 1 feature(s) · scope: `ui-a11y` · harmful: 0
- features: ux-redesign
- evidence: GLOB-05 src/components/TypingArea.tsx:177 (ui-a11y)
- last seen: 2026-10-16T19:19:32Z

## Quarantined (failed when applied - ignore)

A confirmed lesson that recurred alongside failure. Kept for the maintainer to review.

_none_
