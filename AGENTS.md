# Repository Guidelines

## Project Structure

- `web/` is the current HTML/CSS/JavaScript game runtime. `web/js/runtime/` contains the ordered feature chunks (config/state, locale, video, audio, dialogue, memory, flow, and boot validation); `web/js/main.js` is the final `bindEvents()`/`load()` entry point.
- `web/css/style.css` is the stable stylesheet entry point; it imports `tokens.css`, `base.css`, `components.css`, and `responsive.css` in that order.
- `script/chapters.json` holds language-neutral rules and stable chapter/line/zone IDs. Player-facing copy lives in `script/locales/`; read `script/locales/README.md` before changing a locale.
- `art/v4/scenes/` contains the 13 full-page scene images, `pageBindings`, generation prompts, and the scene validator. `art/v4/playable/` contains source/feedback assets and its manifest. Keep `art/bg/` because the legacy manifest and generation scripts still use it.
- `storyboard/v4-prop-lock/` is the current visual reference set. Older art and storyboards live under `archive/` and should not be loaded by the runtime.
- `scripts/` prepares the Tauri frontend and validates audio; `src-tauri/` contains the Tauri 2 shell and platform configs.
- `video/prompts/minimax-h3/` contains the 11 MiniMax H3 motion prompts, clean scene-page references, and generation manifest; `video/prompts/kling/` contains 22 Kling single-scene shots; generated source MP4s stay in `video/generated/`, while runtime-approved K01-K22 copies live under `web/video/kling/`.

## Build, Test, and Development

Run the web demo through a static server, not by opening the HTML directly:

```bash
python3 -m http.server 8765 --directory .
```

Run focused checks before submitting changes:

```bash
npm run validate:runtime-js
node --check scripts/prepare-tauri.mjs
node scripts/validate-chapters.mjs
npm run validate:locales
python3 art/v4/scenes/validate.py
python3 art/v4/playable/validate.py
node scripts/validate-audio.mjs
node scripts/validate-video-prompts.mjs
node scripts/validate-kling-prompts.mjs
npm run validate:runtime-videos
npm run tauri:prepare
```

Use `npm ci` for a clean dependency install and `npm run tauri:build` for a native build; the latter requires Rust, Cargo, and platform WebView dependencies. There is no separate unit-test runner; validation scripts and manual desktop/mobile browser checks are the test suite.

## Style and Naming

Follow the existing formatting: two spaces in JavaScript, CSS, JSON, and Markdown examples; four spaces in Python; strict mode and quoted variables in shell scripts. Prefer small, local edits and existing browser APIs over new frameworks. Use existing identifiers such as `L3_S04b`, `L3_S04b_Z01`, `PAGE_L3_door_default`, and `A_separate`; keep manifest IDs and file names synchronized. Do not use display text as an identifier or saved value.

## Assets and Configuration

Page bindings must remain manifest-driven. Do not reintroduce runtime character/NPC overlays into the full-page demo. Image-generation keys are read from environment variables only; never commit secrets, `.env` files, generated logs, or temporary responses. Locale packs must preserve base rule IDs/flags and provide exact zone offsets; run `npm run validate:locales` after any translation edit. English, German, and Russian are Beta until native review.

## Commits and Pull Requests

Use concise Conventional Commit-style subjects such as `feat:`, `fix:`, `docs:`, `ci:`, or `chore:`. Pull requests should explain the user-visible change, list validation commands, link relevant issues, and include screenshots or a short recording for UI, scene, or transition changes. Mention any Pages/Tauri workflow impact and keep unrelated document or archive changes separate.
