# Questbound – Changelog

This changelog tracks changes published to the GitHub repository. It is not displayed on the website.

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
