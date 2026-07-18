# Song CRUD Client Learning Plan

## Purpose

This guide is a step-by-step learning path for turning the existing vanilla
JavaScript client into a complete user interface for the SongBook API. It does
not require React, a package manager, or a UI library.

Work through the numbered files in order. Each file has a small, independently
useful outcome, so you can commit and test one stage before starting the next.

## What exists today

The client currently has:

- `index.html`, which contains only an empty song list.
- `src/main.js`, which loads the collection and creates a hard-coded
  "Imagine" song.
- `src/songsApi.js`, which implements only collection `GET` and `POST`.
- `styles/buttons.css`, which styles the temporary buttons.

The API already maps these endpoints:

| User capability | HTTP request | Successful response | Client use |
| --- | --- | --- | --- |
| List songs | `GET /songs` | `200` with `Song[]` | Initial list and refresh |
| View one song | `GET /songs/{id}` | `200` with `Song` | Detail/editor loading |
| Create a song | `POST /songs` | `201` with `Song` | New-song form |
| Edit a song | `PUT /songs/{id}` | `204 No Content` | Existing-song form |
| Delete a song | `DELETE /songs/{id}` | `204 No Content` | Delete action |

The API's default development addresses are `http://localhost:5068` and
`https://localhost:7152`. The client currently targets the HTTPS address.

## Target result

When this plan is complete, a visitor can:

1. Open the client from a local web server.
2. See a loading state followed by the song list.
3. Open a specific song and inspect its complete data.
4. Create a song using a form instead of hard-coded JavaScript values.
5. Edit an existing song and save it.
6. Delete a song only after confirming the action.
7. Receive understandable feedback for loading, success, validation, and API
   errors.

The client remains a small set of browser-native ES modules:

```text
index.html
styles/
  buttons.css
  app.css                 # Add when the UI needs layout and form styles.
src/
  main.js                 # Page state, event handling, and rendering.
  songsApi.js             # All HTTP calls and API errors.
  config.js               # Optional, only if a separate API URL is useful.
```

Do not add a framework merely to render a list or submit a form. The DOM,
`fetch`, `FormData`, and CSS are enough for this application.

## Recommended order

- [ ] Read [01 - Local API integration](01-local-api-integration.md).
- [ ] Resolve the backend contract issues in
      [02 - API contract safety](02-api-contract-safety.md).
- [ ] Set up the client boundaries in
      [03 - Client structure](03-client-structure.md).
- [ ] Make all HTTP calls reliable in
      [04 - Fetch API layer](04-fetch-api-layer.md).
- [ ] Replace the temporary page with the semantic shell in
      [05 - HTML app shell](05-html-app-shell.md).
- [ ] Build list and detail behavior in
      [06 - Read flows](06-read-flows.md).
- [ ] Build the shared editor in
      [07 - Create and edit](07-create-and-edit.md).
- [ ] Add the destructive action safely in
      [08 - Delete flow](08-delete-flow.md).
- [ ] Improve feedback and accessibility in
      [09 - UX and accessibility](09-ux-accessibility.md).
- [ ] Run the acceptance checks and document local setup in
      [10 - Validation and documentation](10-validation-and-docs.md).

## Important API facts to keep in mind

`Song` has scalar properties (`title`, `author`, `originalTitle`, `number`,
`key`, and `tempo`) plus `parts` and `order`.

The current API has two issues that matter to a client:

1. The update service receives the route ID but currently ignores it and
   updates by the `id` inside the request body. Until that is fixed, the
   client must preserve and send the song ID in a `PUT` body.
2. `Part.Id` is read-only and generated in the server constructor. As a
   result, parts and their ID-based `order` cannot be safely round-tripped by
   a browser editor until the API contract is adjusted.

Also, the repository is in memory. A server restart intentionally clears all
songs. Treat that as a development limitation, not a frontend bug.

## Learning principles for this project

- Make one small vertical slice work before expanding it. For example, get
  list loading reliable before adding editing.
- Use the browser Network panel to see the exact request URL, method, body,
  status code, and response.
- Keep the API layer separate from DOM code. A function that calls `fetch`
  should not create HTML elements.
- Keep server data as the source of truth. After mutations, refresh from the
  API rather than guessing the final state locally.
- Render user-provided text with `textContent`, never by inserting it as HTML.
- Prefer simple controls first: an edit side panel and `window.confirm()` are
  easier to make correct than a custom modal or drag-and-drop UI.

## Small glossary

| Term | Meaning in this project |
| --- | --- |
| Origin | The combination of scheme, host, and port, such as `http://localhost:8080`. |
| CORS | Browser rules that decide whether one origin may call another origin's API. |
| API adapter | The `songsApi.js` module that converts HTTP requests and responses into JavaScript values. |
| State | The current data needed to render the page, such as songs, selection, and loading flags. |
| CRUD | Create, Read, Update, and Delete. |
| `204 No Content` | A successful response with no JSON body. Calling `response.json()` on it is an error. |

## Definition of done

The project is complete when all five endpoint rows in the table above are
reachable from the UI, failures do not leave the page in a misleading state,
and a new developer can follow the local setup instructions without guessing
the required URLs or CORS configuration.

