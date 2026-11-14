# Ändringslogg

## 0.1.0-alpha — 2026-11-14

- Första utkastet för WoW: Forever, interface 16001.
- Levererar TSM-priser via Auctionator API v1, för item-ID och itemlänkar.
- Val mellan DBMinBuyout (standard), DBMarket och DBRecent.
- Valbart reservpris från Auctionators ursprungliga funktioner.
- Skydd mot prisrundgång och fel när TSM inte är redo.
- Bevarar TSM:s itemsträngar för länkar med suffix och bonusinformation.
- Returnerar okänd ålder för TSM-priser i stället för ett annat prisdatums metadata.
- Sparade inställningar, statuskommando och prisjämförelse med `/tsmbridge test`.
- Automatiska tester och byggskript för installerbart ZIP.

Inte verifierat i spelet ännu.
