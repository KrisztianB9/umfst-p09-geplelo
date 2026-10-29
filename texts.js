(function exposeTexts(root) {
  "use strict";

  const texts = [
    "glomerulonephritis",
    "A beteg láztalan, általános állapota kielégítő.",
    "A vizelet üledékében fehérvérsejtek láthatók.",
    "Krónikus obstruktív tüdőbetegség, stabil állapot.",
    "A mellkas két oldalán tiszta légzési hang hallható.",
    "Anamnézisében magas vérnyomás és 2-es típusú diabétesz szerepel.",
    "Akut appendicitis miatt sürgős sebészeti konzílium javasolt.",
    "A beteg gyógyszerallergiáról nem tud, rendszeresen véralvadásgátlót szed.",
    "Status post cholecystectomiam, szövődménymentes posztoperatív szak.",
    "A neurológiai vizsgálat során fokális eltérés nem igazolható.",
    "Vérképében enyhe microcytás anaemia észlelhető.",
    "Az echokardiográfia megtartott bal kamrai ejekciós frakciót mutat.",
    "A seb szélei tiszták, váladékozás és bőrpír nem látható.",
    "A műtéti seb gyógyulása megfelelő, a műtét utáni gyógyszerelés módosítást nem igényel.",
    "Javasolt a bőséges folyadékbevitel és a kontrollvizsgálat két hét múlva.",
    "Felvételének oka három napja fennálló láz, köhögés és fokozódó nehézlégzés. Anamnézisében hipertónia és 2-es típusú diabetes mellitus szerepel, rendszeresen perindoprilt és metformint szed, gyógyszerallergiáról nem tud. A fizikális vizsgálat során a beteg éber, orientált, bőre meleg, nyálkahártyái enyhén szárazak. Testhőmérséklete 38,2 °C, vérnyomása 142/86 Hgmm, pulzusa 96/perc, légzésszáma 22/perc, oxigénszaturációja szobalevegőn 94%. A mellkas felett kétoldalt szórtan finom szörtyzörejek hallhatók, a szívhangok ritmusosak."
  ];

  if (typeof module === "object" && module.exports) module.exports = texts;
  if (root) root.CLINICAL_TEXTS = texts;
})(typeof globalThis !== "undefined" ? globalThis : this);
