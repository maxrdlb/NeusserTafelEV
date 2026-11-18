# Neusser Tafel e.V. – Website

Statische Website, kein Build-Schritt. HTML in der Wurzel, alles andere unter `assets/`.

## Umgebungen

| Umgebung | Branch | Adresse | Zweck |
|---|---|---|---|
| Lokal | beliebig | http://127.0.0.1:8000 | Entwickeln |
| Testseite | `dev` | https://maxrdlb.github.io/NeusserTafelEV/vorschau/ | Abnahme durch den Verein |
| Live | `main` | https://maxrdlb.github.io/NeusserTafelEV/ | Öffentliche Seite |

Die Testseite trägt einen Hinweis „Testversion – noch nicht freigegeben“ und ist für Suchmaschinen gesperrt. Beides wird beim Veröffentlichen automatisch eingefügt und landet nie auf der Live-Seite.

Lokal starten: `python3 -m http.server 8000 --bind 127.0.0.1` im Projektordner.

## Ablauf für Änderungen

1. **Umsetzen:** Neuer Branch von `dev`, zum Beispiel `aenderung/oeffnungszeiten`. Pull Request nach `dev`.
2. **Testseite:** Nach dem Merge in `dev` ist die Änderung nach 1 bis 2 Minuten unter `/vorschau/` zu sehen.
3. **Abnahme:** Der Verein prüft die Testseite und gibt schriftlich frei, zum Beispiel per Mail.
4. **Freigabe:** Pull Request `dev` → `main` mit dem Titel „Release: …“. In der Beschreibung steht, wer wann freigegeben hat. Erst danach wird gemergt.
5. **Live:** Nach dem Merge in `main` ist die Änderung nach 1 bis 2 Minuten live.

`main` ist geschützt: Direkte Pushes sind gesperrt, Änderungen kommen nur per Pull Request.

Eilige Korrekturen, etwa ein falscher Termin, laufen genauso, nur schneller: Branch, PR nach `dev`, kurz prüfen lassen, Release.

## Später: eigener Hoster

Sobald die Seite beim endgültigen Hoster liegt, wird `main` per Workflow dorthin hochgeladen (SFTP). Die Testseite kann auf GitHub Pages bleiben.
