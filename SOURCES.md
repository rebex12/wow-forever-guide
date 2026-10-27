# Källor och innehållsstatus

Kontrollerat den 26 oktober 2026. Källuppgifter är inte samma sak som självtestade spelregler. Referenser gäller Forever-versionen. Ingen omfattande kopiering av guide- eller tooltiptexter ingår; förklaringar är egna sammanfattningar och numeriska katalogfält är faktauppgifter.

## Talents och abilities

- https://www.wowhead.com/forever/talent-calc — aktuell `v2`-datamodell för nio klasser.
- https://nether.wowhead.com/forever/data/talents-classic?dv=29&db=1792500090 — faktauppgifter för ranktak, namn, förkrav och första träningsnivåer. 465 talents och 436 unika abilitynamn ingår i utkastets katalog.
- https://wow.zamimg.com/js/WH/Wow/TalentCalcClassic.js?198ff44c — använd för att förstå formatet på delningslänkarna. Importen är en egen implementation; Wowheads programkod levereras inte med appen.
- https://www.wowhead.com/forever/guide/wavebreaker-shaman-hybrid-guide-for-wow-forever-35074 — utgångspunkt för Shaman-slutbuilden. Guideprosan och kalkylatorn skiljer sig om vissa talangnamn; katalogens aktuella namn används. Ordningen har anpassats för tidig Improved Ghost Wolf och level 40 på Stormstrike.

## Klassquests

- Shaman: https://www.wowhead.com/forever/guide/classes/shaman/enhancement/level-20-dps-overview
- Druid: https://www.wowhead.com/forever/guide/classes/druid/balance/level-30-dps-overview
- Hunter: https://www.wowhead.com/forever/guide/classes/hunter/survival/level-30-dps-overview
- Warrior: https://www.wowhead.com/forever/guide/classes/warrior/fury/level-30-dps-overview samt Protection-guiden på level 20.
- Paladin: https://www.wowhead.com/forever/guide/classes/paladin/protection/level-20-tank-overview och Retribution-guiden på level 30.
- Priest: https://www.wowhead.com/forever/guide/classes/priest/holy/level-30-healer-overview
- Rogue: https://www.wowhead.com/forever/guide/classes/rogue/combat/level-20-dps-overview samt klassens questindex.
- Mage: https://www.wowhead.com/forever/guide/classes/mage/arcane/level-30-dps-overview samt klassens questindex.
- Warlock: https://www.wowhead.com/forever/guide/classes/warlock/affliction/level-30-dps-overview samt klassens questindex.
- Klassindex: https://www.wowhead.com/forever/quests/classes/

Klassquestkedjor är sammanfattade på milstolpsnivå och avser ett urval. För exakt ras- eller factionsvariant används länken i respektive kort. Call of Air, delar av Rogues och Mages tidiga quests samt Undead Priests kommande Dark Sacrifice är preliminära.

## Dungeons och zoner

- https://www.wowhead.com/forever/guide/dungeons-overview-locations-details
- https://www.wowhead.com/forever/zones
- https://www.wowhead.com/forever/guide/ragefire-chasm-dungeon-overview-location-rewards
- https://www.wowhead.com/forever/guide/wailing-caverns-dungeon-overview-location-rewards
- https://www.wowhead.com/forever/guide/the-deadmines-dungeon-overview-location-rewards
- https://www.wowhead.com/forever/guide/shadowfang-keep-dungeon-overview-location-rewards
- https://www.wowhead.com/forever/guide/hall-of-thanes-dungeon-overview-location-rewards
- https://www.wowhead.com/forever/quests
- https://www.wowhead.com/forever/guide/content-release-roadmap

Inträde enligt zondatabasen kan skilja sig från äldre Classic-regler och från en guides rekommenderade intervall. Exempel: databasen anger RFC 10, WC 10 och SFK 11. Ett tomt/nollställt krav visas som okänt. Hall of Thanes har motstridiga questnivåer i guide och databas och markeras därför särskilt. Ruins of Lordaeron och vissa nya dungeons har varierande rekommenderade intervall mellan källor. Flera questlistor är uttryckligen partiella.

## Camping

- https://www.wowhead.com/forever/guide/camping-overview-unlock-rewards

## GitHub Pages

- https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
- https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site

## Handkontroll, version 0.2.0

Blizzards klient-UI-kod, speglad i `Gethe/wow-ui-source`, grenen `forever`, kontrollerad 26 oktober 2026. Alla källänkar i appens handkontrollsguide är låsta till revision `ca8368f2f2380cbe696854f7f2646387c278a61b`:

