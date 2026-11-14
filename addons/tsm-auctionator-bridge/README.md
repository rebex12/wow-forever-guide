# TSM Auctionator Bridge

Version **0.2.0-alpha**, för **WoW: Forever**. Ett separat addon som
låter andra addons få priser från TradeSkillMaster när de frågar Auctionators
pris-API.

**Status:** automatiskt testat med simulerade WoW-, TSM- och Auctionator-API:er.
Ännu inte verifierat i Forever-klienten eller tillsammans med specifika mottagaraddons.

## Installation

1. Installera Forever-versionerna av **Auctionator** och **TradeSkillMaster**.
   TSM måste redan kunna visa prisdata för föremålet på din marknad.
2. Hämta [det installerbara ZIP-paketet](downloads/TSMAuctionatorBridge-0.2.0-alpha.zip?raw=true)
   och packa upp det.
3. Kopiera mappen `TSMAuctionatorBridge` till
   `World of Warcraft/_forever_/Interface/AddOns/`.
4. Kontrollera att filen ligger direkt på
   `Interface/AddOns/TSMAuctionatorBridge/TSMAuctionatorBridge.toc`.
   Kopiera inte repots yttre mapp som addonmapp.
5. Starta om spelet och aktivera addonet. Både Auctionator och bryggan måste
   vara aktiverade. Aktivera även TSM för att få TSM-priser.

Om du hämtar hela repot med **Code → Download ZIP** finns själva addonmappen i
`addons/tsm-auctionator-bridge/TSMAuctionatorBridge/`.

Ett installerbart ZIP med rätt mappstruktur byggs också av
`python3 scripts/package.py`, kört från `addons/tsm-auctionator-bridge/`.
GitHub Actions sparar det som en nedladdningsbar artifact under
**Actions → TSM Auctionator Bridge - test and package → vald körning → Artifacts**.

## Standardbeteende

- Bryggan är aktiverad och använder **DBMinBuyout**.
- Om TSM saknar ett giltigt pris används Auctionators ursprungliga pris.
- Om båda saknar pris returneras inget pris, aldrig ett påhittat nollpris.
- Priserna anges i koppar **per föremål**. Mottagande addon hanterar antal.
- Inställningarna sparas för kontot mellan sessioner.

## Grafiskt fönster

Skriv **`/tsmbridge`** för att öppna eller stänga fönstret. Det går att flytta
genom att dra i rubriken. Stäng med kryssknappen eller Escape.

- **Use TSM prices for other addons:** aktivera eller stäng av bryggan.
- **Price source:** välj DBMinBuyout, DBMarket eller DBRecent med knapparna.
- **Use Auctionator when TSM has no price:** aktivera eller stäng av reservpriset.
- **Compare an item:** skriv ett item-ID, eller klistra in en itemlänk. Med
  fokus i fältet kan också shift-klickade länkar fångas från WoWs länkfunktion.
  Tryck **Compare** eller Enter.
- Tre prisrutor visar **TSM**, **Auctionator** och **Delivered to addons**.
  Resultattexten förklarar vilket pris som används. Byte av föremål eller
  inställning rensar den föregående jämförelsen.
- Statusraden visar anslutningar, och räknarna visar anrop och fel under
  sessionen. `TSM API: ready` betyder att API:et finns; använd Compare för att
  se om det finns prisdata för ett visst föremål.

Inställningarna sparas direkt. Den periodiska statusuppdateringen gör inga
prisförfrågningar. Fönstret byggs först när det öppnas, med WoWs egna
UI-kontroller och utan extra GUI-bibliotek.

## Kommandon för felsökning

| Kommando | Funktion |
| --- | --- |
| `/tsmbridge` | Öppnar eller stänger det grafiska fönstret. |
| `/tsmbridge ui` | Samma funktion som `/tsmbridge`. |
| `/tsmbridge status` | Skriver status och statistik i chatten. |
| `/tsmbridge test 2447` | Visar TSM-pris, ursprungligt Auctionator-pris och det pris API:et returnerar. |
| `/tsmbridge test <itemlänk>` | Samma kontroll för en inklistrad/shift-klickad itemlänk. |
| `/tsmbridge source dbminbuyout` | Använder lägsta utköpspris i TSM:s senaste data. Standard. |
| `/tsmbridge source dbmarket` | Använder TSM:s viktade marknadsvärde över 14 dagar. |
| `/tsmbridge source dbrecent` | Använder TSM:s marknadsvärde från den senaste prisögonblicksbilden. |
| `/tsmbridge fallback on` | Använder Auctionators pris när TSM saknar data. Standard. |
| `/tsmbridge fallback off` | Returnerar inget pris om TSM saknar data. |
| `/tsmbridge off` | Låter alla anrop gå till Auctionators ursprungliga funktioner. |
| `/tsmbridge on` | Aktiverar prisöverföringen igen. |

Förändringar gäller nästa API-anrop. Stäng och öppna mottagaraddonets fönster
efter en ändring. Om det lagrar priser i en egen cache kan `/reload` behövas.
Bryggan skickar inte artificiella skanningshändelser till andra addons.

## Vad första versionen täcker

