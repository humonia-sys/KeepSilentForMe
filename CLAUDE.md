# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

《请替我沉默 / Keep Silent For Me》is a 30-minute narrative puzzle game where players control a parasitic entity ("消音体") that feeds on unsaid words. The game uses a unique mechanic: drag a black bar to mask parts of dialogue, with masked text becoming the creature's body while remaining text is spoken aloud.

**Current Status**: Playable full-page scene Demo with CC0 BGM and persistent audio controls verified in Pages and Tauri CI; video, SFX and narrative polish pending
**Tech Stack**: Web (HTML5 + CSS + JavaScript, no frameworks) inside a Tauri 2 desktop shell
**Target**: Web vertical slice plus Windows NSIS and Linux desktop artifacts

## Architecture

### Document Hierarchy (Single Source of Truth)

1. **台本.md** - Authoritative source for all 35 dialogue sentences, 6 chapters, video storyboards
2. **script/chapters.json** - Machine-readable runtime data (generated from 台本.md)
3. **art/v4/scenes/manifest.json** - Full-page cover, chapter line bindings and ending page bindings
4. **web/audio/manifest.json** - Local CC0 BGM tracks and chapter/ending audio bindings
5. **schedule.md** - Complete game design + Web implementation guide (§11 Program Assembly Manual)

**Critical Rule**: When dialogue content conflicts between files, 台本.md 以丰富的为准 (use the richer source as standard).

### Core Game Loop

```
Complete sentence appears on screen
→ Player drags black bar to cover continuous text zone
→ Covered text is "eaten" by creature (grows visually)
→ Remaining text is spoken aloud
→ NPC/audience reacts
→ Next sentence or chapter settlement
→ L1-L4: arrange the chapter's eaten fragments into a private whisper
→ Next chapter first line may echo that whisper (narrative/visual only)
```

**Constraint**: Player can ONLY mask 3-4 pre-defined continuous zones per sentence, no free-form text editing. The current Demo renders the raw sentence once and places transparent hit rectangles from `Range.getClientRects()` over it.

**Echo Digest**: The end-of-chapter memory layer appears only after L1-L4. It keeps one
`eatLog` entry per selected zone as stable IDs `{ chapterId, lineId, zoneId, source }`
(`source` is `player` or `parasite`; the L4_S02 backfire line is eaten by the system) with
no display text; whisper text is resolved per current locale from the zone's `eat` field
via `textForZoneId()`. `memoryByChapter` stores the confirmed whisper order as zone-ID
arrays; `memoryDraft` makes an in-progress arrangement reload-safe; `normalizeSelections()`
revalidates and de-duplicates zone IDs on restore. This layer never changes flags, page
bindings, or ending logic.

### Data Structure (script/chapters.json)

```javascript
{
  "chapters": [
    {
      "id": "L0",           // Chapter ID
      "title": "开场",      
      "scene": "apartment_rain",
      "lines": [
        {
          "id": "L0_S01",
          "raw": "完整句子",           // Full sentence shown to player
          "face": "依赖",              // Character expression
          "zones": [                   // 3-4 maskable zones
            {
              "text": "可遮挡的文字",  // MUST be continuous substring of raw
              "remain": "遮后剩余句",   // Hand-written sentence after masking
              "npc": "NPC反馈",
              "flags": ["pass+"],      // Flag modifications
              "eat": "进入消音体的低语"
            }
          ]
        }
      ]
    }
  ]
}
```

**Critical**: `zone.text` must be an exact continuous substring of `line.raw`. The runtime supports an optional explicit `start` or `occurrence` when repeated text needs a deterministic match; do not add manual screen coordinates.

### Web Implementation Strategy

**Key Technical Solution**: Render the dialogue once and use DOM `Range.getClientRects()` hit
overlays for each zone. This preserves precise screen positions even when zones overlap or
wrap across lines; no manual character bounding box calculation is needed.

```html
<!-- The raw line is rendered once; hit rectangles live in a separate layer. -->
<div id="dialogue-text">我其实没什么经验，而且我经常会说错话，但我真的很需要这份工作。</div>
<div id="dialogue-zones" aria-hidden="true"></div>
```

```javascript
const range = document.createRange();
range.setStart(textNode, zone.start);
range.setEnd(textNode, zone.end);
const rects = [...range.getClientRects()]; // handles wrapping and overlap
```

The runtime does not composite the narrative character, NPC, creature, or ending layers. Those identities are baked into the 13 full-page scene images; transparent V4 assets remain source material and provide UI/feedback layers.

**Project Structure**:
```
web/
├── README.md
├── index.html
├── css/style.css
└── js/main.js              # State machine, drag loop, page bindings and HTML FX

art/v4/scenes/
├── manifest.json            # cover, 13 pages, line bindings and four ending pages
├── pages/                   # 1536x1024 full-page PNGs
├── prompts/                 # Generation prompts
├── generate_pages.sh        # /images/edits generation entry point
└── validate.py

src-tauri/
├── tauri.conf.json          # shared Tauri 2 shell configuration
├── tauri.windows.conf.json  # NSIS target used by CI
└── tauri.linux.conf.json    # AppImage/deb targets used by CI
```

## Development Workflow

### Current verification status

```bash
# Local web runtime
python3 -m http.server 8765 --directory .
# Open http://127.0.0.1:8765/web/

# Static and JavaScript validation
npm run validate:runtime-js
node scripts/validate-chapters.mjs
npm run validate:locales
python3 art/v4/scenes/validate.py
python3 art/v4/playable/validate.py
node scripts/validate-audio.mjs
node scripts/validate-runtime-videos.mjs
npm run tauri:prepare

# Desktop preparation (full Rust build requires the Tauri toolchain)
npm ci
npm run tauri:prepare
npm run tauri:icons
npm run tauri:build
```

