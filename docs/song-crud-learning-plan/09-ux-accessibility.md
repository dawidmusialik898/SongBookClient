# 09 - UX and Accessibility

## Goal

Make asynchronous CRUD behavior understandable and usable with a keyboard,
screen reader, mouse, or touch device. Good feedback is not decoration: it
prevents a user from thinking a failed request succeeded.

## State to make visible

For every API operation, decide what the user sees:

| State | Example feedback |
| --- | --- |
| Loading collection | "Loading songs..." near the list. |
| Loading selected song | "Loading song details..." in the editor region. |
| Saving create | Disable Save and show "Creating song...". |
| Saving edit | Disable Save and show "Saving changes...". |
| Deleting | Disable affected Delete button and show "Deleting...". |
| Success | "Song created", "Changes saved", or "Song deleted". |
| Failure | A clear action-specific message and an available retry path. |
| Empty data | "No songs yet. Create the first one." |

Use state names in code (`isLoadingList`, `isSaving`, `deletingSongId`) that
match these visible conditions.

## Error messages

An error should answer three questions:

1. What action failed?
2. Why, if the reason is known and safe to show?
3. What can the user do now?

Examples:

```text
Could not load songs. Check that the SongBook API is running, then try again.
Could not save changes because the song no longer exists. The list was refreshed.
The title is required before creating a song.
```

Avoid only showing "Error", a console message, or an HTTP number with no
context. Keep technical details in browser developer tools during development.

## Keyboard and focus rules

- Use real `<button>` elements for actions; do not make a generic `<div>`
  clickable.
- Every form field needs a visible label.
- Keep the normal Tab order aligned with the visual order.
- After opening create mode, focus the Title field.
- After a validation failure, focus the first invalid field.
- After deletion, move focus to a useful nearby target, such as the list
  heading or New song button, rather than leaving it on a removed row.
- Make selected list state visible with more than color, such as a border,
  icon, or accessible current-state attribute.

Test the page with the mouse disconnected or ignored: Tab, Shift+Tab, Enter,
Space, and Escape should have predictable results.

## Announcements

Use a persistent live region for messages. The region should exist in the HTML
before its text changes; do not create and immediately remove it.

Use polite announcements for routine status changes. Reserve urgent alerts for
errors that need immediate attention. Do not make every loading message an
alert, or screen-reader users will receive too much interruption.

## Styling guidance

Add `styles/app.css` as the page grows. Cover:

- Readable base font size and line height.
- Clear focus indicator using `:focus-visible`.
- Distinct primary, neutral, and destructive buttons.
- A selected song row state that remains clear without color alone.
- Labels, inputs, and textareas with sufficient spacing.
- Error text near the relevant control.
- Responsive layout that stacks list and editor on small screens.
- Adequate button size for touch input.

Do not remove browser focus outlines without replacing them with an equally
visible style.

## Form accessibility

Use `aria-describedby` to connect an input with a field-specific error message
when needed. For a group of part controls, use `<fieldset>` and `<legend>` so
assistive technology understands that inputs belong together.

For a disabled Save button, make the reason visible in nearby text. A disabled
button cannot receive keyboard focus, so it cannot explain itself on its own.

## Robustness practices

- Disable only the controls that truly must wait; do not freeze the entire
  page for a detail request.
- Preserve typed form data after a network failure.
- Ensure error paths clear loading and busy flags in `finally` blocks.
- Avoid relying on the browser back button for internal state until routing is
  intentionally implemented.
- Do not store authentication-like secrets in frontend constants. This app has
  no authentication currently, but this rule matters later.
- Treat user-entered titles and lyrics as text, never as markup.

## Alternatives

### Toast notifications

Small temporary messages can look polished.

- Good for: brief success feedback.
- Trade-off: they may disappear before a user reads them and require careful
  live-region behavior.

A persistent status area is the recommended first implementation.

### Inline-only messages

Put every message directly near a field or row.

- Good for: field validation.
- Trade-off: global load and network errors have no natural location.

Use inline messages for form validation plus a page-level status area for
network operations.

### Custom accessible widgets

Tabs, custom dropdowns, and drag handles can be useful later.

- Good for: sophisticated interaction.
- Trade-off: keyboard and ARIA requirements are substantial.

Prefer native HTML controls while learning.

## Resources

- [MDN: Web accessibility](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Accessibility)
- [MDN: Keyboard-navigable JavaScript widgets](https://developer.mozilla.org/en-US/docs/Web/Accessibility/Guides/Keyboard-navigable_JavaScript_widgets)
- [MDN: `:focus-visible`](https://developer.mozilla.org/en-US/docs/Web/CSS/:focus-visible)
- [W3C WAI: Forms tutorial](https://www.w3.org/WAI/tutorials/forms/)
- [W3C WAI: Notifications](https://www.w3.org/WAI/WCAG21/Techniques/aria/ARIA19)

## Checkpoint

You are ready for final validation when every asynchronous operation has a
visible start, success, and failure state; all actions work by keyboard; and
errors preserve enough context for the user to recover.

