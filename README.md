# Questbound

Questbound is a personal leveling companion for World of Warcraft: Forever. Track characters, plan talents, prepare dungeon quests, and find guidance for the zone you are in.

Questbound was created with the help of AI.

New installations use Dark / OLED by default, without changing existing saved theme preferences. The map supports direct clicks on visible neighboring zones, with automated coverage for all documented same-continent walk connections.

## Characters and progress

Start with an empty profile and create your own characters. Each profile keeps its level, completed quests, notes, builds, professions, profession skills, current zone, and assistance preferences. Race choices match the selected class and faction. Roles appear only when a class supports more than one. Choose up to two primary professions and all three secondary professions.

## Overview and zone guidance

Overview shows the character, current and next talent choices, class milestones, and tasks. Select a zone, town, or subzone to see local tips and reward quests on the same page. Crossroads and Ratchet, for example, both select The Barrens.

The Overview checklist sits directly below the character and level selector. Mark tasks Complete or Skip them. Skipped tasks do not count as completed or unlock follow-up quests. The Skipped view lists all skipped tasks for the character across all levels, categories and activity filters, with Undo skip to restore them; skipped status is preserved in JSON backups.

Tasks are sorted by ascending level in every view. Filter by current, upcoming, or all levels; completed tasks remain available when Show completed is enabled. Follow-up quests unlock after their documented prerequisites are checked off. Available quests preview noteworthy rewards later in the chain.

## Talents and builds

Import builds from Wowhead's Forever calculator. A link with a saved point order provides a level-by-level plan; an allocation-only link preserves the final distribution. Switch between named builds, rename them, or delete them.

Compact talent trees use game backgrounds, icons, real row and column positions, rank counters, and prerequisite arrows. Current and next talent points are highlighted. Hover or focus a talent for rank effects, or tap it to open details. Game names and effect text remain in English.

Create talent builds directly in Questbound, with up to 51 points, prerequisite checks, and an automatically recorded leveling order. Desktop controls use hover for descriptions, click to add a point, and right-click to remove one. On touch screens, the first tap selects the talent and shows its description; another tap adds a point, and holding the selected talent removes one. Native builds are directly editable when opened. To adapt an imported build, choose Create build and Copy active build; the imported original is preserved.

In the talent calculator, talents that can receive a point are shown in full color with a green border, including at rank zero. Locked talents remain gray and their tooltips explain the missing requirement. Talents at maximum rank use gold borders.

## World map and journeys

The interactive world atlas uses Forever game artwork for Azeroth, both continents, and 50 zone and city maps. Search zones and known places, drag to pan, pinch or scroll to zoom, and select a zone for Overview tips. The world and continent maps are bundled; individual zone maps require an internet connection on first opening and are then cached for offline use. Subzone names remain those printed on the game maps. Zooming out of a zone restores the zoom and pan position from the previous map view instead of resetting to the entire continent. On desktop, mouse-wheel zoom opens a zone only near its marker or recognized zone area; on mobile, pinching only adjusts zoom and tapping selects a zone. Zone maps allow direct clicks on visible neighboring areas, including traced regions around The Barrens. Continent maps now use seamless land-area hit testing, with manually defined contours for complex borders.

The world map includes a simple journey planner. Enter a start and destination using zone, city, town or known subzone names. Select a faction to get suggested road and public-transport steps, including boats, zeppelins, skyboats and the Deeprun Tram. The planner respects the one-way Menethil–Southshore–Auberdine boat loop, warns about high-level areas and hostile settlements, and lets you open the area for any step on the map. Journey fields are saved separately for each profile. Directions describe zone transitions and known transport stops; use the game map for local turns and preliminary approaches. The map appears first, with the journey planner below it.

Choose between flight-assisted travel and a route without flight paths that retains boats, zeppelins and other public transport. Track 65 flight points per character; the flight network contains 143 documented connections. Potential flight routes list missing unlocks, or restrict flights to points you have marked as learned. Public transport can be disabled entirely. Save favorite destinations and reuse or delete recent journeys.

