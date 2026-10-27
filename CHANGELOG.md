# Questbound – Changelog

This changelog tracks changes published to the GitHub repository. It is not displayed on the website.

## 0.7.8 – 2026-10-27
- **Zone-map navigation:** Fixed direct clicks from Mulgore into The Barrens. Neighboring zones now use a less restrictive, bearing-based edge hit area where a precise map polygon is unavailable. Existing traced regions continue to take priority. (`world-map.js`)
- **Navigation coverage:** Verified that all 94 documented, same-continent walk connections between the 48 zone maps can be selected in both directions where recorded. Added systematic regression checks and specific cases for Mulgore, The Barrens, Ashenvale, and Dustwallow Marsh. (`tests/release05.test.cjs`)
- **Appearance:** Dark / OLED is now the default theme for new users and profiles without a saved theme. Existing saved theme preferences are preserved; the initial document also uses Dark / OLED to prevent a forest-theme flash during startup. (`app.js`, `core.js`, `index.html`)
- **Sidebar:** Increased spacing between wrapped character names and level/class details, and below the character card. (`v07.css`)
- Updated version labels, offline cache, and documentation. (`app.js`, `index.html`, `sw.js`, `README.md`)

## 0.7.7 – 2026-10-27
- **Character selector:** Show the full character name in the sidebar instead of truncating it with an ellipsis. Names such as **Shamanta Fox** wrap naturally onto multiple lines, and longer names expand the card vertically without overlapping the class icon or dropdown arrow. (`v07.css`)
- **Accessibility:** Added a full-name hover tooltip to the character switcher. (`app.js`)
- **Regression coverage:** Added checks for multi-line sidebar names and the full-name tooltip. (`tests/release07.test.cjs`)
- Updated the version and offline cache so the styling refreshes on GitHub Pages. (`app.js`, `index.html`, `sw.js`)

## 0.7.6 – 2026-10-27
- **Continent maps:** Replaced small marker-radius limits with contiguous land-area hit testing on Kalimdor and Eastern Kingdoms. Land clicks no longer fail solely because the pointer is too far from a zone marker. Approximate coastal masks keep clicks far out at sea inactive. (`world-map.js`)
- **Zone boundaries:** Added hand-shaped region contours for western Winterspring, The Barrens, Mulgore, and Stonetalon Mountains on Kalimdor, as well as the visible neighboring areas on The Barrens zone map. These are approximate hit areas, not pixel-perfect game boundaries. (`world-map.js`)
- **In-map navigation:** Clicking a visible neighboring area on The Barrens map opens that zone directly; other zone maps also support directional navigation near their edges when a land connection is known. Pinching on mobile continues to zoom without opening a zone. (`world-map.js`)
- **Interface:** Removed the **Adjacent zones** button panel below zone maps as requested. (`world-map.js`, `v07.css`)
- **Regression tests:** Added coverage for western Winterspring, neighboring-area clicks, ocean clicks, and the removed panel. (`tests/release05.test.cjs`)
- Bumped version and offline cache. (`app.js`, `index.html`, `sw.js`)

## 0.7.5 – 2026-10-27
- **World Map:** Improved zone selection around The Barrens and Mulgore. Desktop zoom now uses smaller, region-aware hit areas instead of picking whichever zone center happens to be closest; users can also click or tap a zone directly. (`world-map.js`)
- **Mobile:** Pinching changes map magnification without automatically opening a zone. Tapping a zone marker or supported zone area opens the map; panning and pinching do not count as taps. (`world-map.js`)
- **Nearby zones:** Added touch-friendly buttons for directly connected neighboring zones, using same-continent land connections. Switching to a neighboring zone preserves the previous continent camera position. (`world-map.js`, `v07.css`)
- Ensured adjacent-zone and breadcrumb buttons still work after a pinch gesture, and refreshed the offline cache. (`world-map.js`, `sw.js`)
- Updated the version number and offline cache. (`app.js`, `index.html`, `sw.js`)

## 0.7.4 – 2026-10-27
- **World Map:** Zooming out of a zone now restores the previous continent view, including its zoom level and pan position, rather than resetting to the full continent. Works with the mouse wheel, pinch gestures, the zoom-out button, and the minus key. (`world-map.js`)
- **Mouse wheel:** A single continuous scroll can no longer jump through multiple map levels. (`world-map.js`)
- Updated the version number and offline cache. (`app.js`, `index.html`, `sw.js`)

## 0.7.3 – 2026-10-27
- **World Map:** Added the ability to leave a zone map by zooming out with the mouse wheel, pinch gestures, or minus key. At 100% zoom, further zooming out opens the parent continent map; users can then continue to the world map. (`world-map.js`)
- Updated the version number and offline cache to deliver the map fix without serving stale code. (`app.js`, `index.html`, `sw.js`)

## 0.7.2 – 2026-10-27
- **Overview:** Moved the Activities filter to the right, next to "Show completed", instead of leaving it in the middle of the screen. The "Current", "Upcoming", "All", and "Skipped" tabs remain on the left, with responsive behavior preserved. (`v07.css`)
- **Settings:** Beginner Mode is now disabled by default for newly created characters. Existing characters retain their saved preferences, and Beginner Mode can still be enabled manually. (`core.js`, `tests/core.test.cjs`)
- Updated the version number and offline cache so the web app loads the changes. (`app.js`, `index.html`, `sw.js`)

## 0.7.1 – 2026-10-27
- Moved the "To do now" checklist directly below the character's level selector on Overview.
- Added **Skip**, **Undo skip**, and the **Skipped** view. Skipped tasks do not count as completed, do not unlock follow-up quests, and are preserved in backups.
- Primarily updated `app.js`, `core.js`, `v07.css`, and related tests.

## 0.7.0 – 2026-10-27
- Added personal goals, material inventory tracking, and town visit planning for training and quest turn-ins.
- Expanded the journey planner with more destinations, instance entrances, flight paths, and routes with or without unlocked flight points.
- Improved offline handling and prevented duplicate event handlers after navigating between pages.

## 0.6.0 – 2026-10-27
- Improved talent calculator indicators for available talents and unmet requirements.
- Added a world map journey planner with travel guidance between locations.

## 0.5.0 – 2026-10-27
- Added an interactive world map with zone maps, navigation, and search.
- Added the ability to create and edit talent builds directly in Questbound.
- Added profession-related crafting tasks to Overview.

## 0.4.0 – 2026-10-27
- Improved talent details, rank information, and descriptions.
- Added quest chains, dungeon support, and expanded profession planning.
- Improved offline asset updates between releases.

## 0.3.0 – 2026-10-26
- Added blank character profiles that players can fill in themselves.
- Improved talent visualization and leveling guidance.

## 0.2.0 – 2026-10-26
- Added language selection, themes, expanded zone assistance, and a game controller reference.

## 0.1.0 – 2026-10-26
- Published the initial leveling guide draft, originally developed under the working name **Färdväg**.
- Established the foundation for character profiles, quests, and a GitHub Pages web app.
