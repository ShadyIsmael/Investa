# TODO - Profile V2 HTML refactor

- [ ] Measure current string occurrences in `profile.component.html` for: details, communication, trust; and for: personal, investment, personalization, notifications, security, credit, score.
- [ ] Revert/remove placeholder and legacy section names by replacing `profile.component.html` navigation + @switch block in a single edit.
- [ ] Ensure navigation/switch aligns to ActiveSection: personal, investment, personalization, notifications, security, credit, score.

- [ ] Verify that `profile.component.html` contains exactly one `@case` for each of: personal, investment, personalization, notifications, security, credit, score.
- [ ] Verify that `profile.component.html` contains zero references to: details, communication, trust.
- [ ] After structural alignment, refactor HTML sections as requested and remove trust/communication/KYC widgets (requires evidence check before implementing).
- [ ] Update this TODO.md marking progress after each completed step.

- [ ] Run Windows-compatible frontend build and report status, TS error count, warning count.

