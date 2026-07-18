# 07 - Create and Edit

## Goal

Use one form for both `POST /songs` and `PUT /songs/{id}`. The form should
create plain JavaScript payloads from user input, validate friendly
client-side rules, and never lose the selected song identity.

## Start with scalar fields

Build the first working form with:

```text
Title
Author
Original title
Number
Key
Tempo
```

Each field needs a visible `<label>` and a stable `name` attribute. Using
matching `name` values lets `FormData` read the form predictably.

For example:

```text
name="title"
name="author"
name="originalTitle"
```

Do not use the label text itself as a JavaScript key. Labels are for users and
may change for wording or translation.

## One editor, two modes

Store an editor mode in state:

```text
"create"
"edit"
```

### Create flow

```text
Click New song
  -> set mode to create
  -> clear selected ID and form values
  -> focus the title field
  -> submit form
  -> create payload
  -> POST /songs
  -> select the created ID or refresh the list
```

### Edit flow

```text
Choose a song
  -> GET /songs/{id}
  -> set mode to edit
  -> populate the form from the response
  -> submit form
  -> preserve its ID
  -> PUT /songs/{id}
  -> refresh collection and detail
```

Set the submit button text from mode: "Create song" or "Save changes".
Do not use a separate form merely because the button text changes.

## Form data conversion

`new FormData(form)` is a useful browser API, but every value it returns is a
string. Convert deliberately:

1. Read the named values.
2. Trim surrounding whitespace.
3. Decide whether blank optional fields become `null` or an empty string.
4. Build a new payload object with exact API property names.
5. Attach parts and order from their own editor state.

Use one documented blank-value policy. `null` often communicates "not
provided" more clearly, while `""` is simpler if the API treats the two values
identically.

Do not submit the browser's form element, the `FormData` object, or state
objects directly as JSON. Make an explicit payload so you can inspect it in
the Network panel.

## Client-side validation

The server remains the authority, but the form can prevent obvious mistakes.

Suggested initial rules:

- Title is required for a useful song, if you decide it is a product rule.
- Trim whitespace before checking required fields.
- Show a field-specific message near the problem.
- Move focus to the first invalid field after submit.
- Keep valid user input when validation fails.

If the API intentionally permits a null title, either align the API with the
UI rule or explain why the UI is stricter. Do not create inconsistent rules by
accident.

Use built-in HTML validation first:

```text
required
maxlength
minlength
```

Then add JavaScript only for rules HTML cannot express, such as relationships
between parts and order.

## Parts and order

Only implement this section after document 02's API contract checkpoint.

### Beginner-friendly part editor

Render each part as a fieldset containing:

```text
Part name input
Part text textarea
Move up button
Move down button
Remove part button
```

Add an "Add part" button outside the list. Use buttons rather than
drag-and-drop at first; buttons work with keyboard input and make ordering
logic much easier to learn.

For an existing song, retain each part's stable ID in editor state or a
`data-part-id` attribute. For a new part, create the ID according to the API
contract chosen in document 02.

After every add, remove, or move operation, derive the payload:

```text
parts: [part objects in editor state]
order: [part IDs in display order]
```

Do not let the visual order and the `order` array evolve independently. One
should always be derived from the other.

### Repeated parts

If the product needs a chorus to appear multiple times, distinguish:

- A library of unique parts.
- An `order` sequence that can reference the same part ID more than once.

Do not assume that moving part rows alone supports repeated references. This
is a product decision that belongs in the API contract.

## Save-state behavior

While saving:

- Disable the Save button.
- Disable controls that would change the payload.
- Show "Creating song..." or "Saving changes...".
- Do not clear the form until the API reports success.
- Re-enable controls in both success and failure paths.

After a successful `POST`, use the returned `201` song ID to select the new
song, then refresh the list to use server truth.

After a successful `PUT` with `204`, fetch the song again or refresh the
collection and reselect it. A `204` response has no body to render.

## Cancel and unsaved changes

The first version can make Cancel reset the form to its last loaded song or a
blank create form. Once that works, optionally track whether input differs
from the last saved values and ask before discarding edits.

Do not add a browser `beforeunload` warning as the first implementation. It
is harder to test and can be annoying. Start with an in-page Cancel action.

## Implementation steps

1. Create the scalar form in `index.html`.
2. Add a function that starts create mode and resets form controls.
3. Add a function that fills form controls from a fetched song.
4. On form submit, call `event.preventDefault()`.
5. Validate and construct a plain payload.
6. Branch on editor mode to call `createSong` or `updateSong`.
7. Refresh data only after a successful request.
8. Add the parts editor after round-trip API tests pass.
9. Test that the selected song ID cannot be accidentally changed by form
   input.

## Alternatives

### Separate create and edit forms

- Good for: drastically different fields or workflows.
- Trade-off: duplicated validation, markup, and payload code.

The SongBook fields are almost identical, so a shared form is recommended.

### JSON textarea for parts

- Good for: testing a stabilized API contract before building controls.
- Trade-off: users must understand JSON, and errors are harder to explain.

Use it only as a temporary developer tool.

### Drag-and-drop ordering

- Good for: polished interfaces with many parts.
- Trade-off: pointer and keyboard accessibility, hit targets, and complex
  reorder state.

Move-up and move-down buttons are the best first implementation.

## Resources

- [MDN: `FormData`](https://developer.mozilla.org/en-US/docs/Web/API/FormData)
- [MDN: Client-side form validation](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Form_validation)
- [MDN: `preventDefault()`](https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault)
- [MDN: `<fieldset>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/fieldset)
- [MDN: Focus management](https://developer.mozilla.org/en-US/docs/Web/Accessibility/Guides/Keyboard-navigable_JavaScript_widgets)

## Checkpoint

You are ready for deletion when a user can create a song, find it in the list,
open it again, change a field, save it, refresh the page data, and see the
changed value returned by the API.

