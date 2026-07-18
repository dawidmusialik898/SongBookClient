# 02 - API Contract Safety

## Goal

Understand and resolve the backend behaviors that would otherwise make a
frontend appear to save data while silently changing or losing song identity.

This stage is mostly API work, but it protects every later client feature.

## Current song shape

The domain `Song` currently contains:

```text
id: GUID
title: string or null
author: string or null
originalTitle: string or null
number: string or null
key: string or null
tempo: string or null
parts: Part[] or null
order: GUID[] or null
```

Each `Part` has an ID, a name, and text. The `order` array is intended to
reference part IDs.

## Issue 1: the route ID is ignored during updates

The endpoint receives both:

```text
PUT /songs/{id}
body: { "id": "...", ... }
```

`SongEndpoints.UpdateSong` passes the route ID to `SongService`, but
`SongService.UpdateSongAsync` currently passes only `songDto` to the
repository. The repository therefore chooses the body ID and ignores the route
ID.

That makes these two IDs potentially disagree. A client that edits one row
could accidentally update another song if it sent stale or malformed data.

## Recommended update rule

Make the route ID authoritative. The server should update only the song named
by `/songs/{id}`.

For a small learning project, the simplest rule is:

1. Receive the route ID.
2. Reject a body ID that conflicts with it, or ignore the body ID.
3. Set the domain object's ID from the route ID before calling the repository.
4. Return `404` if that route ID does not exist.

The client should still preserve the selected song ID and use it in both the
URL and the body until the server no longer needs a body ID.

## Better long-term contract

Separate transport requests from the persisted domain object:

```text
CreateSongRequest: title, author, originalTitle, number, key, tempo, parts, order
UpdateSongRequest: title, author, originalTitle, number, key, tempo, parts, order
Song response:    id, title, author, originalTitle, number, key, tempo, parts, order
```

The route owns identity for updates and the server owns identity for creates.
This means the client never needs to invent or trust a song UUID.

This is a useful pattern even in larger APIs: request DTOs describe what users
may submit; response DTOs describe what the server returns.

## Issue 2: part IDs cannot be safely round-tripped

`Part.Id` currently has a getter but no setter and its constructor creates a
new GUID. A JSON request cannot reliably restore a part's existing ID into
that object. On an edit, the server can create fresh part IDs while receiving
an `order` array that still refers to the old IDs.

Do not build a polished parts-and-order editor until this contract is fixed.
It could look successful in the browser while the saved structure is wrong.

## Recommended part contract

Choose one of these models and document it before implementing the UI.

### Option A: editable IDs in a simple DTO

Use request/response DTOs where `Part.Id` can be read and written by JSON.
Validate that IDs are unique within a song and that every `order` ID references
one of the submitted parts.

- Good for: keeping the existing `order: GUID[]` design.
- Trade-off: the API accepts IDs from the client, so it must validate them.

### Option B: server-generated IDs plus explicit mapping

Use a request part identifier that is only temporary, such as a client key,
then have the server map it to persistent IDs before building `order`.

- Good for: strict server ownership of persistent IDs.
- Trade-off: more DTO and mapping code.

### Option C: represent display order directly

If order only means "show parts in this sequence", make the `parts` array
itself the source of order and remove the separate `order` property.

- Good for: the simplest browser UI.
- Trade-off: not appropriate if the same part needs to appear multiple times,
  such as a chorus repeated between verses.

Option A is the most direct fit for the current model. Option C is often
easier if repeated parts are not a real feature.

## API validation decisions

The current API allows nullable strings and has no documented validation.
Decide which rules belong on the server before duplicating them in the client.

At minimum, consider:

- Whether a title must be non-empty.
- Maximum lengths for text fields.
- Whether `number` must be unique.
- Whether a part name is required when part text exists.
- Whether `order` may omit parts or repeat a part ID.

The browser can provide friendly early validation, but the API must validate
every request because callers can bypass the browser.

## Implementation checklist

- [ ] Read `SongEndpoints.cs`, `ISongService.cs`, and
      `InMemorySongRepository.cs` together.
- [ ] Write the desired update identity rule in a test or an `.http` request.
- [ ] Make `PUT /songs/{id}` use route identity consistently.
- [ ] Decide and implement one part/order identity model.
- [ ] Return meaningful client errors for malformed requests, rather than
      storing inconsistent data.
- [ ] Retest create, fetch one, update, and fetch one again.
- [ ] Update `utils/simpleCurl.ps1` or the API `.http` file so examples match
      the final contract.

## Useful manual scenario

Create two songs, A and B. Send a `PUT` request to A's URL with B's ID in the
body. The endpoint must never update B. This is the clearest test that the
route ID is truly authoritative.

## Alternatives

### Defer rich parts editing

Implement CRUD for the scalar song fields first and submit `parts` and `order`
as empty arrays. This is a practical learning milestone, but make the UI clear
that lyrics/parts are not yet supported.

### Send raw JSON for advanced data

A temporary JSON textarea lets advanced users submit `parts` while the visual
editor is being designed.

- Good for: exercising the API quickly.
- Trade-off: poor validation and poor usability for normal users.

### Change the API before touching the client

This is the recommended order for correctness. It can feel slower initially,
but it avoids building a client around behavior that needs to change.

## Resources

- [MDN: HTTP `PUT` method](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods/PUT)
- [MDN: HTTP `POST` method](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods/POST)
- [Microsoft: Model binding in ASP.NET Core](https://learn.microsoft.com/aspnet/core/mvc/models/model-binding)
- [Microsoft: System.Text.Json overview](https://learn.microsoft.com/dotnet/standard/serialization/system-text-json/overview)

## Checkpoint

You are ready to build the client editor when a song can be fetched, submitted
back to the API, fetched again, and retain the intended ID, fields, parts, and
ordering.

