# 08 - Delete Flow

## Goal

Implement `DELETE /songs/{id}` in a way that makes the destructive action
clear, avoids duplicate requests, and restores a truthful UI after success or
failure.

## Recommended first interaction

Use a Delete button on each song row and optionally in the selected-song
details. Before sending the request, ask for confirmation with the song title:

```text
Delete "Amazing Grace"? This cannot be undone.
```

For the first version, `window.confirm()` is acceptable. It is browser-native,
keyboard accessible, and lets you focus on correct request/state behavior.

## Delete flow

```text
Click Delete for a song
  -> find the song ID and display name
  -> ask for confirmation
  -> if cancelled, change nothing
  -> mark this delete action busy
  -> DELETE /songs/{id}
  -> clear selection if it was deleted
  -> refresh the collection from the API
  -> show success notice
```

Use `encodeURIComponent(id)` when the API adapter builds the route. GUIDs are
safe in practice, but encoding is a good general habit for URL path values.

## Why refresh after delete

You could remove the item from `state.songs` immediately. However, fetching
the collection after a successful response is simpler and proves the server's
actual state. It also avoids bugs if future server logic deletes related data
or reorders results.

For this small in-memory API, correctness and clarity are more valuable than
an optimistic update.

## Handle outcomes explicitly

| Outcome | UI behavior |
| --- | --- |
| User cancels confirmation | Do not call the API or change the list. |
| `204 No Content` | Refresh list, clear deleted selection, announce success. |
| `404 Not Found` | Explain it was already removed, then refresh list. |
| Network or `500` error | Keep list and selection unchanged, show failure, re-enable Delete. |

If the selected song is deleted from another browser tab, a later detail load
may return `404`. Reuse the same missing-song recovery behavior from document
06.

## Prevent repeated deletion

While the request is pending:

- Disable the clicked Delete button.
- If there is a global busy flag, avoid blocking unrelated actions longer than
  necessary.
- Do not remove the row before the server confirms success.
- Always restore the disabled control when the request fails.

At this app size, tracking `deletingSongId` is often clearer than one global
`isSaving` flag. It lets only the affected row show a busy state.

## Implementation steps

1. Add a Delete button with a `data-song-id` value to every rendered list row.
2. Use a click listener to identify the correct song without relying on
   displayed title text.
3. Find the current song in `state.songs` for the confirmation wording.
4. Ask for confirmation before invoking `deleteSong(id)`.
5. Set and render a busy state.
6. On success, clear selected state when IDs match and refresh the list.
7. On `404`, refresh anyway because the desired final state is already true.
8. On other failure, preserve state and show an error notice.

## Alternatives

### Native `<dialog>` confirmation

Use a custom confirmation dialog with a Cancel button and a destructive
confirmation button.

- Good for: consistent visual design and richer explanation.
- Trade-off: you must manage focus, Escape, close behavior, and screen-reader
  labels correctly.

Build this only after `window.confirm()` works end-to-end.

### Undo deletion

An Undo button requires either a soft-delete API, a restore endpoint, or a
cached payload that can be recreated with a new ID.

- Good for: user forgiveness.
- Trade-off: the existing API has no undo contract.

Do not advertise Undo until the backend supports it.

### Optimistic deletion

Remove the row before the request completes and put it back if the request
fails.

- Good for: a very responsive interface on slow networks.
- Trade-off: rollback logic and selection recovery add complexity.

Use a server-confirmed refresh first.

## Resources

- [MDN: HTTP `DELETE` method](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods/DELETE)
- [MDN: `window.confirm()`](https://developer.mozilla.org/en-US/docs/Web/API/Window/confirm)
- [MDN: `<dialog>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog)
- [MDN: HTTP status `404 Not Found`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/404)

## Checkpoint

You are ready for refinement when cancel does nothing, successful deletion
removes the song after a server refresh, repeated clicks do not create
duplicate requests, and API failures do not falsely remove the song from the
page.