Search 45 dungeon and raid destinations, including Onyxia’s Lair, as either start or destination. Approximate game-map markers and local approach instructions lead to the entrance area. Shared wing markers do not claim exact interior portal coordinates. Datamined raids with unconfirmed availability remain preliminary; access requirements are separate from directions.

## Quests and dungeons

Browse selected class and reward questlines across 48 mapped zones. Rewards include weapons, armor, bags, utility items, collectibles, unlocks, and quest money. Cozy Sleeping Bag is recommended from level 20; its minimum start level of 14 is listed separately.

The dungeon list contains 36 entries through level 60, including separate Scarlet Monastery, Maraudon, Blackrock Spire, and Dire Maul wings. Recommended ranges and technical entry requirements are shown separately. Some quests and later-level details remain preliminary.

## Professions and materials

Enter a separate base skill level for every selected profession. Cooking and First Aid material plans show estimated amounts for the current stage and future stages, counting only remaining profession leveling. The selected routes use fish recipes and cloth bandages. Extra food, healing supplies, camping crafts and crafted equipment are not included in these quantities. Route tables show gross budgets; the combined inventory section subtracts owned materials.

Current Forever guides document quantities through skill 225. Planning from 225–300 is visibly labeled as a preliminary Classic fallback. Partial-stage amounts are estimates because skill-up chances vary. Training and unlock materials are displayed separately.

Fishing itself consumes no crafting materials for skill points. Its guide distinguishes fishing locations, tools, Cooking fish, and quest-only fish needed to unlock Artisan training.

Crafted equipment suggestions match class, role, active build, and selected professions. The documented selection covers current level-30 class guides for all nine classes; it is not a complete endgame ranking. Unconfirmed recipe requirements are left for the player to check rather than guessed.

Overview includes crafted equipment suggestions alongside quests and milestones, with profession, build, documented equip level, and known recipe-skill requirements taken into account. Mark a suggestion complete after crafting or considering it. Missing requirements are labeled for checking against the recipe.

## Personal planning

Pin quests, dungeons and crafted equipment as goals on Overview. Goals show remaining documented prerequisites and preparation, and can be completed or unpinned independently of quest progress. Filter tasks for solo activities, group activities or both.

Plan a town visit by combining documented class and profession trainer locations with quest hand-ins you confirm from your quest log. Quest availability never implies that its objectives are finished. Mark readiness yourself before marking a quest handed in. Class training lists first training levels; higher ranks and costs are not tracked. Trainer locations do not guarantee that every rank or recipe is offered.

Enter owned profession materials to see a combined remaining leveling budget. Current stages use the shared inventory before future stages, and quantities never fall below zero. All new planning data stays with the character and is included in JSON backups.

## Reference and settings

Search quests, zones, abilities, talents, and controller functions. The controller reference includes Xbox, PlayStation, and generic button names and is based on a pinned revision of the Forever client UI source. Follow the game's prompts when controls differ.

English is the default language; Swedish is available in Settings. Choose from five themes, including a black OLED theme, and adjust assistance and beginner explanations separately. Beginner Mode is off by default for new characters but can be enabled per character; existing characters keep their saved setting. Settings lives in the side menu. The compact interface is shared by all players; there is no separate Play Mode.

Source links are optional and off by default. They can be enabled in Settings; the full provenance remains available from Sources & content status.

Camping cards describe profession effects, skill requirements and documented acquisition methods, with unlock reminders in tasks. Westfall Stew is included as a quest chain and optional Cooking tip; Sweetpaw Jam remains preliminary because recipe acquisition is unverified. These optional food crafts do not inflate the profession-leveling material budget.

## Saving and offline use

Profiles are saved in the browser. Export and import JSON backups to move them between devices or browsers. Profile data is not sent to a backend. After loading online, the guide, bundled icons, talent backgrounds, and effect descriptions are available offline. External references require an internet connection.

Questbound contains a documented selection, not a complete quest database or leveling route. Detailed provenance and coverage limits are recorded in [SOURCES.md](SOURCES.md).

Questbound is an unofficial companion. World of Warcraft, game names, artwork, and in-game descriptions belong to Blizzard Entertainment.
