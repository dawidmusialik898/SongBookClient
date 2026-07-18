# 10 - Validation and Documentation

## Goal

Prove that the full CRUD workflow works against the real API, then record the
few local setup facts a future developer needs to reproduce it.

Do not stop after a happy-path demo. Most CRUD bugs appear around empty
responses, missing records, browser restrictions, and failed requests.

## Pre-flight checklist

Before testing the UI:

- [ ] The API starts on the documented HTTPS URL.
- [ ] The browser trusts the local HTTPS certificate.
- [ ] The client is served from the documented HTTP origin, not `file://`.
- [ ] The API CORS policy allows exactly that client origin.
- [ ] The browser Network panel shows requests going to the intended API URL.
- [ ] The API contract changes from document 02 are complete, or the UI
      intentionally limits itself to scalar fields.

## Manual CRUD acceptance script

Run this sequence in a fresh browser session:

1. Load the page and confirm the initial list request is `GET /songs`.
2. If the list is empty, confirm the empty state explains how to create a song.
3. Create a song with all supported scalar fields.
4. Confirm the request is `POST /songs`, has JSON content, and receives
   `201 Created`.
5. Confirm the new song appears in the list with the API-returned ID.
6. Select it and confirm a `GET /songs/{id}` request loads its details.
7. Change at least two fields and save.
8. Confirm the request is `PUT /songs/{id}`, sends the intended ID/payload,
   and handles the `204` response without JSON parsing errors.
9. Reload the data from the API and confirm the changed values remain.
10. Delete the song.
11. Cancel once and confirm no network request occurs.
12. Confirm once and verify `DELETE /songs/{id}` returns `204`.
13. Confirm the row and selected detail are removed after refresh.

Repeat the create, view, edit, and delete sequence for parts and order after
the API's round-trip identity contract is complete.

## Failure cases to test

| Scenario | Expected behavior |
| --- | --- |
| API process is stopped | User sees a useful connection error; no fake success state appears. |
| API returns `500` | User sees an action-specific failure and can retry. |
| Selected song is deleted elsewhere | Detail load handles `404`, clears selection, and refreshes list. |
| Delete target was already removed | UI reports the state and refreshes rather than crashing. |
| Form has missing required title | Browser or inline validation prevents request and focuses the field. |
| Double-click Save | Only one request is sent while saving is busy. |
| Rapidly choose two songs | A late response cannot overwrite the newer selection. |
| API restarts | UI can reload, and documentation explains that in-memory songs reset. |
| Narrow browser viewport | List and editor remain readable and reachable. |
| Keyboard-only navigation | All actions, form controls, and cancellation are usable. |

Use the Network panel for every test. Inspect:

```text
Request URL
Request method
Request headers
Request payload
Response status
Response body, when applicable
```

This turns tests into an HTTP learning exercise instead of a visual guess.

## API-level smoke testing

The API repository contains `utils/simpleCurl.ps1`, which already sketches
requests for the song endpoints. Update its example IDs and payload shapes
when the API contract changes, then use it to distinguish backend behavior
from frontend behavior.

The service also has a `.http` file. It is a useful place to keep a concise
manual endpoint collection if your editor supports HTTP request files.

Test backend behavior first when a browser request is surprising:

```text
curl/API request succeeds, browser fails -> inspect CORS, certificate, or UI.
curl/API request fails too -> inspect API implementation and contract.
```

Remember that curl's `-k` can ignore a local certificate problem, while a
browser does not. A successful curl request is not proof that browser HTTPS is
configured correctly.

## Alternatives

### Manual browser testing

Manual testing is the right first step for this small vanilla application. It
lets you learn the browser Network panel, CORS behavior, form interaction, and
accessibility without adding a test tool.

- Good for: the first end-to-end CRUD implementation.
- Trade-off: repeated regressions require a person to execute the checklist.

### Native Node tests for pure functions

After the behavior is stable, make logic easier to test by extracting pure
functions such as:

```text
buildSongPayload(formValues, parts)
validateSongPayload(payload)
isLatestSelection(requestedId, selectedId)
```

If Node.js is already available, its built-in `node:test` runner can test such
pure functions without adding a package. Keep DOM integration tests manual
until there is a real need for a browser test tool.

- Good for: payload creation and validation rules.
- Trade-off: it does not test browser DOM behavior or real CORS requests.

### Browser end-to-end tests

Later, a browser automation tool can drive the complete CRUD acceptance
script.

- Good for: protecting an application with many repeatable flows.
- Trade-off: it adds dependencies, test data setup, and maintenance.

Do not add a test framework just to satisfy a checklist. Add one when the
project has enough repeated regression risk to justify its setup and
maintenance.

## Documentation to add or update

Add a short `SongBookClient/README.md` once the implementation is working.
It should contain:

1. A one-sentence description of the client.
2. Required runtimes or tools, if any.
3. How to start the API.
4. How to serve the client locally.
5. The client origin and API base URL.
6. The required CORS policy and HTTPS certificate note.
7. A brief explanation that data is in memory and resets with the API.
8. The supported CRUD operations.

Keep the setup commands copyable and use the same ports that the source code
and CORS configuration actually use.

## Final review questions

Before calling the work complete, answer these without looking at code:

- Where is the single API base URL defined?
- Which module performs raw `fetch` calls?
- What happens when the API returns `204`?
- What happens when `GET /songs/{id}` returns `404`?
- Why is the route ID authoritative for `PUT`?
- How are part IDs and order preserved?
- What browser origin is allowed by CORS?
- How does a keyboard user create, save, cancel, and delete a song?

If any answer is unclear, improve the code or documentation until it is
obvious.

## Resources

- [MDN: Network requests in browser developer tools](https://developer.mozilla.org/en-US/docs/Learn_web_development/Howto/Tools_and_setup/What_are_browser_developer_tools)
- [MDN: HTTP overview](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview)
- [Microsoft: ASP.NET Core integration testing](https://learn.microsoft.com/aspnet/core/test/integration-tests)
- [Node.js: Test runner](https://nodejs.org/api/test.html)

## Checkpoint

The work is complete when the acceptance script passes in a normal browser,
failure states are truthful, and the client README lets another developer run
the pair of projects without discovering hidden CORS, certificate, or
in-memory-data assumptions.
