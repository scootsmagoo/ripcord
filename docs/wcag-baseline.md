# WCAG Baseline (2.2 AA target)

Apply this checklist to all new UI work.

## Structure and Semantics

- [ ] Pages use semantic landmarks (`header`, `nav`, `main`, `aside`, `footer`).
- [ ] Heading levels are logical and never skipped.
- [ ] Form controls have programmatic labels and clear descriptions.
- [ ] Interactive elements use native controls where possible.

## Keyboard and Focus

- [ ] All interactions are reachable and usable by keyboard only.
- [ ] Focus order follows visual/reading order.
- [ ] Focus indicator is visible with sufficient contrast.
- [ ] Skip link exists for bypassing repeated content.

## Color and Contrast

- [ ] Text meets contrast requirements (4.5:1 normal, 3:1 large).
- [ ] Meaning is not conveyed by color alone.
- [ ] Error and status states include text and ARIA cues.

## Motion, Timing, and Feedback

- [ ] Respect `prefers-reduced-motion`.
- [ ] Timeouts and auto-dismiss content are controllable.
- [ ] Async updates (new messages, typing, alerts) are announced accessibly.

## Testing Gates

- [ ] Manual keyboard walkthrough on major flows.
- [ ] Automated accessibility scan integrated in CI.
- [ ] Screen reader smoke test for auth, channels, and message composer.
