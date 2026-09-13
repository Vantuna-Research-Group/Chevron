# Field Notes

Station observation app for the RSW and benthic survey run. One page, no backend.

## Deploy

1. Create a public repo and put these six files in the root.
2. Settings, Pages, source "Deploy from a branch", branch `main`, folder `/ (root)`.
3. Wait for the green check, then open `https://<user>.github.io/<repo>/`.

## On each phone

Open the URL in Safari, then Share, then Add to Home Screen. This matters
for two reasons. It gives the app a standalone window, and it exempts the
saved data from Safari's seven-day purge of storage for unvisited sites.

Open it once on wifi before heading out. That caches the app shell and pulls
the tide table for the date.

## Releasing a change

Edit `index.html`, bump `APP_VERSION` in `sw.js`, push.

A phone that already has the app will keep running the old version until
someone opens Data and taps "Install the new version". This is deliberate.
Nobody gets swapped to new code in the middle of a station.

## Files

- `index.html` — the whole app
- `sw.js` — offline cache. `APP_VERSION` at the top is the release marker
- `manifest.webmanifest` — home screen name, icon, colours
- `icon-192.png`, `icon-512.png`, `apple-touch-icon.png`

## Data

Each phone keeps its own records in `localStorage` on this origin.
Data, Save backup writes a JSON file. Data, Load a phone merges one in.
Export the CSV from whichever phone holds the merged set.

Records do not move between origins. Data saved from a local file copy
will not appear on the hosted version.
