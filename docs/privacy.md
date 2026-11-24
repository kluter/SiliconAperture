# Security & Privacy

## Your photo

Your photo never leaves your browser. It is drawn into a canvas and its EXIF is read in memory: no upload, no server. All EXIF text is written with `textContent`, so a file with crafted metadata cannot inject anything into the page.

## Network requests

Both libraries are bundled in `vendor/`, so the only outbound requests are map tiles from public tile servers (Esri, OpenStreetMap):

```javascript
// Every network request SiliconAperture makes:
// GET .../tile/{z}/{y}/{x}                (map tiles)
// No image data, no coordinates, nothing else.
```

A Content Security Policy in `index.html` allows scripts from the site itself only, and network requests to those tile servers only.

The right-click menu's *Open in …* entries (Google Maps, Street View, Google Earth, OpenStreetMap, TracePoint, and the services under *Open in…*) are plain links: nothing is sent until you click one, and then only the coordinates of the clicked spot go to that service.

**Map tiles reveal the area you look at.** A tile server can infer what location you are measuring. When a photo carries GPS in its EXIF, the map flies there by itself, so the tile server sees the area where the photo was taken. Use a VPN if that matters, or strip the GPS from the photo first.

## Clipboard

`Ctrl+V` reads only what you paste, at the moment you paste it. The page never reads the clipboard on its own. Copying coordinates (EXIF GPS, right-click menu) writes to it only when you click.

## Stored in this browser

| What | Where | Why |
|---|---|---|
| Your photos and what you measured on them, the map view and basemap | IndexedDB `siliconaperture` | Autosave: a refresh keeps the work. Closing a tab deletes its copy |
| Autosave on or off | `localStorage` (`sa-autosave`) | The ☰ switch, shared by all tabs of this browser |
| Photo/map split, photo hidden | `localStorage` (`sa-split`, `sa-hidden-side`) | Layout preferences |

Nothing is stored anywhere else.

**Deleting it:** ☰ → **Clear** deletes the saved photos and measurements and starts empty. Switching **Autosave** off deletes the saved copy and stops saving, for sensitive material. Closing a photo tab deletes that photo. The browser's *clear site data* removes everything, the layout preferences included.

**How long it lasts:** until deleted. It survives refreshes, hard reloads and browser restarts. The browser may still evict it when the disk runs low (the site does not ask for persistent storage), and Safari deletes it after 7 days without a visit. It is per browser and per address: the live site and a local copy each keep their own.

Only one browser tab of SiliconAperture saves at a time (a Web Lock). A second tab restores the saved work but keeps its own changes to itself until the first is closed.

## Dependencies

| Library | Purpose | Loaded from |
|---|---|---|
| [MapLibre GL JS](https://maplibre.org/) 6.19 | Map rendering (globe) | `vendor/maplibre-gl/` |
| [exifr](https://github.com/MikeKovarik/exifr) 7.1.3 | EXIF metadata parsing | `vendor/exifr/` |

This tool was built with AI assistance. The code is plain, unminified JavaScript: read it directly in `js/script.js`.
