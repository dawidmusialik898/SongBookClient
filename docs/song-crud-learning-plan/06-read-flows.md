# 06 - Read Flows

## Goal

Implement both read operations:

```text
GET /songs
GET /songs/{id}
```

The user should see clear loading, empty, populated, selected, and error
states. Do this before creating the editor so the UI already proves that it can
identify the correct song.

## Collection flow

Use this sequence for initial page load and the Refresh button:

```text
start refresh
  -> set isLoadingList to true
  -> render loading state and disable duplicate refresh
  -> await getSongs()
  -> store returned array in state.songs
  -> render list or empty state
  -> clear loading state
  -> render a success or error notice
```

Do not leave old content visible with a misleading "loaded" message after a
request fails. You can either keep the last successful list and show an error,
or clear it and show an error. For this app, keeping the last successful list
is friendlier, as long as the notice clearly says it may be stale.

## List item design

Each list row should provide:

- Human-readable song identity, such as number, title, and author.
- A View or Edit action.
- A Delete action, which is wired later in document 08.
- A visible selected state when its ID equals `state.selectedSongId`.

Make the whole row a button only if there are no nested buttons. If a row also
contains Edit and Delete buttons, use a non-interactive list item with clearly
labelled action buttons instead.

Create user text with DOM methods:

```text
document.createElement(...)
element.textContent = song.title ?? "Untitled song"
```

Never interpolate song titles or lyrics into `innerHTML`. User-provided text
can otherwise become executable markup.

## Detail flow

When a user chooses a song:

```text
click View/Edit for id
  -> record selectedSongId
  -> set isLoadingSong to true
  -> render a detail loading state
  -> await getSong(id)
  -> confirm that it is still the selected ID
  -> store it as selectedSong
  -> render detail and populate editor
```

Fetching the individual resource is intentional even though the list already
contains a song object. It exercises `GET /songs/{id}` and avoids editing a
stale list representation.

## Prevent stale responses

Fast clicking can create a race:

1. The user requests song A.
2. The user immediately requests song B.
3. B responds first.
4. A responds later and incorrectly replaces B in the editor.

For a beginner-friendly solution, compare the requested ID with
`state.selectedSongId` after the request finishes. Ignore the result if it no
longer matches.

An alternative is to use `AbortController` to cancel the first request when a
new selection begins. Learn the ID comparison first; it is easier to inspect.

## Empty and missing states

Plan for these states explicitly:

| State | What the user should see |
| --- | --- |
| First load pending | "Loading songs..." and disabled duplicate controls. |
| Empty array | "No songs yet. Create the first one." |
| One or more songs | A labelled list of selectable rows. |
| Selected song loading | A detail-area loading message, while the list remains usable. |
| `GET /songs/{id}` returns `404` | Clear selection, refresh collection, and explain that the song was removed. |
| Network or `500` error | A clear failure notice and a way to retry. |

Use an empty-state button that invokes the same create action as the toolbar
button. This gives a new user an obvious next step.

## Detail display before editing

Show a read-only summary above or beside the form:

```text
Title
Author
Original title
Number
Key
Tempo
Parts and their order
```

This helps you compare the loaded API response with the form values while
developing. It also gives a useful View mode if you later decide not to open
the editor immediately.

For null or blank values, display a consistent placeholder such as
"Not provided". Do not display the literal string `null`.

## Implementation steps

1. Make the initial `refreshSongs` use the new `getSongs` adapter.
2. Replace the current list code with DOM-based list rows and stable IDs or
   `data-song-id` attributes.
3. Add the Refresh button behavior.
4. Add a selected-state class based on the selected ID.
5. Add a View/Edit listener that calls `getSong(id)`.
6. Render a detail loading state and then read-only data.
7. Handle a missing selected song by refreshing the list.
8. Test rapid selection to ensure a late response does not show the wrong
   song.

## Alternatives

### Use list data as the editor source

Avoid `GET /songs/{id}` and pass the list object directly into the form.

- Good for: reducing one request.
- Trade-off: the client does not cover the individual-read endpoint and can
  edit stale data.

This is not recommended for the stated CRUD goal.

### Add client-side filtering

A text filter can make larger song lists easier to use.

- Good for: usability once listing works.
- Trade-off: it is extra behavior outside the current API CRUD scope.

Keep it as a later enhancement.

### Use a URL hash for selection

For example, `#song/<id>` can preserve a selected song across refreshes.

- Good for: learning lightweight client-side routing.
- Trade-off: extra parsing and back-button behavior.

Start with in-memory selection first.

## Resources

- [MDN: `dataset`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dataset)
- [MDN: `textContent`](https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent)
- [MDN: `AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)
- [MDN: `aria-current`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-current)

## Checkpoint

You are ready to add writing behavior when a user can load a list, choose any
song, see the correct current detail, refresh the collection, and recover
cleanly if a selected song was deleted elsewhere.

