# Questbound – Changelog

Alla ändringar nedan finns i GitHub-repot. Changeloggen visas inte på webbplatsen.

## 0.7.2 – 2026-10-27
- **Overview:** Aktivitetsfiltret ligger nu till höger, bredvid ”Show completed”, i stället för mitt på skärmen. Flikarna ”Current”, ”Upcoming”, ”All” och ”Skipped” ligger kvar till vänster. Mobilanpassningen behålls. (`v07.css`)
- **Inställningar:** Beginner Mode är avstängt som standard när en ny karaktär skapas. Befintliga karaktärers val ändras inte, och läget kan fortfarande aktiveras manuellt. (`core.js`, `tests/core.test.cjs`)
- Versionsnumret och offline-cachen är uppdaterade så att ändringarna hämtas i webbappen. (`app.js`, `index.html`, `sw.js`)

## 0.7.1 – 2026-10-27
- Flyttade ”To do now”-checklistan till direkt under karaktärens levelval på Overview.
- Lade till **Skip**, **Undo skip** och vyn **Skipped** för uppgifter. Skippade uppgifter är inte avklarade, låser inte upp fortsättningsquests och sparas i backup.
- Berör främst `app.js`, `core.js`, `v07.css` och testerna.

## 0.7.0 – 2026-10-27
- Lade till personliga mål, materialinventering och planering av besök i städer för träning och questinlämning.
- Utökade GPS/reseplaneringen med fler destinationer, instansentréer, flight paths och rutter både med och utan upplåsta flygpunkter.
- Förbättrade offline-hanteringen och förebyggde dubbla händelsehanterare efter sidbyten.

## 0.6.0 – 2026-10-27
- Förtydligade i talent-kalkylatorn vilka talents som kan väljas och vilka krav som saknas.
- Lade till reseplanering på världskartan med vägledning för resor mellan platser.

## 0.5.0 – 2026-10-27
- Lade till interaktiv världskarta med zoner, kartnavigering och sökning.
- Lade till möjlighet att skapa och redigera talent-builds direkt i Questbound.
- Lade till professionsrelaterade craftinguppgifter i Overview.

## 0.4.0 – 2026-10-27
- Förbättrade talents med beskrivningar, nivåer och tydligare information.
- Lade till questkedjor, dungeonstöd och mer planering för professions.
- Förbättrade hur offline-filer uppdateras efter nya versioner.

## 0.3.0 – 2026-10-26
- Lade till tomma karaktärsprofiler som användaren själv fyller i.
- Förbättrade visningen av talents och vägledningen under leveling.

## 0.2.0 – 2026-10-26
- Lade till språkval, teman, mer zonhjälp och referens för spelkontroller.

## 0.1.0 – 2026-10-26
- Första utkastet till levelingguiden, ursprungligen under arbetsnamnet **Färdväg**.
- Lade grunden för karaktärsprofiler, quests och en webbapp avsedd för GitHub Pages.
