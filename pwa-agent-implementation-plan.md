# Agent Implementation Plan: Add PWA Support to a Vite + React SPA

## Objective

Implement Progressive Web App (PWA) support in the existing Vite + React single-page application, including:

- A web app manifest and installable app metadata
- App icons and appropriate theme settings
- A generated service worker and precaching of production assets
- A user-confirmed update prompt
- Automatic update checks on app startup and periodically while the app is open
- Validation of production build, offline behavior, and update behavior

**Primary package:** `vite-plugin-pwa`  
**Target behavior:** New versions may be discovered and downloaded in the background, but the user chooses when to activate an update and reload the app.

## Agent operating instructions

1. Inspect the repository before changing files. Identify the package manager, Vite config format, React entry point, router, CSS conventions, test/lint scripts, deployment base path, and any existing service-worker/PWA implementation.
2. Preserve existing architecture and conventions. Do not replace the router, change frameworks, or overwrite unrelated Vite plugins/configuration.
3. Check installed package versions and the current `vite-plugin-pwa` documentation before relying on APIs. Use the React integration that matches the installed version.
4. Make changes in small, reviewable steps. Do not add duplicate service-worker registration.
5. Do not cache private API responses, authentication endpoints, or personalized user data without an explicit existing requirement and a reviewed strategy.
6. Do not claim the app is installable, offline-capable, or successfully updated unless the corresponding checks have actually passed.
7. Summarize changed files, commands run, test results, and any remaining manual steps at the end.

## Phase 1 — Repository reconnaissance

- [ ] Read `package.json` and lockfile to identify the package manager and available scripts.
- [ ] Locate `vite.config.ts`, `vite.config.js`, or equivalent.
- [ ] Locate the React root and app shell (for example, `src/main.tsx` and `src/App.tsx`).
- [ ] Check whether a service worker, web manifest, PWA plugin, or registration code already exists.
- [ ] Identify `public/` assets, app name/branding, theme colors, and icon assets.
- [ ] Determine whether the app is deployed at `/` or a subpath and inspect SPA fallback requirements.
- [ ] Inspect the current CSS/design system and testing/lint/type-check commands.
- [ ] Record findings and a brief implementation proposal before editing.

**Acceptance criteria:** The agent understands the existing setup and can explain which files it plans to change without duplicating existing functionality.

## Phase 2 — Install and configure PWA support

### Dependencies

- [ ] Add `vite-plugin-pwa` as a development dependency using the repository's package manager.
- [ ] Add `workbox-window` only if required by the selected React integration/version.
- [ ] Avoid unrelated dependency upgrades.

### Vite configuration

- [ ] Add `VitePWA(...)` to the existing Vite plugins list while preserving all current plugins and options.
- [ ] Configure `registerType: 'prompt'` so updates are user-confirmed.
- [ ] Configure a web app manifest with:
  - [ ] `name`
  - [ ] `short_name`
  - [ ] `description`
  - [ ] `start_url` and appropriate `scope`
  - [ ] `display: 'standalone'`
  - [ ] `theme_color`
  - [ ] `background_color`
  - [ ] 192×192 and 512×512 PNG icons
  - [ ] Appropriate `purpose: 'any maskable'` icon metadata where a maskable-safe asset exists
- [ ] Include appropriate existing public assets such as a favicon and Apple touch icon.
- [ ] Respect Vite's `base` configuration for subpath deployments.
- [ ] Use the plugin's generated service worker and Workbox precaching unless the repository already has a deliberate custom service-worker implementation.
- [ ] Do not add runtime caching for APIs by default.

**Acceptance criteria:** A production build generates the manifest and service worker, and the generated manifest references valid assets and the correct deployment path.

## Phase 3 — Add and verify app icons

- [ ] Reuse existing branded assets if suitable.
- [ ] If missing, create or request appropriate app icons and place them in `public/`.
- [ ] Ensure the 192×192 and 512×512 files are real PNG assets with the declared dimensions.
- [ ] Ensure any maskable icon has adequate safe-zone padding and does not crop important branding.
- [ ] Ensure paths in the manifest and `includeAssets` exactly match actual filenames.

**Acceptance criteria:** No missing icon requests in the browser or build output; icon metadata matches the actual files.

## Phase 4 — Implement a root-level update/offline prompt

- [ ] Add a component such as `src/components/ReloadPrompt.tsx` using `useRegisterSW` from `virtual:pwa-register/react`.
- [ ] Show an “Update available” message when `needRefresh` becomes true.
- [ ] Provide an **Update now** action that calls `updateServiceWorker(true)`.
- [ ] Provide a **Later** action that dismisses the current prompt without activating the waiting worker.
- [ ] Optionally show an “Ready to work offline” message when `offlineReady` is true.
- [ ] Provide a dismiss action for the offline-ready message.
- [ ] Use accessible semantics: meaningful button labels, visible focus states, sufficient contrast, and a suitable live region.
- [ ] Style the prompt using the project's existing design system; avoid conflicting with modals, navigation, or mobile safe areas.
- [ ] Render the prompt exactly once near the application root, outside route-specific components.
- [ ] Keep service-worker registration in one place only.
- [ ] Handle registration errors with useful development diagnostics without exposing sensitive data to users.

**Acceptance criteria:** The prompt appears only when appropriate; “Later” does not reload the page; “Update now” activates the waiting worker and reloads the app.

