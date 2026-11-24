<h1><img src="assets/logo.svg" alt="SiliconAperture logo" width="28" height="28" style="vertical-align:middle; margin-right:8px;"> SiliconAperture</h1>

**Measure the real-world size of an object from a single photograph.**

`SiliconAperture` applies the pinhole camera model to a photograph: mark two points on an object, give the distance to it and the camera, and it returns the object's physical size. Or give the size, and it returns the distance and draws a ring of possible camera positions on a map. No uploads. No server. Everything runs locally in your browser.

**[Try it live → kluter.github.io/SiliconAperture](https://kluter.github.io/SiliconAperture/)**

![SiliconAperture](assets/SiliconAperture_Demo.gif)

---

## Background

In 2012, on drone campaigns with fixed-wing platforms and a DSLR on a timer, images had to be calibrated the hard way: **inner orientation** (focal length, principal point, distortion) and **outer orientation** (position and attitude in space), before any pixel could be projected back onto the ground. Ground control points laid out by hand, old-school remote sensing.

`SiliconAperture` distills that principle to its simplest useful form: one photo, one known value, one measurement.

---

## The method

<table>
<tr>
<td valign="middle">

By similar triangles, a span on the sensor, `f` behind the pinhole, is `D / f` times larger on an object at distance `D`:

<p align="center"><code>size = D · √( (Δx · p)² + (Δy · p)² ) / f</code></p>

`Δx, Δy` are the marked span in pixels, `p` the size of one pixel on the sensor. The two axes are combined with Pythagoras, so a mark at any angle gives its true length.

**Solve for → Distance** runs it backwards: a known size gives the distance, and the object clicked on the map gets a **ring** of every place the camera could have stood.

</td>
<td valign="middle">

<img src="assets/pinhole-diagram.svg" alt="Pinhole camera model: sensor with pixel span, focal length f, pinhole, distance D, and object" width="380">

</td>
</tr>
</table>

Portrait photos, crops, telephoto and ultrawide shots, and unknown cameras, and the limits of the method: **[docs/method.md](docs/method.md)**.

---

## The key requirement

> **The object must face the camera.** A surface angled toward or away from the lens is foreshortened, and the measurement will be off. The tool cannot detect this.

---

## How to use

1. **Add a photo:** drop it, paste it with `Ctrl+V`, or click to browse. Several photos open in tabs, and a refresh keeps them.
2. **Pick the camera:** EXIF fills it in; otherwise choose a model, a preset (phone main, ultrawide, telephoto, APS-C, full frame) or **Unknown**.
3. **Mark the object:** click both of its ends on the photo.
4. **Give the distance:** type it, or click where the camera stood and then the object on the map.

> New here? Click **Try the demo**: mark both ends of the object, then measure the distance on the map.

The pinhole diagram above the map shows what is still missing. Every control, key and accepted coordinate format: **[docs/controls.md](docs/controls.md)**.

![SiliconAperture in distance mode, with the solved distance drawn as a ring on the map](assets/SiliconAperture_SolveDistance.png)

---

## Security & Privacy

- **Your photos never leave your machine.** No request carries image data. Check it in DevTools → Network.
- **The only requests are map tiles** (Esri, OpenStreetMap). They carry no image data, but tile coordinates reveal the area you look at, and a photo with GPS in its EXIF flies the map there.
- **Autosave keeps your photos and measurements in this browser** (`IndexedDB`), never anywhere else. Closing a tab deletes its copy.
- **Right-click links** (Google Maps, Bing, OpenStreetMap, Google Earth) contact those sites only when you click one.
- **No CDN:** plain, unminified JavaScript with two pinned, bundled libraries ([MapLibre GL JS](https://maplibre.org/), [exifr](https://github.com/MikeKovarik/exifr)), behind a Content Security Policy.

This tool was developed with AI assistance, disclosed because the [risks of opaque, AI-generated OSINT tools](https://www.dutchosintguy.com/post/vibe-coding-is-becoming-an-osint-risk) are real; the answer is readable code anyone can verify.

Every request, every stored value and all caveats: **[docs/privacy.md](docs/privacy.md)**.

---

## Camera database

960+ devices across 34 brands, each marked confirmed, unconfirmed or estimated. Sources, fields, and how to contribute a correction: **[docs/camera-database.md](docs/camera-database.md)**.

---

## Run it locally

A static site, no build step. Serve the folder with anything:

```bash
npx serve .
# or
python3 -m http.server
```

---

## Related

<img src="assets/logo_tracepoint.svg" alt="" width="14" height="14" style="vertical-align:middle;"> **[TracePoint](https://github.com/kluter/TracePoint)** - Geolocate a photo by intersecting lines of sight.

<img src="assets/logo_shadowfinder.svg" alt="" width="14" height="14" style="vertical-align:middle;"> **[ShadowFinder Web](https://github.com/kluter/ShadowFinder-Web)** - Geolocate a photo by the length of a shadow.