- https://github.com/Gethe/wow-ui-source/tree/ca8368f2f2380cbe696854f7f2646387c278a61b/Interface/AddOns
- `Blizzard_Gamepad/UI/Radials/GamepadRadial.lua`: radialval, menysidor och paneler.
- `Blizzard_GamepadActionBars/MainActionBarFrame.lua`: grundläggande frontknappar.
- `Blizzard_GamepadSmartNavigation/SmartNavigation.lua`: panelnavigation.
- `Blizzard_GamepadActionBars/TargetActionBars/ShortcutsActionBar.lua`: genvägar med båda axelknapparna.
- `FriendlyTargetingActionBar.lua` och `HostileTargetingActionBar.lua` i samma mapp: målval och kontextaktioner.
- `Blizzard_GamepadActionBars/ActionBindingUtil.lua`: actionbar-modifierare.
- `Blizzard_GamepadActionBars/Camelot/ClassSpellFlyout.lua`: klassflyouts.
- `Blizzard_SettingsDefinitions_Shared/Gamepad.lua`: inställningar.
- `Blizzard_SharedXML/Shared/GamepadConstants.lua`: fysisk placering av frontknappar.

Instruktionerna är egna sammanfattningar av funktioner och knappmappning; klientkod levereras inte med appen. De har inte testats i spelklienten. Menu/View-öppnare och enhetsetiketter är markerade som sådant som behöver jämföras med spelets knappförklaring. Modifierarsidor kan bytas; actionbar-förmågor beror på spelarens egna placeringar. Villkorliga paneler märks med att de behöver vara tillgängliga. Guiden omfattar dokumenterade funktioner, inte ett löfte om varje kontextåtgärd i varje klientversion.

## Zon- och subzonsökning, version 0.2.0

Zonkatalogen har utökats från samma Forever-zondatabas. Nya zoner har preliminär status; exakta rutter har inte konstruerats från levelintervall. Lokala ortsnamn och dungeonkopplingar är en explicit uppslagstabell. Platser som Crossroads och Ratchet kopplas till The Barrens. Valet är manuellt, inte automatisk positionsavläsning från spelet. Förberedelserna är redaktionella råd. The Barrens hänvisar till Wailing Caverns-förquestsen som redan dokumenterats i dungeonurvalet.

## Questbound 0.3 — character options and game icons

- Blizzard: https://worldofwarcraft.blizzard.com/en-us/news/24304075/ — original class combinations and six new Forever combinations (Gnome Priest, Human Hunter, Dwarf Shaman, Orc Mage, Troll Warlock, Undead Paladin).
- Blizzard: https://worldofwarcraft.blizzard.com/en-gb/news/24302071/wow-forever-meet-the-new-skyborne — Skyborne classes: Warrior, Hunter, Rogue, Druid for both factions, Shaman for Horde, Mage for Alliance.
- Talent rows, columns and prerequisite IDs use the same pinned Wowhead Forever v2 factual catalogue. Icon filenames were matched by talent ID against the retrieved calculator data.
- In-game class, talent and profession icons are Blizzard artwork served by Wowhead's icon CDN, https://wow.zamimg.com/images/wow/icons/medium/. They are bundled for offline use. No guide descriptions or third-party application code are included.

## Version 0.4.0 · checked 27 October 2026

