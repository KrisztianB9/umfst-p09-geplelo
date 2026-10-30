# LexiType — orvosi terminológia gépelésgyakorló

Böngészőben futó, magyar nyelvű gépelés-sebesség mérő klinikai kifejezésekkel. A feladat véletlenszerűen választ a `texts.js` szövegeiből; a karakterek színe, az élő WPM, a pontosság, a hibaszám és az utolsó tíz próba grafikonja azonnal frissül.

## Élő demó

https://krisztianb9.github.io/umfst-p09-geplelo/

## Képletek

- **WPM:** `(helyes karakterek / 5) / (eltelt milliszekundum / 60 000)`. Például `250` helyes karakter pontosan `60 000 ms` alatt `50 WPM`.
- **Pontosság:** `kerekítve(helyes karakterek / összes begépelt karakter-kísérlet × 100)`. A hibás karakter törlése után a hibaszám megmarad; a javított karakter új leütési kísérletnek számít. Üres próbánál a kijelzett érték `100%`.

Az időmérés az első releváns billentyűleütésnél indul, monoton `performance.now()` órával. A visszajelzés inkrementálisan, a már létrehozott karakter-spaneken frissül. A karakterek NFC normalizálása kezeli a magyar ékezetes betűket és az IME bevitelt; a beillesztés nem kerül a próbába.

Az eredmények a böngésző `localStorage`-ában, a `lexitype-results-v1` kulcson tárolódnak. A vonaldiagram az utolsó tíz kört mutatja.

## Futtatás

Nyisd meg az `index.html` fájlt böngészőben, vagy indíts statikus szervert a repó gyökeréből. A fájlok build lépés nélkül, GitHub Pages-en is kiszolgálhatók.

## Unit tesztek

```sh
npm install
npx vitest run
```

A `stats.test.js` legalább öt esetben ellenőrzi a `stats.js` tiszta függvényeit, köztük a `250 karakter / 60 másodperc = 50 WPM` elfogadási esetet.