Bryggan ersätter följande funktioner medan spelet körs:

```lua
Auctionator.API.v1.GetAuctionPriceByItemID(callerID, itemID)
Auctionator.API.v1.GetAuctionPriceByItemLink(callerID, itemLink)
```

Den anropar TSM:s `TSM_API.GetCustomPriceValue(source, itemString)` och använder
`TSM_API.ToItemString(itemLink)` för länkar. Suffix och bonusinformation bevaras
enligt TSM:s egen konvertering; om länken inte kan konverteras används
reservbeteendet. Bryggan byter inte själv till ett grundföremål utan suffix.

Originalfunktionerna sparas för reservpriset. Auctionators databas ändras inte
och dess filer skrivs inte om. Vendor- och disenchant-priser påverkas inte.
Auctionators egna vyer som läser databasen direkt kan därför fortfarande visa
Auctionators pris.

### Skydd mot rundgång

- Anrop med TSM:s caller-ID (`TradeSkillMaster` eller `TSM`) går alltid till
  Auctionators originalfunktioner. TSM:s egen Auctionator-källa matas inte
  tillbaka med TSM-priser.
- Under en pågående TSM-utvärdering går alla återkommande Auctionator-anrop
  till originalfunktionerna, oavsett caller-ID.
- Endast de tre inbyggda AuctionDB-källorna ovan tillåts. Egna prisformler och
  källor som `AtrValue` stöds inte i detta utkast.
- Fel i TSM eller en API-funktion som ännu inte är redo utlöser reservbeteendet.

### Prisålder och exakthet

Om Auctionators funktioner för prisålder och exakthet finns ansluts även de.
När priset kommer från TSM returneras **okänd ålder (`nil`)** och **inte en exakt
Auctionator-skanning (`false`)**. Ett gammalt skanningsdatum från Auctionator
får därmed inte beskriva ett annat pris från TSM. När reservpriset används
returneras Auctionators ursprungliga metadata.

Addons som kräver ett känt skanningsdatum eller en exakt Auctionator-skanning
kan därför välja att inte använda TSM-priset.

## Begränsningar

- TSM:s prisdata måste finnas i spelet. Bryggan laddar inte själv ned data och
  gör inga AH-skanningar. Data kan vara äldre än de aktuella auktionerna.
- Direktläsning av Auctionators databas, äldre funktioner som
  `Atr_GetAuctionBuyout`, egen priscache och funktioner som sparats av ett
  annat addon innan bryggan laddats täcks inte.
- Om ett annat addon byter ut samma API efter bryggan visas funktionen som
  frånkopplad i status. Bryggan försöker inte lägga nya lager ovanpå det.
- Addonet är en kompatibilitetslösning, inte en officiell integration från
  Auctionator eller TSM. Uppdateringar kan kräva anpassning.

## Kontroll i spelet

1. Kör `/tsmbridge status`. Båda prisfunktionerna ska stå som `connected` och
   TSM:s pris-API ska finnas.
2. Kör `/tsmbridge test 2447`, eller testa ett material som TSM visar ett pris
   för hos dig. Vid tillgänglig TSM-data ska returpriset motsvara vald TSM-källa.
3. Öppna ett addon som använder Auctionator och kontrollera samma föremål.
   Kör status igen: räknaren `TSM` ska ha ökat om anrop passerat bryggan.
4. Kör `/tsmbridge off`, öppna mottagarens fönster igen och kontrollera att
   det får Auctionators ursprungliga pris. Aktivera igen med `/tsmbridge on`.

Om testkommandot får TSM-pris men mottagaraddonet inte gör det är det ofta
ett tecken på att mottagaren använder en annan läsväg eller egen cache.

## Utveckling och verifiering

```sh
lua5.1 tests/run.lua
python3 scripts/package.py
```

De 38 testerna omfattar prisval, reservpris, saknad och sen TSM-data, felhantering,
suffixbevarande, direkt och indirekt rundgång, metadata, sparade inställningar,
addons laddningshändelser, slashkommandon och det grafiska fönstrets
knapptryckningar, prisjämförelse, länkfält och stängning. De verifierar logiken
med testdubblar; de ersätter inte kontroll i WoW-klienten.

TOC-filen riktar sig till Forever interface **16001**. API-anropen har stämts av
mot publikt tillgänglig Auctionator API v1-kod och TSM:s publika addon-API.
Den faktiska Forever-versionens runtimebeteende är ännu inte verifierat.

Referenser:

- [TSM:s dokumentation om addon-API:et](https://support.tradeskillmaster.com/en_US/api-documentation/what-is-the-tsm-addon-api-and-how-do-i-use-it)
- [TSM:s priskällor](https://support.tradeskillmaster.com/custom-strings/which-price-sources-can-i-use-and-what-do-they-mean)
- [Auctionator API v1, publik port som referens](https://github.com/JedborgWoW/Auctionator-3.3.5a/tree/main/Source/API/v1)
- [TSM Core/API.lua, publik källkodskopia som referens](https://github.com/ichibsah/AddOns/blob/master/TradeSkillMaster/Core/API.lua)

Ingen kod eller prisdatabas från TSM eller Auctionator ingår i paketet.
