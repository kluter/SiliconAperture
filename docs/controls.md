# Controls

Everything SiliconAperture can do, area by area. The photo is on the left, the map on the right; the bar above both holds the inputs.

## Photo tabs

Each tab is one photo with everything measured on it: marks, camera, the known value, solve mode and the map points.

| Control | Action |
|---|---|
| Click a tab | Switch photos (`←` / `→` when a tab has focus) |
| Double-click a tab's name | Rename it (`Enter` keeps, `Esc` cancels) |
| **+** or `N` | New empty tab |
| **×** on a tab | Close it, with its saved copy. Closing the last one leaves an empty tab |
| Dot on a tab | Grey: empty · dark red: photo loaded · red: there is a result |

Work is saved in the browser as you go and comes back after a refresh (see [privacy.md](privacy.md)).

## Photo

| Input | Action |
|---|---|
| Drop, `Ctrl+V` or click | Open a photo. With a photo already open, it opens in a new tab |
| **Try the demo** | Open the demo photo with its EXIF (camera, focal length, GPS) |
| Click | Place mark A, then B. The span fills in |
| Drag, middle-drag | Pan |
| Scroll | Zoom |
| ↺ (top left) or `R` | Reset the marks |
| Step icons (right edge) | The four steps, the current one lit; click it to do it |

HEIC photos cannot be decoded by most browsers: export them as JPEG (the EXIF stays).

## Camera

| Control | Action |
|---|---|
| Camera list | **Presets** first (phone main, ultrawide, telephoto, APS-C, full frame, Unknown), then **Specific model…** by brand. Type to filter |
| **Unknown camera** | The result becomes a range over 24–35 mm equivalent; the ring becomes a band |
| Sensor W / H, focal length | Typed values switch the camera to Custom. Zero or negative values are ignored and underlined |
| **EXIF** lamp | Hover or click for the photo's camera, focal length, size and GPS. Click the GPS value to copy it |

## Measure

| Control | Action |
|---|---|
| **Solve for: Size** | Distance in, size out |
| **Solve for: Distance** | Known size in, distance out, and the ring on the map |
| **Show the math** | The worked formula under the result (remembered) |

## Diagram

The pinhole diagram above the map is the step guide: known values in grey with their numbers, the next missing one outlined in red, the unknown dashed with `?`, filling red with the result. Click a part to go to its input.

## Map

| Input | Action |
|---|---|
| Click (size mode) | Camera, then object: their distance becomes `D`. A third click starts over |
| Click (distance mode) | The object: draws the ring (or band) of camera positions |
| Right-click | Copy coordinates · place the camera or the object here · open the spot in Google Maps, Bing Maps, OpenStreetMap or Google Earth |
| Right-drag, `Ctrl`+drag | Rotate and tilt |
| Coordinates field, or `Ctrl+V` anywhere | Place a point (see formats below) |
| **Dark · Satellite · OSM** | Basemap (remembered) |
| GPS button (top left) | Fly to where the photo was taken |
| Globe button (top left) | Let the globe spin |
| ↺ (top right) | Clear the map points |

### Coordinate formats

`52.520, 13.405` · `52.52 13.405` · `33.9S 151.2E` · `N 52.5 E 13.4` · `52°32'43.8"N 13°13'11.6"E` · `52°31.5'N 13°24'E` · `52,52 13,405` · longitude first when the letters say so · links from Google Maps, Apple Maps, Bing, OpenStreetMap, Yandex, Google Earth, or any link with `lat=` / `lon=`. Short links (`maps.app.goo.gl`, …) cannot be read without asking their server: open them and copy the full address.

## Divider

Drag the bar between photo and map to resize (remembered). Double-click resets to 60:40; with focus, `←` / `→` (`Shift` for bigger steps). The two chevrons hide the photo or the map, and bring it back.

## Keys

| Key | Action |
|---|---|
| `R` | Reset the marks |
| `N` | New photo tab |
| `Ctrl+V` | Paste a photo or coordinates |
| `Esc` | Close the help, or the map menu |

`R` and `N` go by key position, so they stay put on German or French layouts.
