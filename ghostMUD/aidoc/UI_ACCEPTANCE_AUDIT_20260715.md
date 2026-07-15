# UI Acceptance Audit - 2026-07-15

## Scope and canonical root

All work, build commands, and local servers for this audit used exactly one root:

`D:\git\GameGardwuxia\ghostMUD`

Do not use `D:\MUD\ghostMUD` for implementation, build, or runtime verification. It is an obsolete working copy and is the source of the previous UI mismatch.

## Completed implementation phases

1. **World context and save migration**
   - Added `src/world_context.js` and save schema v4 state for world-event and dialogue progress.
   - Faction headquarters rooms use authored content only: no ambient strangers, global rumors, or random combat injection.
   - Search remains available only for authored room search events; the expanded sword-stair itinerary includes the one-time `白芷花环` companion event.
2. **问剑峰 spatial expansion**
   - Replaced the single `问剑峰·剑阶` with lower, middle, and upper stair rooms.
   - Added the living-area and back-mountain transition rooms, while preserving old saves through room-ID migration.
   - Added route metadata to the bamboo maze fallback so it does not revert to cardinal-direction blocks.
3. **NPC and dialogue interaction**
   - NPC chips are the only card toggle: tap once opens the focused detail card, tap the same chip again closes it. No `收起` button is rendered in the card.
   - The focused card has the fixed action contract: `交谈 / 观察 / 送礼 / 切磋`.
   - `察看` and `探索` remain separate global actions.
   - Tutorial NPC dialogue supports graph nodes, player replies, affinity/flag effects, and up to three visible reply choices.
   - Only an NPC with `canSpar: true` may start a spar in 问剑峰. The authored 值星弟子 is eligible; ordinary residents remain disabled.

## Final verification performed

### Static gate

- `npm run build`: passed.
- `node --check` passed for all modified core, UI, and 问剑峰 data files.

### Browser acceptance pass

Verified against the canonical Vite instance at `http://127.0.0.1:4174/`:

- Desktop default viewport.
- Mobile viewport: `390 x 844`.
- Selected a visible NPC chip, confirmed one focused card with exactly four actions, then selected the same chip and confirmed the card disappeared.
- Opened `察看`, confirmed the `隐处可探` information appeared independently from `探索`.
- Confirmed the mobile route sketch remains spatial (nodes and connector lines), rather than regressing to direction-button grids.
- Confirmed no console errors during these interactions.

## Worker remediation queue

### P1: `探索` must always acknowledge the click

**Observed:** In `问剑峰·竹林`, clicking `探索` produced no visible immediate result when the room had no eligible authored search event. The control did not throw an error, but a silent no-op reads as a broken button.

**Required change:**

1. Make `SearchService` return a structured no-result outcome, for example `{ status: 'empty', message: '你在此地细细搜寻，暂未发现异样。' }`, rather than `false`, `null`, or `undefined`.
2. Make the `探索` action consume every outcome. For `empty`, append exactly one concise recent-log line and invoke the existing borderless moment-feedback channel.
3. Preserve the faction-HQ constraint: an empty authored search in 问剑峰 must **not** fall through to an ambient encounter, a global rumor, or a random NPC spawn.
4. Keep one-time item events idempotent. The `白芷花环` may be received once only, and the no-result fallback must not reset its completion flag.

**Acceptance:** In a faction-HQ room with no authored search event, one tap on `探索` shows one transient unframed message and one log line; no NPC, battle, or unrelated rumor appears.

### P1: desktop Jianghu layout must not reserve an empty right third

**Observed:** At the desktop viewport, `jianghu.css` applies the two-column desktop rule unconditionally: the Jianghu play area occupies the left two thirds while the right third remains empty if no secondary panel is open. This is why the scene panel and expanded NPC card look mobile-narrow on a wide window.

**Required change:**

1. Add an explicit layout state such as `data-secondary-panel-open="true"` only when a real companion panel is rendered.
2. Apply the existing `left: 0; right: 33.334%` desktop split only in that state.
3. In the normal Jianghu-only state, let `.jianghu-main-zone`, `.recent-log`, and the location banner use the single-page desktop width with symmetric gutters. Do not change their mobile dimensions.
4. Preserve the current fixed three-zone vertical composition and the mobile inner scroll behavior; this is a width policy repair, not a redesign.

**Acceptance:** At `1280px` and `1440px` wide with only Jianghu visible, the SceneNarrativePanel and expanded NPC card use the available play area instead of leaving an empty third of the viewport. When a genuine secondary panel opens, the intentional two-column layout still works.

### P2: remove the marked transition background before UI sign-off

**Observed:** The mobile screenshot still shows the red circled `1` at the top-left mountain. It comes from `public/ui/jianghu-mobile-bg.jpg`, not from an interactive component.

**Dependency:** This needs the clean, unmarked artwork promised for the three-zone background. Do not paint over the red mark in CSS or crop it differently per viewport.

**Required asset handoff:**

1. Provide clean top/middle/bottom image assets split at the specified horizontal seams.
2. Assign them respectively to `location-banner`, `jianghu-main-zone`, and `recent-log`.
3. Remove the full-image `#scene-bg` dependency only after all three assets exist.

**Acceptance:** No red mark is visible at 390px or desktop widths; the art joins at zone boundaries without a double seam, drift, or transparent overlap.

### P2: preserve the approved Figma component contracts

Do not change these while fixing the two P1 issues:

- `NpcNameChip`: compact hand-inked chip with the rough border treatment. No description text inside the chip.
- `NpcDetailCard`: retains its clean Figma card border; only the selected chip opens or closes it.
- `LocationBanner`: Figma room-anchor treatment remains intact.
- `SceneNarrativePanel` and `RouteSketch`: route nodes show real spatial relationship, including hidden/revealed routes; do not restore `上/下/回` fallback buttons.
- Moment feedback: unframed bold text rises downward for acquisition, discovery, and relationship changes. Do not convert it into a toast card.
- NPC actions: exactly `交谈 / 观察 / 送礼 / 切磋`. `打听` belongs inside applicable NPC interaction content, never as a fifth generic button.

## Regression checklist for the worker

1. Start only from `D:\git\GameGardwuxia\ghostMUD`.
2. Build once with `npm run build` after all changes; do not run a separate dev server from the obsolete root.
3. At desktop width, open and close the same NPC chip twice; verify no close button appears and no description exists before selection.
4. At 390px width, ensure the route sketch has visible lines/nodes and NPC-chip labels do not overlap.
5. Exercise `察看` and `探索` separately; the latter must visibly acknowledge empty results without violating the faction-HQ policy.
6. Confirm the four NPC action labels and disabled/enabled spar state remain correct.