## Phase 5 — Add automatic update checks while the app is open

- [ ] Use the service-worker registration callback supported by the installed `vite-plugin-pwa` version.
- [ ] Trigger an update check when the registration becomes available if appropriate.
- [ ] Add a configurable periodic check, defaulting to once per hour, while the app is open.
- [ ] Call `registration.update()` only when a registration exists and the browser is online.
- [ ] Clear any interval on component cleanup/unmount; avoid creating multiple timers during re-renders or React Strict Mode.
- [ ] Handle errors without causing repeated noisy logs or breaking the app.
- [ ] Explain that periodic checks require the app's page to remain open; they do not guarantee background updates when the browser is closed.
- [ ] Do not automatically activate the update: preserve the user-confirmed prompt flow.

**Implementation note:** Prefer a stable registration lifecycle and a cleanup-safe effect or equivalent pattern. Do not put an unmanaged `setInterval` inside a callback that may run more than once. Confirm the callback signature and behavior against the installed plugin version.

**Acceptance criteria:** The app checks for updates on startup/registration and periodically while open; checks are cleaned up correctly; new versions can trigger the prompt without automatic reload.

## Phase 6 — SPA routing, hosting, and caching review

- [ ] Confirm that the host serves `index.html` for valid client-side routes on direct navigation and refresh.
- [ ] Confirm that generated asset URLs and service-worker scope work with the deployment base path.
- [ ] Review default precaching size and exclusions; avoid precaching unnecessarily large files.
- [ ] Confirm that the app shell can load from cache after a successful initial visit.
- [ ] Keep API and authenticated data caching out of scope unless explicitly requested.
- [ ] Check that deployment/CDN caching rules do not indefinitely serve stale HTML or prevent service-worker updates.
- [ ] Document HTTPS requirements in production (`localhost` is generally treated as a secure context for development).

**Acceptance criteria:** Direct SPA routes work, the service worker controls the expected scope, and no private data is inadvertently cached.

## Phase 7 — Validation and testing

Run the repository's relevant commands, adapting names to its scripts:

- [ ] Install/update lockfile with the repository's package manager.
- [ ] Run lint.
- [ ] Run type checking.
- [ ] Run unit/integration tests.
- [ ] Run the production build.
- [ ] Run the production preview server.
- [ ] Inspect generated `dist/manifest.webmanifest` (or the plugin's actual output path).
- [ ] Confirm the generated service worker exists.
- [ ] Verify all manifest icon URLs resolve.
- [ ] In browser DevTools → Application, inspect the manifest and service-worker lifecycle.
- [ ] Test offline behavior after the app has been loaded online at least once.
- [ ] Test update flow by loading build A, deploying/building build B, and verifying that the update prompt appears.
- [ ] Confirm **Later** leaves the current page running without an intentional reload.
- [ ] Confirm **Update now** activates the new version and reloads.
- [ ] Check console/network logs for missing assets, registration errors, and stale-cache issues.
- [ ] If browser automation exists, add suitable tests for prompt visibility and button actions; do not pretend browser-level service-worker behavior was tested if it was not.

**Acceptance criteria:** All feasible automated checks pass, and manual browser checks are reported clearly as passed, failed, or not performed.

## Phase 8 — Documentation and handoff

- [ ] Document how to build and preview the PWA locally.
- [ ] Document the expected update flow and the hourly check interval.
- [ ] Explain that update discovery/download can happen in the background while the page is open, but applying the update is user-confirmed.
- [ ] Note any hosting-specific SPA fallback, HTTPS, or base-path requirements.
- [ ] List files changed and why.
- [ ] List commands executed and their results.
- [ ] Record unresolved decisions or follow-up work, especially if icons/branding were unavailable.

## Suggested file layout

Adapt to the repository rather than creating duplicates.

```text
vite.config.ts
public/
  favicon.ico
  apple-touch-icon.png
  pwa-192x192.png
  pwa-512x512.png
src/
  components/
    ReloadPrompt.tsx
    ReloadPrompt.css
  App.tsx
```

The PWA plugin may generate the manifest and service worker during the build; do not manually add generated files unless the project has a specific reason to maintain them.

## Key configuration intent

The Vite PWA configuration should use the following behavior (merge it into the existing configuration; do not blindly replace the file):

```ts
VitePWA({
  registerType: 'prompt',
  // Add manifest, icons, and asset configuration appropriate to this app.
})
```

The React update component should use the supported `useRegisterSW` integration and call `updateServiceWorker(true)` only when the user selects **Update now**.

For periodic checks, use the registration returned by the plugin's registration callback and call `registration.update()` at a cleanup-safe interval (for example, every 60 minutes). Keep this distinct from applying the update.

## Definition of done

The work is complete when:

1. The app builds successfully with the PWA plugin configured.
2. The manifest and icons are valid and resolve correctly.
3. The generated service worker precaches the intended app-shell assets.
4. The update prompt is mounted once and is accessible.
5. Users can defer an update or explicitly apply it.
6. Update checks run on startup/registration and periodically while the app is open, with timers cleaned up correctly.
7. Offline behavior and the update lifecycle have been tested to the extent possible and accurately reported.
8. Existing SPA routing, authentication, and app behavior remain intact.
9. The handoff includes changed files, verification results, and any remaining manual steps.
