# Method

How SiliconAperture turns a span on a photo into a size or a distance, and where that stops being accurate.

## The pinhole model

A camera maps the world onto its sensor through one point, the pinhole (the lens's optical centre). By similar triangles, a span `s` on the sensor, `f` behind the pinhole, is a span `D · s / f` on an object at distance `D` that faces the camera:

```
size = D · √( (Δx · p)² + (Δy · p)² ) / f
D    = size · f / √( (Δx · p)² + (Δy · p)² )
```

| Symbol | Meaning |
|---|---|
| `D` | distance from the camera to the object, along the camera's axis |
| `size` | real-world length of the marked span |
| `Δx, Δy` | the marked span in photo pixels, across and down |
| `p` | size of one photo pixel on the sensor (mm) |
| `f` | focal length (mm) |

The two components are combined with Pythagoras, so a mark at any angle gives its true length, not its projection onto one axis. This is a straight ratio: there is no tangent in it. (Up to 2026-11 the tool used `D · tan(Δx / W · sw / f)`, which is close for short spans but 5 % too large at a quarter of the frame width and 24 % at half.)

## The pixel size `p`

Pixels are square. The sensor's long side lies along the photo's long side whichever way the photo is turned, so portrait photos use the sensor height across their width. A photo cropped to another aspect (16:9 from a 4:3 sensor, or 1:1) still fills the sensor along one side; that side gives the smaller ratio:

```
p = min( sensor long side ÷ photo long side,  sensor short side ÷ photo short side )
```

Without a sensor height, the photo's own aspect stands in for the sensor's.

## Where the camera values come from

In this order of preference:

1. **EXIF focal length.** The lens actually used, at the zoom it was at. It wins over the database's value.
2. **EXIF 35 mm equivalent.** It says how much sensor the photo covers with the lens used: `sensor diagonal = f × 43.27 mm ÷ f₃₅` (43.27 mm is the full-frame diagonal). The camera database holds each phone's **main** camera only. When the EXIF-derived sensor differs from the database entry by more than 6 %, the photo was taken with another lens (ultrawide, telephoto) or a digital zoom, and the EXIF sensor is used instead. A toast says so.
3. **Camera database** ([camera-database.md](camera-database.md)), matched from the EXIF make and model, or picked by hand.
4. **Presets**: typical values for a phone's main, ultrawide and 3× telephoto camera, APS-C and full frame (with the lens focal length typed in).
5. **Unknown camera**: see below.
6. **Typed by hand** (Custom).

The lamps above the inputs show which source is in use: EXIF, DB or Custom.

## Unknown camera

Most photos come from a phone's main camera, between 24 and 35 mm equivalent. With the camera set to **Unknown**, the result is worked out for both, using the photo's diagonal as the 35 mm frame's diagonal:

```
metres per pixel at distance D = D × 43.27 ÷ (f₃₅ × photo diagonal in px),   f₃₅ = 24 … 35
```

The result is a range (`6.1–8.9 m`). In distance mode the ring on the map becomes a band between the near and the far distance.

## Distance mode and the ring

With **Solve for → Distance**, a known size gives the distance from the camera to the object. Click the object on the map (or paste its coordinates, or right-click → *The object is here*): every point that far away is a possible camera position, drawn as a ring. Cross it with another clue, a road, a bearing, a skyline, and the camera's position narrows quickly.

## Limits

- **The object must face the camera.** A surface angled toward or away from the lens is foreshortened, and the tool cannot detect or correct that.
- **D is along the camera's axis.** A distance clicked on the map is along the ground. The two are close for an object near the middle of the photo and at about the camera's height; for one near the edge of a wide-angle photo, or far above or below the camera, the map distance is too long.
- **Lens distortion.** The model assumes a distortion-free lens. Phone main cameras and most lenses above about 24 mm equivalent are well corrected; ultrawides and action cameras outside their linear mode are not.
- **Sensor values.** Database entries are marked *confirmed*, *unconfirmed* or *missing data*; the last ones are estimates from the marketing format.
- **Distance and marking errors scale through.** A 5 % error in `D` is a 5 % error in the size. The optics panel's *1 px @* value is what one pixel of marking error is worth at the distance in play.
