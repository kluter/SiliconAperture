# Camera database

`js/camera-db.js` holds the sensor size and focal length of 960+ devices across 34 brands: phones by their **main** camera, compacts and drones by their fixed lens, interchangeable-lens bodies by their sensor alone (`focal_length: null`; the lens's focal length comes from the photo's EXIF or is typed in).

| Field | Meaning |
|---|---|
| `sensor_w`, `sensor_h` | sensor size in mm, long side first |
| `focal_length` | actual focal length in mm (`null` for interchangeable-lens bodies) |
| `focal_length_eq` | 35 mm equivalent, display only |
| `confidence` | how well the entry is sourced (below) |

Phone focal lengths follow `focal_length = focal_length_eq × sensor diagonal ÷ 43.27` (43.27 mm is the full-frame diagonal). That is the rule the EXIF tag `FocalLengthIn35mmFormat` follows, so a database entry and a photo of that phone agree. Entries whose focal length was read from EXIF keep that value.

## Confidence markers

| Marker | Label in the list | Meaning |
|---|---|---|
| `[✓]` | **confirmed** | Verified from a GSMarena spec page (sensor format + focal length equivalent). `[✓] focal_eq ~` means the sensor was confirmed but the focal equivalent is approximate. |
| `[~]` | **unconfirmed** | Sensor family or optical format is known but not directly verified against a spec page. |
| `[?]` | **missing data** | No source data; values are estimates. |

**How a sensor size is found:** a `[✓]` value is *calculated* from hard data, using either pixel math (`width = pixels across × pixel pitch`) or EXIF (`diagonal = 43.27 × focal ÷ 35 mm-equivalent focal`; some older entries were worked out by width, `36 × focal ÷ equivalent`, which reads a 4:3 sensor about 4 % small). A `[?]` value is *estimated* from the marketing format alone (e.g. "1/2.55-inch"), which isn't a true measurement, so it's only a ballpark.

Some entries carry no marker: interchangeable-lens bodies and high-end fixed-lens cameras and drones (DJI, Sony RX, GoPro…), whose specs are published by the manufacturer.

The presets at the top of the camera list (phone main, ultrawide, telephoto, APS-C, full frame, Unknown) are not in this file: they are typical values, defined in `js/script.js`.

## Contributing

If you shoot with a device in the list and can verify or correct its sensor dimensions or focal length against real EXIF data, a PR or issue is very welcome. Same if your camera is missing entirely.
