# Controls

Everything SiliconAperture can do, area by area. The photo is on the left, the map on the right; the bar above both holds the inputs.

## Photo tabs

Each tab is one photo with everything measured on it: marks, camera, the known value, solve mode and the map points.

| Control | Action |
|---|---|
| Click a tab | Switch photos (`←` / `→` when a tab has focus) |
| Double-click a tab's name | Rename it (`Enter` keeps, `Esc` cancels) |
| **+** | New empty tab |
| **×** on a tab | Close it, with its saved copy. Closing the last one leaves an empty tab |
| Dot on a tab | Grey: empty · dark red: photo loaded · red: there is a result |

Work is saved in the browser as you go and comes back after a refresh (see [privacy.md](privacy.md)).

## ☰ menu

At the right end of the bar over the photo (as in ShadowFinder).

| Control | Action |
|---|---|
| **Autosave** switch | On (default): photos and measurements are kept in this browser. Off: the saved copy is deleted and nothing is saved |
| **Clear** | Delete the saved copy and start with one empty tab (asks first) |
| **Demo** | Open the demo photo |

## Photo

| Input | Action |
|---|---|
| Drop, `Ctrl+V` or **Browse** | Open a photo. With a photo already open, it opens in a new tab |
| **Try the demo** | Open the demo photo with its EXIF (camera, focal length, GPS) |
| Click | Place mark A, then B. The span fills in |
| Drag a mark | Move it; span and result follow |
| Drag, middle-drag | Pan |
| Scroll | Zoom |
| ↺ (top right) or `R` | Reset the marks |
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

## Diagram

The pinhole diagram above the map is the step guide: known values in grey with their numbers, the next missing one outlined in red, the unknown dashed with `?`. Once solved, the whole diagram turns red. Click a part to go to its input.

## Map

| Input | Action |
|---|---|
| Click (size mode) | Camera (dark point), then object (red point): their distance becomes `D`. A third click starts over |
| Drag a point | Move it; the distance or the ring follows. Points sit above the photo's GPS marker |
| Click (distance mode) | The object: draws the ring (or band) of camera positions |
| Right-click | Copy coordinates · the camera stood here · the object is here · open the spot in Google Maps, Street View, Google Earth, OpenStreetMap or **TracePoint** · **Open in…** Apple Maps, Lookmap, Bing Maps, Mapillary, Yandex Maps, Baidu Maps |
| Right-drag, `Ctrl`+drag | Rotate and tilt |
| Coordinates field, or `Ctrl+V` anywhere | Drop a numbered pin and fly there, in either mode (see formats below). Click a pin to put the next point exactly on it; the pin list (top left) flies to a pin or removes it |
| **Dark · Satellite · OSM** | Basemap (remembered) |
| GPS button (top left) | Fly to where the photo was taken |
| Globe button (top left) | Let the globe spin |
| ↺ (top right) | Clear the map points |

### Coordinate formats

`52.520, 13.405` · `52.52 13.405` · `33.9S 151.2E` · `N 52.5 E 13.4` · `52°32'43.8"N 13°13'11.6"E` · `52°31.5'N 13°24'E` · `52,52 13,405` · longitude first when the letters say so · links from Google Maps, Apple Maps, Bing, OpenStreetMap, Yandex, Google Earth, or any link with `lat=` / `lon=`. Short links (`maps.app.goo.gl`, …) cannot be read without asking their server: open them and copy the full address.

## Divider

Drag the bar between photo and map to resize (remembered). Double-click resets to 60:40; with focus, `←` / `→` (`Shift` for bigger steps). The chevron hides the photo for a full-width map, and brings it back.

## Keys

| Key | Action |
|---|---|
| `R` | Reset the marks |
| `N` | Turn the map north up and flat (no tilt) |
| `Ctrl+V` | Paste a photo or coordinates |
| `Esc` | Close the help, or the map menu |

`R` and `N` go by key position, so they stay put on German or French layouts.
