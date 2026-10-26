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
