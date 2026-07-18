# 01 - Local API Integration

## Goal

Make the browser able to load the client and call the development API
deliberately and securely. Do this before debugging UI code: a browser blocks
cross-origin requests before your JavaScript can use the response.

## Why this is necessary

The client and API are separate projects. If the client is served at
`http://localhost:8080` and the API is at `https://localhost:7152`, those are
different origins because their scheme and port differ.

`Program.cs` currently has HTTPS redirection and endpoint mapping, but no
`AddCors` or `UseCors` configuration. Therefore a browser-hosted client cannot
reliably call the API from a separate local origin.

Opening `index.html` directly with a `file://` URL is also not a useful
development setup. It creates unusual origin rules and makes ES module and
network behavior differ from a real site.

## Recommended implementation

Use a fixed local static-server origin for the client and a narrowly scoped
CORS policy for that origin.

Choose and write down one client URL, for example:

```text
http://localhost:8080
```

Then configure the API with a named development policy conceptually equivalent
to this:

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("SongBookClient", policy =>
    {
        policy.WithOrigins("http://localhost:8080")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// After app is built, before endpoint mapping:
app.UseCors("SongBookClient");
```

Use the exact origin you chose. `http://localhost:8080` and
`http://localhost:3000` are different origins.

The API should remain responsible for CORS. The client cannot bypass browser
CORS protection with a JavaScript setting.

## Suggested implementation steps

1. Read the existing API startup file:
   `SongBookApi/src/SongBookApi.Service/Program.cs`.
2. Choose the client development URL before adding a CORS policy.
3. Add a named API CORS policy that allows only that development URL, the
   headers needed for JSON, and the HTTP methods used by the client.
4. Place `UseCors` in the middleware pipeline before the song endpoints.
5. Start the API using its HTTPS profile.
6. Start a static web server in the `SongBookClient` directory and open the
   chosen `http://localhost:...` address, not the file directly.
7. Load the page, open browser developer tools, and confirm that
   `GET https://localhost:7152/songs` succeeds without a CORS error.
8. Put the API base URL in one clearly named frontend constant so it is not
   repeated in multiple functions.

For a temporary zero-package static server, Python can serve the current
directory when it is installed:

```sh
python3 -m http.server 8080
```

This command is a development host, not a client dependency and not a build
step.

## HTTPS and certificates

The API redirects HTTP traffic to HTTPS. If the local ASP.NET Core development
certificate is not trusted, the browser may block the request before CORS is
considered.

First visit `https://localhost:7152/songs` in the browser. If the browser
shows a certificate warning, fix the development certificate rather than
adding insecure fetch options. Browser `fetch` does not support the equivalent
of curl's `-k` flag.

On a typical .NET development machine, the relevant command is:

```sh
dotnet dev-certs https --trust
```

Read its output and follow the operating-system prompt. Do not run this on a
shared or production server without understanding the effect.

## Useful experiments

Try these in the browser Network panel:

1. Load the client before adding CORS and observe the CORS failure.
2. Make the request after adding the exact allowed origin.
3. Change the client port and observe that CORS fails again.
4. Visit the HTTPS API directly to distinguish a certificate problem from a
   CORS problem.

Learning to identify the browser's exact error message will save time on every
future web project.

## Common failures

| Symptom | Likely cause | What to inspect |
| --- | --- | --- |
| `CORS policy` error | The API does not allow the client origin. | Exact scheme, host, and port in `WithOrigins`. |
| `Failed to fetch` with a certificate page | The local HTTPS certificate is untrusted. | Open the API URL directly in the browser. |
| Request goes to `http://localhost:5068` then fails | HTTPS redirection changes the destination. | Use the HTTPS API base URL after trusting the cert. |
| Page works as a file but not from a server, or vice versa | The client is using `file://` instead of a normal web origin. | Use one static server URL consistently. |
| `404` from the API | Wrong path or server port. | Check the Network request URL and API launch settings. |

## Alternatives

### Serve the client from the API origin

The API can host the static HTML, CSS, and JavaScript files. This removes CORS
because the browser sees a single origin.

- Good for: a small app deployed as one unit.
- Trade-off: frontend files become part of the ASP.NET Core hosting setup.
- Learn next: ASP.NET Core static files and `UseStaticFiles`.

### Use a different static server

VS Code Live Server, a small Node-based server, or an IDE host can serve the
client. They are all acceptable if their port is fixed and included in the
CORS policy.

- Good for: automatic reload during development.
- Trade-off: an extra local tool and a different port to document.

### Allow every origin during local development

`AllowAnyOrigin()` is quick for a throwaway experiment, but it hides the
important origin decision and is unsafe for an authenticated production API.
Prefer the named, explicit-origin policy even for learning.

## Resources

- [MDN: Same-origin policy](https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy)
- [MDN: CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS)
- [Microsoft: Enable CORS in ASP.NET Core](https://learn.microsoft.com/aspnet/core/security/cors)
- [Microsoft: Trust the ASP.NET Core HTTPS development certificate](https://learn.microsoft.com/aspnet/core/security/enforcing-ssl)

## Checkpoint

You are ready for the next document when a normal browser page served from the
chosen client URL can perform `GET /songs`, and the Network panel shows a
successful HTTPS response instead of a CORS or certificate error.

