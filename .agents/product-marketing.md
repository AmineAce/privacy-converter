# Product Marketing Context

**Document version:** v1
**Last updated:** 2026-07-28

## Product Overview
**One-liner:** Free, private image converter that runs 100% in your browser — no uploads, no tracking.
**What it does:** Converts images between JPG, PNG, WebP, SVG, HEIC, and PDF formats entirely on the user's device. All processing happens via Web Workers, Canvas API, and client-side libraries — no server interaction. Also merges multiple images into a single PDF.
**Product category:** Image conversion tool / browser-based utility
**Product type:** Free web application (SPA), no account required
**Business model:** Free & open source (MIT). Zero cost to users. No ads, no premium tiers.

## Target Audience
**Target companies:** N/A — consumer-facing tool, no B2B segment
**Decision-makers:** End users directly (no purchasing process)
**Primary use case:** Convert image files between formats quickly without compromising privacy
**Jobs to be done:**
- Convert a HEIC photo from iPhone to JPG so it can be shared or uploaded anywhere
- Convert SVG to PNG for use in documents or social media
- Batch-convert multiple images between formats without uploading to a server
- Merge several images into a single PDF document
**Use cases:**
- iPhone users receiving HEIC photos that need JPG conversion
- Designers converting SVG to PNG or WebP for web use
- Privacy-conscious users avoiding cloud converters
- Users needing quick batch conversions without signup or ads

## Personas
| Persona | Cares about | Challenge | Value we promise |
|---------|-------------|-----------|------------------|
| Privacy advocate | Data sovereignty, no tracking | Cloud converters store files on unknown servers | Zero uploads, everything stays local |
| iPhone user | Quick HEIC→JPG conversion | HEIC not supported everywhere | Drop HEIC, get JPG instantly |
| Web designer | SVG/WebP support, batch processing | Slow upload-then-download cycle | Parallel batch conversion in browser |
| Casual user | Free, no signup | Freemium converters limit usage | 100% free, no account needed |

## Problems & Pain Points
**Core problem:** Online image converters require uploading files to remote servers, creating privacy risk, upload wait times, and arbitrary file size limits.
**Why alternatives fall short:**
- Cloud converters (ILovePDF, CloudConvert) store files on their servers — privacy risk, data retention concerns
- Desktop apps require installation and don't work cross-platform
- Freemium tools limit batch size or file size behind paywalls
- Most tools inject ads, trackers, or affiliate redirects
**What it costs them:** Privacy exposure, lost time uploading/downloading, frustration with limits
**Emotional tension:** "I shouldn't have to upload my personal photos to some unknown server just to change a format."

## Competitive Landscape
**Direct:** Other browser-based converters (Squoosh, ILoveIMG, Convertio) — fall short because they require server uploads, have file limits, or show aggressive ads
**Secondary:** Desktop apps (GIMP, Preview, IrfanView) — powerful but require installation and have learning curves
**Indirect:** OS-native tools (macOS Preview, Windows Photos) — limited format support, no batch conversion

## Differentiation
**Key differentiators:**
- Zero server uploads — 100% client-side processing guarantees privacy
- No account, no signup, no data collection
- Full HEIC support (Apple's format) without macOS
- Batch processing with parallel Web Worker pool (up to 5 concurrent)
- 50MB file size limit covers virtually all real-world images
- Open source (MIT) — verifiable privacy
**How we do it differently:** Web Workers + Canvas API + client-side WASM libraries (heic-to, jspdf) process everything on-device
**Why that's better:** Files never leave your computer. No upload wait time. No server costs. No limits on batches.
**Why customers choose us:** Privacy guarantee + free + no signup + broad format support in one package.

## Objections
| Objection | Response |
|-----------|----------|
| "How do I know it's really private?" | It's open source — inspect the code. No network requests fire during conversion (check DevTools Network tab). |
| "50MB isn't enough for my video" | This is an image converter. For images, 50MB covers 99% of use cases — a 100MP RAW photo is ~30MB. |
| "Why not just use Preview on Mac?" | Preview doesn't convert HEIC, doesn't do batch, and doesn't merge to PDF. |
| "SVG to PNG looks blurry" | We render at the SVG's intrinsic resolution. For higher DPI, resize the SVG viewBox before dropping. |

**Anti-persona:** Video editors, users wanting cloud storage/backup alongside conversion, enterprise bulk processing with compliance requirements.

## Switching Dynamics
**Push:** Privacy anxiety about uploading personal photos; frustration with file size limits on free tiers; repetitive manual conversion workflows
**Pull:** Zero-install, zero-upload, zero-cost; works on any device with a browser; open-source trust
**Habit:** Users default to desktop apps or cloud converters they've used for years
**Anxiety:** "Will it preserve quality? Will it work for my specific format? Is it really private?"

## Customer Language
**How they describe the problem:**
- "I don't want to upload my photos to some random website"
- "HEIC files won't open on my PC"
- "I need to convert 50 images but all these sites have limits"
**How they describe us:**
- "It just works in my browser"
- "No uploads, no BS"
- "Actually private"
**Words to use:** Privacy, local, your device, no upload, no signup, free, open source, instant, browser-only
**Words to avoid:** Cloud, server, AI-powered, premium, pro, enterprise, account

## Brand Voice
**Tone:** Direct, confident, reassuring — says what it does without hype
**Style:** Conversational but precise. Short sentences. Avoids marketing fluff.
**Personality:** The trustworthy engineer — competent, straightforward, no hidden agenda.

## Proof Points
**Metrics:**
- 100% local processing — zero server uploads
- Up to 5 concurrent file conversions
- 50MB per-file limit
- Perfect Lighthouse score
**Value themes:**
| Theme | Proof |
|-------|-------|
| Privacy | No network requests — check DevTools. Open source code. |
| Speed | Web Workers + parallel pool process batches without UI freeze. |
| Free | No account, no premium, no ads. MIT license. |

## Goals
**Business goal:** Drive adoption of privacy-first web tools; build trust through transparency
**Conversion action:** Drag and drop a file to start converting (no signup friction)
**Current metrics:** GitHub stars, page views, conversion completions

## Changelog
- v1 (2026-07-28) — Initial context drafted from codebase analysis.