- [New Forever dungeons — Blizzard](https://worldofwarcraft.blizzard.com/en-us/news/24301455/explore-the-new-dungeons-of-world-of-warcraft-forever): locations and recommended brackets for the nine new dungeons. The official 28–33 Dalaran and 40–45 Krol'dok ranges take precedence over conflicting prose in older guides.
- [Forever dungeon overview](https://www.wowhead.com/forever/guide/dungeons-overview-locations-details): remaining recommended brackets. Scarlet Monastery, Maraudon, Blackrock Spire and Dire Maul wings are separate cards. Dire Maul uses the guide's 58–60 recommendation; the conflicting 44–54 database range is disclosed on its cards. Database minimum entry levels are never substituted for recommendations.
- [Cozy Sleeping Bag](https://www.wowhead.com/forever/guide/cozy-sleeping-bag-locations-rewards): faction starts, coordinates and the main chain. Level 14 is the minimum; **level 20 is this guide's recommended timing**, requested by the user. Student Fodder is not represented as a rested-XP item in Forever.
- [Zephras Isle](https://www.wowhead.com/forever/guide/zephras-isle-zone-overview), [library book collection](https://www.wowhead.com/forever/guide/library-book-locations-and-rewards), [Hall of Thanes](https://www.wowhead.com/forever/guide/hall-of-thanes-dungeon-overview-location-rewards), [Deadmines](https://www.wowhead.com/forever/guide/the-deadmines-dungeon-overview-location-rewards), and the individually linked Forever quest/item pages supply the selected reward chains. The data file retains a source for each record.
- [Riverglades arena announcement](https://www.wowhead.com/forever/news/new-ring-of-blood-style-quest-coming-in-wow-forever-383498): this entry is explicitly preliminary; no exact arena reward or confirmed quest sequence is invented.
- Current library sources disagree on the final milestone's level threshold. The final collection reward is visibly marked preliminary. Later Tirion quest details, incomplete new-zone starts and several legacy chains retain preliminary labels where the current Forever evidence is incomplete.
- Quest chains use stable application IDs. Imported old checkmarks are preserved. Only documented dependencies are enforced; some class milestones remain grouped preparation cards because racial variants differ. An actionable follow-up is hidden in quests, zone tips, dungeons and search until its prerequisites are complete. Reward previews do not mark the later quest available.

### Talent artwork and effects

All 27 backgrounds are the game's tree artwork served by Wowhead's calculator at `https://wow.zamimg.com/images/wow/talents/backgrounds/classicplus/<tree-id>.jpg`. They are bundled locally for offline use. Rank effects come from the same Forever calculator v2 game-data snapshot used for the catalogue. HTML is removed before bundling, and displayed text is escaped. No third-party calculator program is included. Category artwork uses the same icon CDN and local asset bundle as class icons.

### Profession planning

- [Cooking in Forever](https://www.wowhead.com/forever/guide/professions/cooking/overview-leveling), updated 24 October: fish route through 225; stage budgets 52 / 55 / 55 / 65 / 55. This totals 120 Catfish across two stages.
- [First Aid in Forever](https://www.wowhead.com/forever/guide/professions/first-aid/overview), updated 11 October: bandage route through 225; 175 Linen, 150 Wool, 135 Silk and 20 Mageweave for the full route. These are guide budgets, not guaranteed totals.
- [Fishing in Forever](https://www.wowhead.com/forever/guide/professions/fishing/overview-leveling), updated 24 October: catch-based skill gains, training progression, useful fishing brackets and Artisan quest fish. There is no nonzero crafting-material budget for Fishing skill-ups.
- [Cooking 225–300 fallback](https://www.wowhead.com/classic/guide/cooking-leveling-1-300-wow-classic): 70 Yellowtail, 25 Mightfish, 25 Hot Spices and 25 Soothing Spices. It is always marked as preliminary Classic planning rather than a verified Forever route.
- [First Aid 225–300 fallback](https://www.wowhead.com/classic/guide/first-aid-leveling-1-300-wow-classic): budgets 80–100 Mageweave and 80–100 Runecloth. The planner uses the upper 100 of each, divided into approximate stages (30/70 Mageweave and 60/40 Runecloth). This split is editorial planning, visibly disclosed, not a quoted exact guide table.
- [Clamlette Surprise](https://www.wowhead.com/forever/quest=6610): 12 Giant Eggs, 10 Zesty Clam Meat and 20 Alterac Swiss are shown separately as Artisan unlock materials.
- Quantities from an incomplete stage are prorated from its full guide budget and rounded up. They exclude consumable reserves, camp objects, equipment crafts and the user's untracked inventory. This deliberately avoids combining optional alternate leveling paths into a misleading shopping total.
- Equipment examples come from the current Forever level-30 class/spec/role guides, linked in each candidate. All nine classes and their supported roles have coverage. The active build narrows specialization where possible; selected role takes precedence for hybrid healer/tank builds. Without a decisive build, the applicable alternatives remain explicitly labeled. Only confirmed recipe skill requirements are shown; an unknown requirement is not inferred from character level. These are selected upgrade candidates, not an item-score optimizer or a complete level-60 list.


## 0.5.0 world atlas and native talent planning (2026-10-27)

- Map art: Blizzard game assets, accessed through Wowhead's `classicplus` map directory (`https://wow.zamimg.com/images/wow/classicplus/maps/enus/original/<zone-id>.jpg`). Every one of the 50 zone/city image URLs was downloaded and decoded during preparation. This includes Zephras Isle (16593), Riverglades (16591), Shen'dralas (16651), and Mount Hyjal (616).
- World and continent artwork: [Wowhead's datamined map collection](https://www.wowhead.com/forever/news/new-and-modified-world-maps-in-world-of-warcraft-forever-382950), screenshot IDs 1301490 (Azeroth), 1301489 (Eastern Kingdoms), and 1301519 (Kalimdor), visually verified. Empty black padding was cropped; the game artwork and its printed names were retained. The three overview images are bundled. Zone images load on demand and are cached by the service worker after opening.
- Continent navigation diamonds are hand-placed region selectors. They are not quest/NPC positions or precise player coordinates. No automatic player-location tracking is claimed. Zone details are the names printed on the client map, not newly invented smaller-area maps. The local search covers the guide's known town/subzone names and is not an exhaustive place database.
- Native calculator constraints use the existing Forever talent catalogue: 51 total points, maximum rank, earlier-row point requirements, talent prerequisites, and documented minimum level. New plans begin at level 10. A removal is rejected when the remaining saved leveling order becomes invalid. Imported builds are preserved; editing creates a separate copy, deriving a valid order when the original link has none.
- Crafted-item equip levels and item IDs were extracted from the item data embedded in the same 28 current class/spec guide pages already used by the professions planner. Where a specific item's equip level or recipe skill was unavailable, it remains explicitly unknown rather than guessed. Craft checkmarks use stable profession/item identifiers and are independent of quest progress.


## 0.6.0 talent availability and journey planner (2026-10-27)

- Availability uses the native calculator's existing legality check for the exact planned allocation and next planned level, including maximum rank, earlier-row points, explicit prerequisites, the 51-point budget and minimum level. Locked nodes remain clickable for their explanatory tooltip; they are not disabled controls.
- Public-transport endpoints and faction flags were checked against [Wowhead's Forever World Map](https://www.wowhead.com/forever/world-map) and its published `wow.worldMap.classicplus.voyages` data snapshot (14 voyage records, retrieved 2026-10-27). The three-stop service uses the directed order Menethil Harbor → Southshore → Auberdine → Menethil Harbor. Opposite trips may stay aboard through the intermediate stop; they are not invented reverse sailings. Ordinary boats, the three Horde zeppelins, the Feathermoon ferry and Deeprun Tram use the snapshot's documented connections. Fixed Darnassus/Rut'theran access is represented by the city portal, not a road off the tree.
- [Three New Ship Routes Debuting in Forever](https://www.wowhead.com/forever/news/three-new-ship-routes-debuting-in-forever-382891) supports Stormwind–Auberdine, the Menethil/Southshore/Auberdine service, and Steamwheedle Port–Powderfuse Port. Dock names use Steamwheedle Port rather than mistaking the inland Gadgetzan map label for a coastal dock.
- [Zephras Isle zone overview](https://www.wowhead.com/forever/guide/zephras-isle-zone-overview), updated 2026-10-22, explicitly allows both factions on both skyboats. Dalaran is reached at the dock outside its walls; Horde receives a city-guard warning. The Mulgore endpoint is the dock south of Skywatcher Plateau, not the top of Thunder Bluff. The four published dock coordinates are included. The Mulgore cliff approach is explicitly a local map check, without an invented ramp, racial glide or cliff jump.
- [Blizzard's Found Photos recap](https://worldofwarcraft.blizzard.com/en-us/news/24304071/world-of-warcraft-forever-found-photos-panel-recap) supports the Redridge fork into Riverglades and the Valley of Bones route from Desolace into Shen'dralas. Classic ground links are an editorial zone-transition network checked against the game map artwork; directions are not a complete turn-by-turn navigation mesh. An unverified Hinterlands/Western Plaguelands shortcut was excluded. Timbermaw Hold routes warn about reputation and hostile furbolgs.
- The Mount Hyjal approach via Darkwhisper Gorge follows [Icy Veins' zone guide](https://www.icy-veins.com/wow-forever/zones-and-maps/) and is marked preliminary in the route and the route-level warning. Do not treat it as a confirmed open passage.
- Routes are suggestions ranked by positive leg weights and a penalty for zones substantially above the character's level. No real travel time, transport timetable, fastest-path guarantee, safe-road guarantee or unlocked flight path is inferred. Named subzone approaches use the player's in-game map; only documented macro connections are added to the network. Enemy transport is filtered by faction; enemy settlements are avoided in transit unless that option is explicitly disabled. An enemy settlement can still be chosen as the actual start or destination, with a guard warning.
- Player-class travel spells and Skyborne's one-way Dalaran portal are not included. In particular, the removed Stormwind-to-Dalaran return portal is never assumed: [final-beta Dalaran report](https://www.wowhead.com/forever/news/dalaran-updated-ahead-of-the-betas-end-in-wow-forever-383523).
