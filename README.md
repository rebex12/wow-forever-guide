# Färdväg — WoW Forever levelingguide

Version 0.2.0 av en mobilvänlig levelingkompis för alla nio klasser. Engelska är standardspråk och svenska finns som språkval. Engelska spelnamn behålls. Appen använder vanlig HTML, CSS och JavaScript och behöver ingen installation eller byggprocess.

## Publicera med GitHub Pages

1. Öppna repositoryts **Settings → Pages**.
2. Välj **Deploy from a branch** under **Source**.
3. Välj **main** och **/(root)** och klicka **Save**.
4. Vänta tills GitHub visar att sidan är publicerad.

För detta repository blir projektadressen `https://rebex12.github.io/wow-forever-guide/` när Pages är aktiverat. Läs den adress och publiceringsstatus som GitHub visar innan du delar sidan.

Alla resurslänkar, manifest och service worker använder relativa sökvägar, så guiden fungerar under repositoryts undermapp. `.nojekyll` markerar att filerna ska serveras direkt.

## Funktioner i utkastet

- Flera karaktärsprofiler med klass, ras, faction, level, roll, inriktning och professions.
- Lokal autosparning av framsteg, notes, builds och filter. Föregående sparfil skyddas om den inte går att läsa.
- Level `+`/`−` och direktinmatning, utan att avbockningar återställs.
- Export av alla profiler eller en profil och validerad JSON-import. Import lägger till nya profiler och skriver inte över befintliga.
- Kategorifilter, aktuellt/kommande/allt och visning av klara uppgifter.
- Sökning även i dolda kategorier, alla levels, abilities, talents, dungeonquests och ordlista. Valbar sökning över alla klasser och factions.
- Wowhead Forever `v2`-import för alla nio klasser: slutbuild, trädens poängfördelning och komprimerad poängordning när länken innehåller den.
- Flera namngivna builds, aktiv build, nästa talentpoäng och redigerbar poängordning. Förkrav och vissa levelspärrar kontrolleras.
- Modifierad Wavebreaker-plan: Improved Ghost Wolf 15–16, Water Shield 27 och Stormstrike 40. Standardtalangstart är level 10.
- Klassquests för alla nio klasser och ett urval övriga milstolpar, med stegvis avbockning.
- Dungeonintervall, inträdesuppgifter, förquests, questgivare och kopierbara koordinater där underlag finns.
- Zonförslag, abilityträning, professions/camping och länkar till gearguider.
- Nybörjarläge, ordlista, egna anteckningar och kompakt spelläge.
- Responsiv layout för mobil, surfplatta och dator. Funktionerna använder tryck/klick och tangentbord.
- Offlinecache och webbappmanifest. Första besöket måste göras online via HTTPS eller localhost. Appens egna filer cachelagras; externa Wowhead-sidor är tillgängliga online.

## Nytt i 0.2.0

- Engelska som standard och svenska som val under **Settings → Language**. Gränssnitt och guideförklaringar byter språk. Egna namn och anteckningar lämnas orörda.
- Fem sparade färgteman: Forest, Dark / OLED, Light, Frost och Parchment. OLED-temat har svart huvudbakgrund.
- **My zone / Min zon**: sök zoner, orter och subzoner i samma fält. Crossroads och Ratchet väljer The Barrens. Valet sparas separat för varje profil.
- Zonhjälp med förberedelser, relevanta klassuppgifter och länkade dungeonquests med förkrav där underlag finns. Kategorifiltren gäller även här.
- Fyra nivåer av levelinghjälp. Högsta nivån visar alla matchande uppgifter och öppnar dokumenterade queststeg, även i kompakt spelläge.
- Grundtips om första stadsbesöket, flygpunkter, dungeonförberedelser och träningsguld visas bara i nybörjarläget. Nybörjartexter förklarar bland annat orterna Crossroads/Ratchet och dungeonen Wailing Caverns direkt i zonkorten.
- Sökbar **Controller support / Handkontroll** med Xbox-, PlayStation- och generiska knappnamn, menynavigering, snabbkommandon, målval, actionbars och klassfunktioner.
- Samma lagringsnyckel och profilschema. Befintliga avbockningar, anteckningar, builds och filter följer med. Språk och tema gäller hela webbläsaren; zon, hjälpnivå och handkontrollstyp hör till profilen.

