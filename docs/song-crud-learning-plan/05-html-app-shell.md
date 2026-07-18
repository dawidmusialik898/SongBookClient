# 05 - HTML App Shell

## Goal

Replace the temporary buttons and empty list with a semantic, accessible page
structure that gives every later JavaScript feature a stable place to render.

Build the shell before filling it with network data. A clear HTML structure
makes JavaScript simpler because each renderer has an obvious target.

## Recommended page layout

Use one `<main>` element with distinct regions:

```text
header
  page title
  New song button
  Refresh button

status region

main content
  song collection section
    heading
    list or empty state
  selected song / editor section
    heading
    detail summary
    form
```

On a narrow screen, stack the list and editor. On a wider screen, use CSS grid
or flexbox to place them side by side.

## Semantic HTML choices

| Need | Recommended element | Why |
| --- | --- | --- |
| Main page content | `<main>` | Identifies the primary content for assistive technology. |
| Song collection | `<section>` with a heading | Groups related content with a meaningful label. |
| Songs | `<ul>` with `<li>` rows | A song collection is naturally a list. |
| Actions | `<button type="button">` | It has keyboard behavior by default. |
| Editor | `<form>` | It provides submit behavior and browser validation. |
| Text fields | `<label>` plus `<input>` or `<textarea>` | Labels make controls understandable and clickable. |
| Feedback | `<p role="status">` or a live region | Announces async updates without stealing focus. |

Give JavaScript-owned containers stable IDs, for example:

```text
app-notice
song-list
empty-song-list
song-details
song-form
```

An ID is a contract between HTML and `main.js`. Choose names based on purpose,
not current visual styling.

## Build the shell in steps

1. Keep the existing module script at the end of `<body>`.
2. Add a visible `<h1>` so the page has a clear purpose.
3. Add a toolbar with "New song" and "Refresh songs" buttons.
4. Add a status container near the top of the content.
5. Add an initially empty song list container.
6. Add a hidden or empty editor section with a heading.
7. Add the form fields only after the list/detail regions are stable.
8. Ensure every button inside a form that is not the save button has
   `type="button"`; otherwise it can accidentally submit the form.

Start with ordinary HTML in `index.html`. Do not create the whole page with
JavaScript; static structure is easier to inspect in browser developer tools.

## Status and error regions

Use two types of feedback deliberately:

- `role="status"` or `aria-live="polite"` for normal events such as "Songs
  loaded" or "Saving song...".
- `role="alert"` only for important errors that should be announced promptly.

Do not replace a user's focused form field with a status message. Put feedback
in a stable area and update its text.

## CSS plan

The existing `styles/buttons.css` can continue to style shared buttons. Add
`styles/app.css` for application layout, form controls, list rows, selected
state, notices, and responsive rules. Link both files from `index.html`.

Useful class names are based on role:

```text
app-layout
toolbar
song-list
song-list__item
song-list__item--selected
notice
notice--error
editor
```

Avoid class names such as `red-text` or `big-div`; they describe current
appearance rather than purpose and become misleading when styles change.

## Form preview

Before wiring JavaScript, manually tab through the future form. A good
starting order is:

```text
Title -> Author -> Original title -> Number -> Key -> Tempo ->
part controls -> Cancel -> Save
```

Use a `<textarea>` for song text because lyrics can contain line breaks. Use
standard text inputs for fields whose domain has not yet been formally limited
by the API.

## Alternatives

### Editor in a side panel

Keep the list visible while editing.

- Good for: comparing the selected song with the collection.
- Trade-off: requires responsive layout rules for narrow screens.

This is the recommended first implementation.

### Editor in a modal dialog

Use the native `<dialog>` element to put editing above the list.

- Good for: focusing attention on one edit.
- Trade-off: focus management, escape behavior, and close behavior need more
  care.

Use this after the ordinary panel works, not as the first UI experiment.

### Separate create and edit pages

Use different HTML pages or hash routes.

- Good for: a larger site with shareable URLs.
- Trade-off: more navigation and state code than this small client needs.

## Resources

- [MDN: HTML forms](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms)
- [MDN: `<label>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/label)
- [MDN: `<button>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/button)
- [MDN: `<main>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/main)
- [MDN: ARIA live regions](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Guides/Live_regions)
- [MDN: CSS grid layout](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Grid_layout)

## Checkpoint

You are ready to add rendering when the static page is understandable without
JavaScript: it has a title, appropriately labelled regions, buttons with clear
purposes, and a form with labels that can be navigated by keyboard.

