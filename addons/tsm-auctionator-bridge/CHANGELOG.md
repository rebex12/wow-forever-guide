# Ändringslogg

## 0.2.0-alpha — 2026-11-14

- Nytt grafiskt fönster som öppnas med `/tsmbridge` eller `/tsmbridge ui`.
- Av/på och reservpris via kryssrutor, samt tre klickbara val av priskälla.
- Prisjämförelse för item-ID och itemlänkar med TSM-pris, Auctionator-pris
  och det pris som returneras till andra addons.
- Status för anslutningarna, statistik och senaste TSM-fel visas i fönstret.
- Direkt sparade inställningar; föregående jämförelse rensas vid ändringar.
- Flyttbart fönster, Escape-stängning och skalning för mindre skärmar.
- Ursprungliga textkommandon finns kvar för felsökning.
- Totalt 38 automatiska tester, inklusive det grafiska gränssnittets händelser.

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