Hjälpnivån styr mängden instruktioner. Nybörjarläget styr grundläggande förklaringar och påminnelser. De kan väljas oberoende av varandra.

## Innehållets omfattning

**Detta är ett funktionsutkast, inte en komplett eller självtestad questdatabas.**

Klass- och dungeonquests är ett urval. Flera exakta queststarter, rasvarianter, belöningar och fullständiga dungeonquestlistor behöver kompletteras. Gearsektionen har klassmål och länkar men inte full statprioritering eller lootlistor för alla specs. Zonhjälpen innehåller förberedelser och dokumenterade queststeg, men ännu ingen full quest-för-quest-rutt för alla zoner. Högsta hjälpnivån visar det dokumenterade underlaget. Träningslistan visar första rankens nivå, inte alla senare ranks eller kostnader. Innehåll efter level 30 är avsett att byggas ut.

Inträdeskrav hämtas från Forever-zondatabasen och visas separat från guiderna om rekommenderad level. Ett nollvärde i databasen visas som ett okänt krav. Uppgifterna behöver vid behov verifieras i spelklienten; gamla Classic-kommentarer används inte som bekräftelse på Forever-regler.

Status visas vid innehållet:

- **Källuppgift:** hittad i en angiven Forever-källa, inte självtestad i spelet.
- **Preliminärt:** behöver mer kontroll eller har motstridiga uppgifter.
- **Praktiskt tips:** redaktionellt råd.

Källor och hämtningstid finns i `SOURCES.md` och i appen. Datakatalogen innehåller faktauppgifter (namn, nivåer, ranktak och förkrav), inte kopierade beskrivningstexter eller Wowheads programkod.

Handkontrollsguiden bygger på UI-koden för Forever-klienten vid en fast källrevision. Den är inte självtestad i spelet. Spelets knappförklaringar gäller i första hand; tillgängliga paneler, modifierarbyten och egna inställningar kan ändra knapparna. Menu/View-knappar behöver jämföras med enhetens knappförklaring. Appen ändrar inga spelinställningar och synkroniserar inte automatiskt med spelet.

## Spara och uppdatera

Karaktärer finns i webbläsarens `localStorage`, under nyckeln `wayfarer.forever.v1`. De skickas inte till GitHub eller någon annan backend. Olika enheter och webbläsare har separata profiler. Rensning av webbplatsdata kan ta bort profilerna; använd export för backup. Samtidiga ändringar i två flikar ger en varning och skyddar mot fortsatt överskrivning tills sidan laddas om.

En exempelprofil, Loreia, skapas vid första besöket. Anpassa den eller skapa en egen. Ingen av utvecklingens testprofiler eller avbockningar ingår i repositoryt.

Vid innehållsuppdateringar:

1. Ändra uppgifterna i `content.js` eller `catalog.js` och behåll befintliga, stabila innehålls-ID:n.
2. Uppdatera datum och ändringslista i `content.js`.
3. Öka cacheversionen i `sw.js` när publicerade filer ändras. Lägg nya lokala resurser i dess fillista. Uppdateringsmeddelandet erbjuder omladdning när en ny worker har installerats.
4. Kör testerna och publicera till samma repository och adress.

Karaktärsdata hålls separat från innehållet. Byt inte lagringsnyckel eller dataschema utan en planerad migrering. Vid byte av domän eller projektadress bör profilerna exporteras och importeras på den nya adressen.

## Utveckling och test

Öppna `index.html` för en snabb titt. Offlinecache behöver HTTP/HTTPS. För lokal utveckling kan du exempelvis använda `python3 -m http.server 8000` och öppna `http://localhost:8000`.

Kör kärntester med en aktuell Node-version:

```sh
node --test tests/*.test.cjs
```

Koden saknar externa runtimeberoenden, externa fonter, analytics och backend. Ikonerna är egna SVG-former.

## Rättigheter

Inofficiellt hjälpmedel utan koppling till Blizzard Entertainment eller Wowhead. World of Warcraft och spelbenämningarna tillhör sina respektive rättighetsägare. Källorna anges för kontroll och vidare läsning.