The latest Pages and Tauri CI runs are recorded in the root README. The local
environment must provide Rust, Cargo and platform WebView dependencies before
`npm run tauri:build` can produce a native binary.

### Day 1+: Start Development

```bash
# The current page-turn Demo is already in web/; use the original Day 1 template
# only as a reference for the underlying DOM interaction.

# Local development server
python3 -m http.server 8765 --directory .
# Visit http://127.0.0.1:8765/web/
```

### Asset Generation

```bash
# Base prompts for the archived batch live under archive/art-v1/prompts/; the current playable pack uses
# art/v4/playable/prompts/ and generate.sh. Use the edit endpoint with the
# canonical reference image for identity-sensitive layers.
# Model: gpt-image-2
# Validate with: python3 art/v4/playable/validate.py
```

## Critical Constraints

### Doomer Art Style (NON-NEGOTIABLE)

From art-style.md:
- **Color**: Deep black, blue-black, dirty grey-green, minimal red (≤2%)
- **Lighting**: Single desk lamp + rain window, 35mm grain
- **NO**: Bright colors, cute idol style, cyberpunk neon, glossy 3D

**Creature Design**: 消音体 is abstract text/ink entity. **ABSOLUTELY NO facial features, eyes, or ghost face**. Think: living calligraphy, sentient ink stain.

### Game Design Rules

1. **Only one action**: Drag black bar to mask text (no typing, no menus, no other skills)
2. **Continuous masking**: Can only mask one continuous text segment, not multiple scattered words
3. **3-4 zones per sentence**: Pre-defined zones, no free-form NLP
4. **Failure is narrative**: Failed attempts restart chapter with story context, not Game Over screen
5. **No numeric UI**: No HP bars, no affection meters, no follower counts

### Flag System

Flags are counters tracked in `gameState.flags`:
- `pass`/`fail`/`risk` - L1 settlement (need `pass >= 3 && fail < 2 && risk < 3`; otherwise the chapter retry overlay appears)
- `hate_leak` - L2 settlement (`hate_leak < 2` passes; otherwise the live-accident retry overlay appears)
- `apology_perform`/`apology_refuse` - L4 route: the higher count selects the perform/refuse chapter outro (tie → perform)
- `trust`/`distance`/`secret_risk`/`crack` - L3 chapter-end overlay variants (priority risk > distrust > distance > crack)
- `revolt` - L4 overlay variant: `revolt >= 1` rewrites the settlement copy ("not by you" beat)
- `mask`/`truth`/`bond`/`control` - ending overlay persona line (highest with `>= 6`, ties in this order)

The four ending IDs are selected by the zones on `L5_S06`, with the `ending_seed`
captured on `L5_S03` nudging A/B (seed `A` + `B_alienate` → `A_separate`; seed `B`
+ `A_separate` → `B_alienate`; C endings are unaffected). `C_consume` and `C_cold`
have separate logical IDs but share `PAGE_END_C_hollow` and the `V5_C` video sequence.
The ending overlay appends one persona line per the flag table above.
Known rule and narrative mismatches are tracked in `issue.md`.

## Key Documents Quick Reference

| Document | Purpose |
|----------|---------|
| **WEB_TECH_STACK.md** | Complete Web implementation guide + Day 1 demo code |
| **art-style.md** | Canonical doomer art direction and visual constraints |
| **art/v4/playable/README.md** | Current playable asset generation and runtime binding guide |
| **schedule.md §11** | Program assembly manual (state machine, JSON contract) |
| **schedule.md §12** | Art asset specs and file naming |
| **web/audio/SOURCES.md** | Packaged CC0 BGM sources, licenses, conversions and hashes |
| **schedule.md §13** | Planned audio resources and media layer |

## Deployment

```bash
# Vercel (recommended)
npm install -g vercel
vercel

# Netlify (drag-drop)
# Visit app.netlify.com/drop

# GitHub Pages
# Settings → Pages → Source: GitHub Actions

# Tauri desktop packages
npm ci
npm run tauri:build
# GitHub Actions: .github/workflows/build-tauri.yml
# main 推送后生成 Windows NSIS 与 Linux AppImage/deb artifacts
# MSI 需要额外的 WiX 工具链，可在 Windows 环境单独运行：
# npm run tauri -- build --bundles msi
```

CI currently publishes workflow artifacts only; signing, releases, updater JSON
and automatic updates are disabled.

## Common Pitfalls

1. **Don't auto-generate `remain` text**: Each zone's `remain` field is hand-written for narrative quality. Never use string manipulation to generate it.

2. **Don't create zone coordinates manually**: Web solution uses DOM span wrapping, not manual x/y/w/h coordinates.

3. **Don't give creature a face**: 消音体 stages must remain abstract text/ink masses. Any facial features violate core art direction.

4. **Don't add numeric UI**: No health bars, no meters. Flags are invisible counters for branching logic only.

5. **Validate zone.text is substring of raw**: At game startup, verify every `zone.text` exists in its `line.raw` via `indexOf()`. Fail loudly if not found.

## NetEase Leihuo Game Jam Context

This project is for 网易雷火游戏比赛 (NetEase Leihuo Game Jam). Target is a complete vertical slice in 7 days with potential for 2-3 week polish cycle. Focus on completing core loop (L0+L1) before expanding to all chapters.
