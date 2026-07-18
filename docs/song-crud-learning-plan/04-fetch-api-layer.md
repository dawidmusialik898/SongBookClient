# 04 - Fetch API Layer

## Goal

Expand `src/songsApi.js` into a predictable adapter for all five endpoints.
The UI should receive JavaScript values or a meaningful error, never a silent
`undefined` after a failed request.

## Public functions to design

Use names that describe the API action:

```text
getSongs()
getSong(id)
createSong(songPayload)
updateSong(id, songPayload)
deleteSong(id)
```

The corresponding request map is:

| Function | Method and path | Expected success result |
| --- | --- | --- |
| `getSongs` | `GET /songs` | Parsed array |
| `getSong` | `GET /songs/{id}` | Parsed song |
| `createSong` | `POST /songs` | Parsed created song |
| `updateSong` | `PUT /songs/{id}` | No value for `204` |
| `deleteSong` | `DELETE /songs/{id}` | No value for `204` |

## Build one request helper

Instead of copying `try`/`catch` and `response.ok` checks into every exported
function, make one internal helper. Its responsibilities should be:

1. Build the URL from one base URL and a path.
2. Call `fetch`.
3. Send `Content-Type: application/json` only when sending JSON.
4. Read a response body only when the response has one.
5. Treat non-2xx responses as errors.
6. Preserve status code and useful response text in the thrown error.
7. Let `main.js` decide how an error appears to the user.

An update or delete response is `204 No Content`. Do not call
`response.json()` for it. A robust helper can return `undefined` specifically
for `204` after confirming the response was successful.

## Error design

Create a small error shape with information the UI can use:

```text
name: "ApiError"
message: a safe human-readable explanation
status: HTTP status, or null for a network failure
```

The adapter may log technical details during development, but it should throw
the error rather than catch it and return an empty success-shaped value.

In `main.js`, map errors to useful messages:

| Situation | User-facing message |
| --- | --- |
| Network failure or server unreachable | "Could not reach the SongBook API. Check that it is running." |
| `404` while viewing | "This song no longer exists. The list was refreshed." |
| `404` while deleting | "This song was already removed." |
| `400` | Show the API validation message when it is safe and clear. |
| `500` | "The API could not complete the request. Try again later." |

Do not expose stack traces or raw server exception messages in the page.

## Payload guidelines

The API uses camel-case JSON names, such as `originalTitle`. Build payloads as
plain JavaScript objects with that same shape.

For create:

- Omit the song `id`; the server creates it.
- Include optional scalar fields consistently as either `null` or `""`.
- Use `parts: []` and `order: []` until the part contract is safe.

For update:

- Use `encodeURIComponent(id)` when building the path.
- Preserve the selected ID in the request body as a compatibility measure
  until the API fix in document 02 is complete.
- Send the full current payload, not only fields that happened to change,
  because the endpoint behaves like a replacement `PUT`.

## Incremental implementation order

1. Replace `fetchSongs` with `getSongs` while preserving the visible list.
2. Add the common response/error helper.
3. Rename `postSong` to `createSong` and accept a single payload object.
4. Add `getSong`.
5. Add `updateSong`.
6. Add `deleteSong`.
7. Use browser Network tools to inspect each request before connecting it to a
   complex form.

Testing API functions independently first makes UI bugs much easier to
separate from HTTP bugs.

## Avoid these common mistakes

- Do not duplicate the base URL in every function.
- Do not use `mode: "no-cors"`; it makes responses unreadable and does not
  solve the integration problem.
- Do not assume every success response is JSON.
- Do not catch an error, only `console.error` it, and return `undefined`.
- Do not mutate the song object received from the list just to form a request.
  Create a payload object deliberately.
- Do not send a body with `DELETE` unless the API contract requires one.

## Alternatives

### A helper that always returns `{ data, error }`

Instead of throwing, every API function could return:

```js
{ data: null, error: { message, status } }
```

- Good for: applications that want errors represented as normal values.
- Trade-off: callers must remember to check `error` every time.

For this small app, throwing from the API layer and catching at user-action
boundaries is easier to follow.

### `XMLHttpRequest`

It can make the same HTTP calls, but `fetch` has promise-based APIs and is
already supported by modern browsers. Use `fetch` unless you are learning
legacy browser support.

### A third-party HTTP library

Axios and similar libraries offer conveniences, but they do not remove the
need to understand HTTP status codes, CORS, or JSON. Native `fetch` is the
right learning choice here.

## Resources

- [MDN: Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [MDN: Using Fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch)
- [MDN: `Response.ok`](https://developer.mozilla.org/en-US/docs/Web/API/Response/ok)
- [MDN: HTTP status `201 Created`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/201)
- [MDN: HTTP status `204 No Content`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/204)

## Checkpoint

Before building the page UI, use the browser console or a temporary button to
exercise each exported API function. Verify that successes return the expected
shape and failures throw an error with a clear status and message.

