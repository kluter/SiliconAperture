/* camera-db.js - sensor dimensions for SiliconAperture
   sensor_w / sensor_h : physical sensor size in mm (main/wide camera for phones & drones)
   focal_length        : actual focal length in mm; null for interchangeable-lens bodies only
                         (EXIF is authoritative: this is the fallback for stripped metadata)
   focal_length_eq     : 35 mm equivalent, display-only reference
   All values from manufacturer spec sheets, DXOMark, and imaging-resource.com.
   Values marked with a trailing comment are approximate / unconfirmed.
   For fixed-lens devices: focal_length = focal_length_eq × sensor_w / 36
   Pixel 7/7a values confirmed against EXIF (focal_length = 6.81 mm). */

const CAMERA_DB = [

  // ── APPLE ────────────────────────────────────────────────────────────────
  { brand:"Apple", label:"iPhone 17 Pro Max",            sensor_w:10.00, sensor_h:7.50,  focal_length:6.67, focal_length_eq:24 }, // 1/1.28", 48MP, f/1.8; GSMarena confirmed
  { brand:"Apple", label:"iPhone 17 Pro",                sensor_w:10.00, sensor_h:7.50,  focal_length:6.67, focal_length_eq:24 }, // 1/1.28", 48MP, f/1.8; GSMarena confirmed
  { brand:"Apple", label:"iPhone Air",                   sensor_w:8.21,  sensor_h:6.15,  focal_length:5.93, focal_length_eq:26 }, // 1/1.56", 48MP, f/1.6; GSMarena confirmed
  { brand:"Apple", label:"iPhone 17",                    sensor_w:8.21,  sensor_h:6.15,  focal_length:5.93, focal_length_eq:26 }, // 1/1.56", 48MP, f/1.6; GSMarena confirmed
  { brand:"Apple", label:"iPhone 17e",                   sensor_w:5.60,  sensor_h:4.20,  focal_length:4.20, focal_length_eq:26 }, // 1/2.55"; focal_length confirmed from EXIF
  { brand:"Apple", label:"iPhone 16 Pro Max",          sensor_w:10.00, sensor_h:7.50,  focal_length:6.67, focal_length_eq:24 }, // 1/1.28"; GSMarena confirmed
  { brand:"Apple", label:"iPhone 16 Pro",              sensor_w:10.00, sensor_h:7.50,  focal_length:6.67, focal_length_eq:24 }, // 1/1.28"; GSMarena confirmed
  { brand:"Apple", label:"iPhone 16 / 16 Plus",        sensor_w:8.21,  sensor_h:6.15,  focal_length:5.93, focal_length_eq:26 }, // 1/1.56"; GSMarena confirmed
  { brand:"Apple", label:"iPhone 16e",                   sensor_w:5.60,  sensor_h:4.20,  focal_length:4.20, focal_length_eq:26 }, // 1/2.55"; GSMarena confirmed; same sensor as 17e
  { brand:"Apple", label:"iPhone 15 Pro Max",          sensor_w:10.00, sensor_h:7.50,  focal_length:6.67, focal_length_eq:24 }, // 1/1.28"; same sensor as 16 Pro Max
  { brand:"Apple", label:"iPhone 15 Pro",              sensor_w:10.00, sensor_h:7.50,  focal_length:6.67, focal_length_eq:24 }, // 1/1.28"; same sensor as 16 Pro
  { brand:"Apple", label:"iPhone 15 / 15 Plus",        sensor_w:8.21,  sensor_h:6.15,  focal_length:5.93, focal_length_eq:26 }, // 1/1.56"; same sensor as 16
  { brand:"Apple", label:"iPhone 14 Pro Max",          sensor_w:10.00, sensor_h:7.50,  focal_length:6.67, focal_length_eq:24 }, // 1/1.28"; first 48MP Pro; same sensor family
  { brand:"Apple", label:"iPhone 14 Pro",              sensor_w:10.00, sensor_h:7.50,  focal_length:6.67, focal_length_eq:24 }, // 1/1.28"; same sensor as 14 Pro Max
  { brand:"Apple", label:"iPhone 14 / 14 Plus",        sensor_w:5.57,  sensor_h:4.18,  focal_length:4.02, focal_length_eq:26 },
  { brand:"Apple", label:"iPhone 13 Pro / Pro Max",    sensor_w:5.76,  sensor_h:4.32,  focal_length:4.16, focal_length_eq:26 },
  { brand:"Apple", label:"iPhone 13 / 13 mini",        sensor_w:5.09,  sensor_h:3.82,  focal_length:3.68, focal_length_eq:26 },
  { brand:"Apple", label:"iPhone 12 Pro Max",          sensor_w:5.57,  sensor_h:4.18,  focal_length:4.02, focal_length_eq:26 },
  { brand:"Apple", label:"iPhone 12 Pro",              sensor_w:5.09,  sensor_h:3.82,  focal_length:3.68, focal_length_eq:26 },
  { brand:"Apple", label:"iPhone 12 / 12 mini",        sensor_w:5.09,  sensor_h:3.82,  focal_length:3.68, focal_length_eq:26 },
  { brand:"Apple", label:"iPhone SE (3rd gen, 2022)",  sensor_w:4.80,  sensor_h:3.60,  focal_length:3.73, focal_length_eq:28 },
  { brand:"Apple", label:"iPhone 11 Pro / Pro Max",    sensor_w:4.55,  sensor_h:3.41,  focal_length:3.29, focal_length_eq:26 },
  { brand:"Apple", label:"iPhone 11",                  sensor_w:4.80,  sensor_h:3.60,  focal_length:3.47, focal_length_eq:26 },
  { brand:"Apple", label:"iPhone SE (2nd gen, 2020)",  sensor_w:4.80,  sensor_h:3.60,  focal_length:3.73, focal_length_eq:28 }, // same camera as iPhone 8
  { brand:"Apple", label:"iPhone XS Max / XS (2018)",  sensor_w:5.64,  sensor_h:4.23,  focal_length:4.07, focal_length_eq:26 }, // Sony IMX363, 1/2.55"
  { brand:"Apple", label:"iPhone XR (2018)",           sensor_w:5.64,  sensor_h:4.23,  focal_length:4.07, focal_length_eq:26 },
  { brand:"Apple", label:"iPhone X (2017)",            sensor_w:4.80,  sensor_h:3.60,  focal_length:3.73, focal_length_eq:28 },
  { brand:"Apple", label:"iPhone 8 / 8 Plus (2017)",  sensor_w:4.80,  sensor_h:3.60,  focal_length:3.73, focal_length_eq:28 },
  { brand:"Apple", label:"iPhone 7 / 7 Plus (2016)",  sensor_w:4.80,  sensor_h:3.60,  focal_length:3.73, focal_length_eq:28 },
  { brand:"Apple", label:"iPhone SE (1st gen, 2016)",  sensor_w:4.80,  sensor_h:3.60,  focal_length:3.87, focal_length_eq:29 }, // same camera as 6s
  { brand:"Apple", label:"iPhone 6s / 6s Plus (2015)", sensor_w:4.80,  sensor_h:3.60,  focal_length:3.87, focal_length_eq:29 },
  { brand:"Apple", label:"iPhone 6 / 6 Plus (2014)",  sensor_w:4.80,  sensor_h:3.60,  focal_length:3.87, focal_length_eq:29 },

  // ── SAMSUNG ──────────────────────────────────────────────────────────────
  { brand:"Samsung", label:"Galaxy S26 Ultra",          sensor_w:9.85,  sensor_h:7.38,  focal_length:6.29, focal_length_eq:23 }, // 1/1.3", 200MP, f/1.4 approx
  { brand:"Samsung", label:"Galaxy S26 / S26+",         sensor_w:8.21,  sensor_h:6.15,  focal_length:5.47, focal_length_eq:24 }, // 1/1.56", 50MP, f/1.8 approx
  { brand:"Samsung", label:"Galaxy S25 Ultra",         sensor_w:9.80,  sensor_h:7.35,  focal_length:6.53, focal_length_eq:24 }, // 1/1.3", 200MP, f/1.7
  { brand:"Samsung", label:"Galaxy S25 / S25+",        sensor_w:8.21,  sensor_h:6.15,  focal_length:5.47, focal_length_eq:24 }, // 1/1.56", 50MP, f/1.8; GSMarena confirmed
  { brand:"Samsung", label:"Galaxy S25 Edge",           sensor_w:9.85,  sensor_h:7.38,  focal_length:6.57, focal_length_eq:24 }, // 1/1.3", 200MP, f/1.7 approx
  { brand:"Samsung", label:"Galaxy S25 FE",            sensor_w:8.15,  sensor_h:6.12,  focal_length:5.43, focal_length_eq:24 }, // 1/1.57", 50MP, f/1.8 approx
  { brand:"Samsung", label:"Galaxy S24 Ultra",         sensor_w:9.80,  sensor_h:7.35,  focal_length:6.26, focal_length_eq:23 },
  { brand:"Samsung", label:"Galaxy S24 / S24+",        sensor_w:8.21,  sensor_h:6.15,  focal_length:5.47, focal_length_eq:24 }, // 1/1.56", 50MP; same GN9 sensor as S25
  { brand:"Samsung", label:"Galaxy S23 Ultra",         sensor_w:8.38,  sensor_h:6.29,  focal_length:5.35, focal_length_eq:23 }, // 1/1.14" approx
  { brand:"Samsung", label:"Galaxy S23 / S23+",        sensor_w:5.76,  sensor_h:4.32,  focal_length:3.84, focal_length_eq:24 },
  { brand:"Samsung", label:"Galaxy S22 Ultra",         sensor_w:7.81,  sensor_h:5.86,  focal_length:4.99, focal_length_eq:23 },
  { brand:"Samsung", label:"Galaxy S22 / S22+",        sensor_w:5.57,  sensor_h:4.18,  focal_length:3.71, focal_length_eq:24 },
  { brand:"Samsung", label:"Galaxy Z Fold 6 (main)",   sensor_w:7.02,  sensor_h:5.27,  focal_length:4.68, focal_length_eq:24 },
  { brand:"Samsung", label:"Galaxy Z Fold7 (main)",     sensor_w:9.85,  sensor_h:7.38,  focal_length:6.57, focal_length_eq:24 }, // 1/1.3", 200MP, f/1.7 approx
  { brand:"Samsung", label:"Galaxy Z TriFold (main)",   sensor_w:9.85,  sensor_h:7.38,  focal_length:6.57, focal_length_eq:24 }, // 1/1.3", 200MP, f/1.7 approx
  { brand:"Samsung", label:"Galaxy Z Flip7",            sensor_w:8.15,  sensor_h:6.12,  focal_length:5.21, focal_length_eq:23 }, // 1/1.57", 50MP, f/1.8
  { brand:"Samsung", label:"Galaxy Z Flip7 FE",         sensor_w:8.15,  sensor_h:6.12,  focal_length:5.21, focal_length_eq:23 }, // 1/1.57", 50MP, f/1.8
  { brand:"Samsung", label:"Galaxy A55 / A54",         sensor_w:5.57,  sensor_h:4.18,  focal_length:4.02, focal_length_eq:26 },
  { brand:"Samsung", label:"Galaxy A57 5G",             sensor_w:8.21,  sensor_h:6.15,  focal_length:5.93, focal_length_eq:26 }, // 1/1.56", 50MP, f/1.8; focal_eq approx
  { brand:"Samsung", label:"Galaxy A56",               sensor_w:8.21,  sensor_h:6.15,  focal_length:5.93, focal_length_eq:26 }, // 1/1.56", 50MP, f/1.8; focal_eq approx
  { brand:"Samsung", label:"Galaxy A37 5G",             sensor_w:8.21,  sensor_h:6.15,  focal_length:5.93, focal_length_eq:26 }, // 1/1.56", 50MP, f/1.8; focal_eq approx
  { brand:"Samsung", label:"Galaxy A36",               sensor_w:6.53,  sensor_h:4.90,  focal_length:4.72, focal_length_eq:26 }, // 1/1.96", 50MP, f/1.8; focal_eq approx
  { brand:"Samsung", label:"Galaxy M36 5G",             sensor_w:6.53,  sensor_h:4.90,  focal_length:4.72, focal_length_eq:26 }, // 1/1.96", 50MP, f/1.8; focal_eq approx
  { brand:"Samsung", label:"Galaxy F36 5G",             sensor_w:6.53,  sensor_h:4.90,  focal_length:4.72, focal_length_eq:26 }, // 1/1.96", 50MP, f/1.8; focal_eq approx
  { brand:"Samsung", label:"Galaxy S21 Ultra (2021)",  sensor_w:9.60,  sensor_h:7.20,  focal_length:6.40, focal_length_eq:24 }, // Samsung HM3 108MP, 1/1.33" approx
  { brand:"Samsung", label:"Galaxy S21 / S21+ (2021)", sensor_w:5.21,  sensor_h:3.91,  focal_length:3.76, focal_length_eq:26 }, // Sony IMX555, 1/1.76" approx
  { brand:"Samsung", label:"Galaxy S20 Ultra (2020)",  sensor_w:9.60,  sensor_h:7.20,  focal_length:6.40, focal_length_eq:24 }, // Samsung HMX 108MP, 1/1.33" approx
  { brand:"Samsung", label:"Galaxy S20 / S20+ (2020)", sensor_w:5.21,  sensor_h:3.91,  focal_length:3.76, focal_length_eq:26 }, // 12MP, 1/1.76" approx
  { brand:"Samsung", label:"Galaxy S10 / S10+ (2019)", sensor_w:5.64,  sensor_h:4.23,  focal_length:4.07, focal_length_eq:26 }, // 12MP, 1/2.55"
  { brand:"Samsung", label:"Galaxy S9 / S9+ (2018)",   sensor_w:5.64,  sensor_h:4.23,  focal_length:4.07, focal_length_eq:26 }, // 12MP dual-aperture, 1/2.55"
  { brand:"Samsung", label:"Galaxy S8 / S8+ (2017)",   sensor_w:5.64,  sensor_h:4.23,  focal_length:4.07, focal_length_eq:26 }, // 12MP, 1/2.55"
  { brand:"Samsung", label:"Galaxy A26",                sensor_w:4.64,  sensor_h:3.48,  focal_length:3.48, focal_length_eq:27 }, // 1/2.76", 50MP, f/1.8, 27mm; GSMarena confirmed
  { brand:"Samsung", label:"Galaxy A16",                sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26 }, // 1/2.76", 50MP, f/1.8; focal_eq approx
  { brand:"Samsung", label:"Galaxy M16",                sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26 }, // 1/2.76", 50MP, f/1.8; focal_eq approx
  { brand:"Samsung", label:"Galaxy A06 5G",             sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26 }, // 1/2.75", 50MP, f/1.8, 26mm; GSMarena confirmed
  { brand:"Samsung", label:"Galaxy A27 5G",             sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26 }, // 1/2.76", 50MP, 0.64µm, f/1.8; focal_eq approx
  { brand:"Samsung", label:"Galaxy A17",                sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26 }, // 1/2.76", 50MP, f/1.8; focal_eq approx
  { brand:"Samsung", label:"Galaxy A17 5G",             sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26 }, // 1/2.76", 50MP, f/1.8; focal_eq approx
  { brand:"Samsung", label:"Galaxy A07",                sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26 }, // 1/2.76", 50MP, f/1.8; focal_eq approx
  { brand:"Samsung", label:"Galaxy M17 5G",             sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26 }, // 1/2.76", 50MP, f/1.8; focal_eq approx
  { brand:"Samsung", label:"Galaxy F07",                sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26 }, // 1/2.76", 50MP, f/1.8; focal_eq approx
  { brand:"Samsung", label:"Galaxy M07",                sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26 }, // 1/2.76", 50MP, f/1.8; focal_eq approx
  { brand:"Samsung", label:"Galaxy F17 5G",             sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26 }, // 1/2.76", 50MP, f/1.8; focal_eq approx
  { brand:"Samsung", label:"Galaxy F16",                sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26 }, // 1/2.76", 50MP, f/1.8; focal_eq approx
  { brand:"Samsung", label:"Galaxy XCover7 Pro",        sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26 }, // 1/2.76", 50MP, f/1.8; focal_eq approx
  { brand:"Samsung", label:"Galaxy Tab S11 Ultra",      sensor_w:3.77,  sensor_h:2.82,  focal_length:2.72, focal_length_eq:26 }, // tablet; 1/3.4", 13MP, f/2.0
  { brand:"Samsung", label:"Galaxy Tab S11",            sensor_w:3.77,  sensor_h:2.82,  focal_length:2.72, focal_length_eq:26 }, // tablet; 1/3.4", 13MP, f/2.0

  // ── GOOGLE ───────────────────────────────────────────────────────────────
  // GN1/GN9 sensor family (50 MP, 1/1.31", 1.2 µm, 25mm): EXIF confirmed on Pixel 7 → 9.78 mm; Pixel 9+ pixel math → 9.80 mm
  { brand:"Google", label:"Pixel 10 Pro XL / 10 Pro",  sensor_w:9.80,  sensor_h:7.35,  focal_length:6.81, focal_length_eq:25 }, // 1/1.31", 50MP, f/1.7; GSMarena confirmed
  { brand:"Google", label:"Pixel 10",                  sensor_w:6.40,  sensor_h:4.80,  focal_length:4.44, focal_length_eq:25 }, // 1/2.0", 48MP, f/1.7; GSMarena confirmed
  { brand:"Google", label:"Pixel 10a",                 sensor_w:6.40,  sensor_h:4.80,  focal_length:4.44, focal_length_eq:25 }, // 1/2.0", 48MP, f/1.7; GSMarena confirmed
  { brand:"Google", label:"Pixel 9 Pro / 9 Pro XL",    sensor_w:9.80,  sensor_h:7.35,  focal_length:6.81, focal_length_eq:25 }, // 1/1.31", 50MP, f/1.7; GSMarena confirmed
  { brand:"Google", label:"Pixel 9",                   sensor_w:9.80,  sensor_h:7.35,  focal_length:6.81, focal_length_eq:25 }, // 1/1.31", 50MP, f/1.7; GSMarena confirmed
  { brand:"Google", label:"Pixel 9 Pro Fold",          sensor_w:6.40,  sensor_h:4.80,  focal_length:4.44, focal_length_eq:25 }, // 1/2.0", 48MP, f/1.7; GSMarena confirmed
  { brand:"Google", label:"Pixel 9a",                  sensor_w:6.40,  sensor_h:4.80,  focal_length:4.44, focal_length_eq:25 }, // 1/2.0", 48MP, f/1.7; GSMarena confirmed
  { brand:"Google", label:"Pixel 8 Pro",               sensor_w:9.80,  sensor_h:7.35,  focal_length:6.81, focal_length_eq:25 }, // 1/1.31", 50MP, f/1.7; GSMarena confirmed
  { brand:"Google", label:"Pixel 8",                   sensor_w:9.80,  sensor_h:7.35,  focal_length:6.81, focal_length_eq:25 }, // 1/1.31", 50MP, f/1.7; GSMarena confirmed
  { brand:"Google", label:"Pixel 8a",                  sensor_w:7.40,  sensor_h:5.55,  focal_length:5.34, focal_length_eq:26 }, // 1/1.73", 64MP, f/1.9; GSMarena confirmed
  { brand:"Google", label:"Pixel Fold (2023)",         sensor_w:6.40,  sensor_h:4.80,  focal_length:4.44, focal_length_eq:25 }, // 1/2.0", 48MP, f/1.7; GSMarena confirmed; same sensor as Pixel 9 Pro Fold
  { brand:"Google", label:"Pixel Tablet (2023)",       sensor_w:3.66,  sensor_h:2.74,  focal_length:2.44, focal_length_eq:24 }, // 1/4.0", 8MP, f/2.0; GSMarena confirmed; sensor_w from pixel math
  { brand:"Google", label:"Pixel 7 Pro",               sensor_w:9.78,  sensor_h:7.34,  focal_length:6.81, focal_length_eq:25 }, // 1/1.31", 50MP, f/1.9; GSMarena confirmed
  { brand:"Google", label:"Pixel 7",                   sensor_w:9.78,  sensor_h:7.34,  focal_length:6.81, focal_length_eq:25 }, // 1/1.31", 50MP; EXIF-confirmed
  { brand:"Google", label:"Pixel 7a",                  sensor_w:7.40,  sensor_h:5.55,  focal_length:5.34, focal_length_eq:26 }, // 1/1.73", 64MP, f/1.9; GSMarena confirmed; same sensor as Pixel 8a
  { brand:"Google", label:"Pixel 6 Pro",               sensor_w:9.78,  sensor_h:7.34,  focal_length:6.81, focal_length_eq:25 }, // 1/1.31", 50MP, f/1.9; GSMarena confirmed
  { brand:"Google", label:"Pixel 6",                   sensor_w:9.78,  sensor_h:7.34,  focal_length:6.81, focal_length_eq:25 }, // 1/1.31", GN1; same sensor family as 6 Pro
  { brand:"Google", label:"Pixel 6a",                  sensor_w:5.64,  sensor_h:4.23,  focal_length:4.23, focal_length_eq:27 }, // 1/2.55", 12.2MP, f/1.7; GSMarena confirmed; same sensor as Pixel 5 family
  { brand:"Google", label:"Pixel 5a (2021)",           sensor_w:5.64,  sensor_h:4.23,  focal_length:4.23, focal_length_eq:27 }, // Sony IMX363, 1/2.55"
  { brand:"Google", label:"Pixel 5 (2020)",            sensor_w:5.64,  sensor_h:4.23,  focal_length:4.23, focal_length_eq:27 }, // Sony IMX363, 1/2.55"
  { brand:"Google", label:"Pixel 4a / 4a 5G (2020)",  sensor_w:5.64,  sensor_h:4.23,  focal_length:4.23, focal_length_eq:27 }, // Sony IMX363, 1/2.55"
  { brand:"Google", label:"Pixel 4 / 4 XL (2019)",    sensor_w:5.64,  sensor_h:4.23,  focal_length:4.23, focal_length_eq:27 }, // Sony IMX363, 1/2.55"; GSMarena confirmed 27mm
  { brand:"Google", label:"Pixel 3a / 3a XL (2019)",  sensor_w:5.64,  sensor_h:4.23,  focal_length:4.40, focal_length_eq:28 }, // Sony IMX363
  { brand:"Google", label:"Pixel 3 / 3 XL (2018)",    sensor_w:5.64,  sensor_h:4.23,  focal_length:4.40, focal_length_eq:28 }, // Sony IMX363
  { brand:"Google", label:"Pixel 2 / 2 XL (2017)",    sensor_w:5.64,  sensor_h:4.23,  focal_length:4.23, focal_length_eq:27 }, // Sony IMX362, 1/2.55"; GSMarena confirmed 27mm
  { brand:"Google", label:"Pixel / Pixel XL (2016)",   sensor_w:6.23,  sensor_h:4.67,  focal_length:4.67, focal_length_eq:27 }, // Sony IMX378, 1/2.3"

  // ── ONEPLUS ──────────────────────────────────────────────────────────────
  { brand:"OnePlus", label:"OnePlus 13 (main)",         sensor_w:9.80,  sensor_h:7.35,  focal_length:6.26, focal_length_eq:23 }, // 1/1.12"
  { brand:"OnePlus", label:"OnePlus 12 (main)",         sensor_w:9.80,  sensor_h:7.35,  focal_length:6.26, focal_length_eq:23 },
  { brand:"OnePlus", label:"OnePlus 11 (2023)",         sensor_w:5.57,  sensor_h:4.18,  focal_length:3.71, focal_length_eq:24 }, // Sony IMX890, 1/1.56"
  { brand:"OnePlus", label:"OnePlus 10 Pro (2022)",     sensor_w:8.96,  sensor_h:6.72,  focal_length:5.72, focal_length_eq:23 }, // Sony IMX789, 1/1.43" approx
  { brand:"OnePlus", label:"OnePlus 9 Pro (2021)",      sensor_w:8.96,  sensor_h:6.72,  focal_length:5.72, focal_length_eq:23 }, // Sony IMX789, 1/1.43" approx
  { brand:"OnePlus", label:"OnePlus 9 (2021)",          sensor_w:5.57,  sensor_h:4.18,  focal_length:3.56, focal_length_eq:23 }, // Sony IMX766, 1/1.56"
  { brand:"OnePlus", label:"OnePlus 8T / 8 (2020)",     sensor_w:6.40,  sensor_h:4.80,  focal_length:4.27, focal_length_eq:24 }, // Sony IMX586, 1/2"
  { brand:"OnePlus", label:"OnePlus 7 Pro / 7T (2019)", sensor_w:6.40,  sensor_h:4.80,  focal_length:4.62, focal_length_eq:26 }, // Sony IMX586, 1/2"
  { brand:"OnePlus", label:"OnePlus 7 (2019)",          sensor_w:5.64,  sensor_h:4.23,  focal_length:4.07, focal_length_eq:26 }, // Sony IMX519, 1/2.55" approx
  { brand:"OnePlus", label:"OnePlus 6 / 6T (2018)",     sensor_w:4.80,  sensor_h:3.60,  focal_length:3.47, focal_length_eq:26 }, // Sony IMX519, 1/3" approx
  { brand:"OnePlus", label:"OnePlus 5 / 5T (2017)",     sensor_w:4.80,  sensor_h:3.60,  focal_length:3.47, focal_length_eq:26 }, // Sony IMX398, approx
  { brand:"OnePlus", label:"OnePlus 3 / 3T (2016)",     sensor_w:4.80,  sensor_h:3.60,  focal_length:3.47, focal_length_eq:26 }, // Sony IMX298, approx
  { brand:"OnePlus", label:"OnePlus 2 (2015)",          sensor_w:4.54,  sensor_h:3.42,  focal_length:3.41, focal_length_eq:27 }, // Sony IMX214 approx
  { brand:"OnePlus", label:"OnePlus 1 (2014)",          sensor_w:4.54,  sensor_h:3.42,  focal_length:3.53, focal_length_eq:28 }, // Sony IMX214 approx

  // ── XIAOMI ───────────────────────────────────────────────────────────────
  { brand:"Xiaomi", label:"Xiaomi 15 Ultra (main)",     sensor_w:9.80,  sensor_h:7.35,  focal_length:6.26, focal_length_eq:23 }, // approx
  { brand:"Xiaomi", label:"Xiaomi 15 (main)",           sensor_w:7.02,  sensor_h:5.27,  focal_length:4.68, focal_length_eq:24 },
  { brand:"Xiaomi", label:"Xiaomi 14 Ultra (main)",     sensor_w:9.80,  sensor_h:7.35,  focal_length:6.26, focal_length_eq:23 }, // 1" equiv
  { brand:"Xiaomi", label:"Xiaomi 14 (main)",           sensor_w:7.02,  sensor_h:5.27,  focal_length:4.68, focal_length_eq:24 },
  { brand:"Xiaomi", label:"Xiaomi 13 Ultra (2023)",    sensor_w:13.2,  sensor_h:8.80,  focal_length:8.43, focal_length_eq:23 }, // Sony IMX989, 1"
  { brand:"Xiaomi", label:"Xiaomi 13 (2023)",          sensor_w:8.60,  sensor_h:6.45,  focal_length:5.73, focal_length_eq:24 }, // Sony IMX800, 1/1.49" approx
  { brand:"Xiaomi", label:"Xiaomi 12 Pro (2022)",      sensor_w:7.02,  sensor_h:5.27,  focal_length:4.49, focal_length_eq:23 }, // Samsung GN5, 1/1.28"
  { brand:"Xiaomi", label:"Xiaomi 12 (2022)",          sensor_w:5.57,  sensor_h:4.18,  focal_length:3.71, focal_length_eq:24 }, // Sony IMX766, 1/1.56"
  { brand:"Xiaomi", label:"Xiaomi 11 (2021)",          sensor_w:9.15,  sensor_h:6.86,  focal_length:6.61, focal_length_eq:26 }, // Samsung HM2 108MP, 1/1.33"
  { brand:"Xiaomi", label:"Mi 10 Pro (2020)",          sensor_w:9.15,  sensor_h:6.86,  focal_length:6.61, focal_length_eq:26 }, // Samsung HMX 108MP, 1/1.33"
  { brand:"Xiaomi", label:"Mi 9 (2019)",               sensor_w:6.40,  sensor_h:4.80,  focal_length:4.80, focal_length_eq:27 }, // Sony IMX586, 1/2"
  { brand:"Xiaomi", label:"Mi 8 (2018)",               sensor_w:5.64,  sensor_h:4.23,  focal_length:4.07, focal_length_eq:26 }, // Sony IMX363, 1/2.55"
  { brand:"Xiaomi", label:"Mi 6 (2017)",               sensor_w:4.80,  sensor_h:3.60,  focal_length:3.60, focal_length_eq:27 }, // Sony IMX386, 1/3" approx

  // ── DJI (DRONES) ─────────────────────────────────────────────────────────
  { brand:"DJI", label:"Inspire 3 / Zenmuse X9-8K (full frame)", sensor_w:35.9, sensor_h:23.9, focal_length:null, focal_length_eq:null },
  // Mavic 3 Pro / 3 / 3 Classic: Hasselblad 4/3" = standard MFT 17.3 × 13.0 mm
  { brand:"DJI", label:"Mavic 3 Pro — main (4/3\")",   sensor_w:17.3,  sensor_h:13.0,  focal_length:11.5, focal_length_eq:24 },
  { brand:"DJI", label:"Mavic 3 / 3 Classic (4/3\")",  sensor_w:17.3,  sensor_h:13.0,  focal_length:11.5, focal_length_eq:24 },
  // Air 3 / Mini series: 1/1.3" CMOS; fl derived from eq and sensor size (sensor_w = fl × 36/eq)
  { brand:"DJI", label:"Air 3 — main (1/1.3\")",       sensor_w:9.15,  sensor_h:6.86,  focal_length:6.1,  focal_length_eq:24 },
  { brand:"DJI", label:"Mini 4 Pro (1/1.3\")",         sensor_w:9.15,  sensor_h:6.86,  focal_length:6.1,  focal_length_eq:24 },
  { brand:"DJI", label:"Mini 3 Pro (1/1.3\")",         sensor_w:9.15,  sensor_h:6.86,  focal_length:6.1,  focal_length_eq:24 },
  { brand:"DJI", label:"Mini 3 (1/1.3\")",             sensor_w:9.15,  sensor_h:6.86,  focal_length:6.1,  focal_length_eq:24 },
  { brand:"DJI", label:"Avata 2 (1/1.3\")",            sensor_w:9.15,  sensor_h:6.86,  focal_length:3.81, focal_length_eq:15 },
  { brand:"DJI", label:"Phantom 4 Pro V2 (1\")",       sensor_w:13.2,  sensor_h:8.80,  focal_length:8.8,  focal_length_eq:24 },
  { brand:"DJI", label:"Zenmuse X7 (APS-C)",           sensor_w:23.5,  sensor_h:15.6,  focal_length:null, focal_length_eq:null },

  // ── SONY ─────────────────────────────────────────────────────────────────
  { brand:"Sony", label:"A1 / A9 III (full frame)",     sensor_w:35.9,  sensor_h:23.9,  focal_length:null, focal_length_eq:null },
  { brand:"Sony", label:"A7R V (full frame)",           sensor_w:35.9,  sensor_h:23.9,  focal_length:null, focal_length_eq:null },
  { brand:"Sony", label:"A7 IV (full frame)",           sensor_w:35.9,  sensor_h:23.9,  focal_length:null, focal_length_eq:null },
  { brand:"Sony", label:"A7C II (full frame)",          sensor_w:35.9,  sensor_h:23.9,  focal_length:null, focal_length_eq:null },
  { brand:"Sony", label:"A7S III (full frame)",         sensor_w:35.9,  sensor_h:23.9,  focal_length:null, focal_length_eq:null },
  { brand:"Sony", label:"A6700 (APS-C)",                sensor_w:23.5,  sensor_h:15.6,  focal_length:null, focal_length_eq:null },
  { brand:"Sony", label:"A6400 / A6600 (APS-C)",        sensor_w:23.5,  sensor_h:15.6,  focal_length:null, focal_length_eq:null },
  { brand:"Sony", label:"ZV-E10 II / ZV-E10 (APS-C)",  sensor_w:23.5,  sensor_h:15.6,  focal_length:null, focal_length_eq:null },
  { brand:"Sony", label:"ZV-E1 (full frame)",           sensor_w:35.9,  sensor_h:23.9,  focal_length:null, focal_length_eq:null },
  { brand:"Sony", label:"RX100 VII (1\")",               sensor_w:13.2,  sensor_h:8.80,  focal_length:8.8,  focal_length_eq:24 },
  { brand:"Sony", label:"RX10 IV (1\")",                 sensor_w:13.2,  sensor_h:8.80,  focal_length:8.8,  focal_length_eq:24 },
  // RX0 II: published physical fl = 7.7 mm; effective imaging width = 7.7 × 36/24 = 11.55 mm (not full 1" width)
  { brand:"Sony", label:"RX0 II (1\")",                  sensor_w:11.55, sensor_h:8.66,  focal_length:7.7,  focal_length_eq:24 },

  // ── CANON ────────────────────────────────────────────────────────────────
  { brand:"Canon", label:"EOS R5 / R5 C (full frame)",   sensor_w:35.9,  sensor_h:23.9,  focal_length:null, focal_length_eq:null },
  { brand:"Canon", label:"EOS R6 Mark II (full frame)",   sensor_w:35.9,  sensor_h:23.9,  focal_length:null, focal_length_eq:null },
  { brand:"Canon", label:"EOS R3 (full frame)",           sensor_w:35.9,  sensor_h:23.9,  focal_length:null, focal_length_eq:null },
  { brand:"Canon", label:"EOS R8 (full frame)",           sensor_w:35.9,  sensor_h:23.9,  focal_length:null, focal_length_eq:null },
  { brand:"Canon", label:"EOS R7 (APS-C)",                sensor_w:22.3,  sensor_h:14.9,  focal_length:null, focal_length_eq:null },
  { brand:"Canon", label:"EOS R10 / R50 (APS-C)",         sensor_w:22.3,  sensor_h:14.9,  focal_length:null, focal_length_eq:null },
  { brand:"Canon", label:"EOS 5D Mark IV (full frame)",   sensor_w:35.9,  sensor_h:23.9,  focal_length:null, focal_length_eq:null },
  { brand:"Canon", label:"EOS 90D (APS-C)",               sensor_w:22.3,  sensor_h:14.9,  focal_length:null, focal_length_eq:null },
  { brand:"Canon", label:"PowerShot G7X Mark III (1\")",  sensor_w:13.2,  sensor_h:8.80,  focal_length:8.8,  focal_length_eq:24 },
  { brand:"Canon", label:"PowerShot G5X Mark II (1\")",   sensor_w:13.2,  sensor_h:8.80,  focal_length:8.8,  focal_length_eq:24 },

  // ── NIKON ────────────────────────────────────────────────────────────────
  { brand:"Nikon", label:"Z9 / Z8 (full frame)",          sensor_w:35.9,  sensor_h:23.9,  focal_length:null, focal_length_eq:null },
  { brand:"Nikon", label:"Z7 II (full frame)",             sensor_w:35.9,  sensor_h:23.9,  focal_length:null, focal_length_eq:null },
  { brand:"Nikon", label:"Z6 III (full frame)",            sensor_w:35.9,  sensor_h:23.9,  focal_length:null, focal_length_eq:null },
  { brand:"Nikon", label:"Z5 II (full frame)",             sensor_w:35.9,  sensor_h:23.9,  focal_length:null, focal_length_eq:null },
  { brand:"Nikon", label:"Zfc / Z50 / Z30 (APS-C)",       sensor_w:23.5,  sensor_h:15.6,  focal_length:null, focal_length_eq:null },
  { brand:"Nikon", label:"D850 (full frame, DSLR)",        sensor_w:35.9,  sensor_h:23.9,  focal_length:null, focal_length_eq:null },
  { brand:"Nikon", label:"D7500 (APS-C, DSLR)",           sensor_w:23.5,  sensor_h:15.6,  focal_length:null, focal_length_eq:null },
  // COOLPIX P950: published physical fl = 4.3 mm at wide end; sensor_w = 4.3 × 36/24 = 6.45 mm
  { brand:"Nikon", label:"COOLPIX P950 (1/2.3\")",         sensor_w:6.45,  sensor_h:4.84,  focal_length:4.3,  focal_length_eq:24 },

  // ── FUJIFILM ─────────────────────────────────────────────────────────────
  { brand:"Fujifilm", label:"GFX 100S II / 100 II (medium format)", sensor_w:43.8, sensor_h:32.9, focal_length:null, focal_length_eq:null },
  { brand:"Fujifilm", label:"GFX 50S II (medium format)",           sensor_w:43.8, sensor_h:32.9, focal_length:null, focal_length_eq:null },
  { brand:"Fujifilm", label:"X-H2 / X-H2S (APS-C)",                sensor_w:23.5, sensor_h:15.6, focal_length:null, focal_length_eq:null },
  { brand:"Fujifilm", label:"X-T5 / X-T4 (APS-C)",                 sensor_w:23.5, sensor_h:15.6, focal_length:null, focal_length_eq:null },
  { brand:"Fujifilm", label:"X-S20 / X-S10 (APS-C)",               sensor_w:23.5, sensor_h:15.6, focal_length:null, focal_length_eq:null },
  { brand:"Fujifilm", label:"X100VI / X100V (APS-C)",               sensor_w:23.5, sensor_h:15.6, focal_length:23.0, focal_length_eq:35 },
  { brand:"Fujifilm", label:"X-E4 (APS-C)",                         sensor_w:23.5, sensor_h:15.6, focal_length:null, focal_length_eq:null },

  // ── PANASONIC ────────────────────────────────────────────────────────────
  { brand:"Panasonic", label:"S5 II / S1 / S1R (full frame)",  sensor_w:35.6, sensor_h:23.8, focal_length:null, focal_length_eq:null },
  { brand:"Panasonic", label:"G9 II / GH6 / GH5 II (MFT)",    sensor_w:17.3, sensor_h:13.0, focal_length:null, focal_length_eq:null },
  { brand:"Panasonic", label:"G100 / G95 (MFT)",               sensor_w:17.3, sensor_h:13.0, focal_length:null, focal_length_eq:null },
  // LX100 II: multi-aspect 4/3" sensor; active width at 24mm eq = fl × 36/eq = 10.9 × 36/24 = 16.35 mm
  { brand:"Panasonic", label:"LX100 II (MFT crop)",            sensor_w:16.35, sensor_h:12.26, focal_length:10.9, focal_length_eq:24 },
  // FZ1000 II: 1" sensor; fl = 25 × 13.2/36 = 9.17 mm
  { brand:"Panasonic", label:"FZ1000 II (1\")",                 sensor_w:13.2, sensor_h:8.80, focal_length:9.17, focal_length_eq:25 },

  // ── OM SYSTEM / OLYMPUS ──────────────────────────────────────────────────
  { brand:"OM System", label:"OM-1 Mark II / OM-5 (MFT)",     sensor_w:17.3, sensor_h:13.0, focal_length:null, focal_length_eq:null },
  { brand:"OM System", label:"OM-1 (MFT)",                     sensor_w:17.3, sensor_h:13.0, focal_length:null, focal_length_eq:null },
  { brand:"OM System", label:"E-M10 Mark IV (MFT)",            sensor_w:17.3, sensor_h:13.0, focal_length:null, focal_length_eq:null },

  // ── GOPRO ────────────────────────────────────────────────────────────────
  // Linear mode values — distortion-corrected; fl = eq × sensor_w / 36
  { brand:"GoPro", label:"Hero 13 Black (linear, no distortion)", sensor_w:6.17, sensor_h:4.55, focal_length:2.74, focal_length_eq:16 },
  { brand:"GoPro", label:"Hero 12 Black (linear)",                sensor_w:6.17, sensor_h:4.55, focal_length:2.74, focal_length_eq:16 },
  { brand:"GoPro", label:"Hero 11 Black (linear)",                sensor_w:6.17, sensor_h:4.55, focal_length:2.74, focal_length_eq:16 },
  { brand:"GoPro", label:"Hero 10 / 9 Black (linear)",            sensor_w:5.76, sensor_h:4.32, focal_length:2.56, focal_length_eq:16 },
  { brand:"GoPro", label:"Max (hero mode, linear)",               sensor_w:6.17, sensor_h:4.55, focal_length:2.74, focal_length_eq:16 },

  // ── MEDIUM FORMAT ────────────────────────────────────────────────────────
  { brand:"Hasselblad", label:"X2D 100C (medium format)",    sensor_w:43.8, sensor_h:32.9, focal_length:null, focal_length_eq:null },
  { brand:"Hasselblad", label:"907X / CFV 100C (medium format)", sensor_w:43.8, sensor_h:32.9, focal_length:null, focal_length_eq:null },
  { brand:"Phase One",  label:"IQ4 150MP (645 medium format)", sensor_w:53.4, sensor_h:40.0, focal_length:null, focal_length_eq:null },
  { brand:"Phase One",  label:"IQ4 100MP (645 medium format)", sensor_w:53.4, sensor_h:40.0, focal_length:null, focal_length_eq:null },

  // ── LEGACY / ARCHIVE ─────────────────────────────────────────────────────
  // focal_length values from EXIF where confirmed; otherwise fl = focal_length_eq × sensor_w / 36
  // Entries marked // approx use estimated sensor sizes for the optical format.

  // Apple — pre-2014
  { brand:"Apple", label:"iPhone 5s (2013)",            sensor_w:4.54,  sensor_h:3.42,  focal_length:3.66, focal_length_eq:29 }, // 8MP, 1/3.2"
  { brand:"Apple", label:"iPhone 5 / 5c (2012)",        sensor_w:4.54,  sensor_h:3.42,  focal_length:4.16, focal_length_eq:33 }, // 8MP, 1/3.2", f/2.4
  { brand:"Apple", label:"iPhone 4S (2011)",            sensor_w:4.54,  sensor_h:3.42,  focal_length:4.41, focal_length_eq:35 }, // 8MP, 1/3.2"
  { brand:"Apple", label:"iPhone 4 (2010)",             sensor_w:4.54,  sensor_h:3.42,  focal_length:4.41, focal_length_eq:35 }, // 5MP, 1/3.2"

  // Samsung — pre-2017 flagships
  { brand:"Samsung", label:"Galaxy S7 / S7 Edge (2016)", sensor_w:5.54, sensor_h:4.16,  focal_length:4.00, focal_length_eq:26 }, // 12MP, 1/2.6", dual-pixel
  { brand:"Samsung", label:"Galaxy S6 / S6 Edge (2015)", sensor_w:5.54, sensor_h:4.16,  focal_length:4.31, focal_length_eq:28 }, // 16MP, 1/2.6", f/1.9
  { brand:"Samsung", label:"Galaxy S5 (2014)",           sensor_w:5.54, sensor_h:4.16,  focal_length:4.77, focal_length_eq:31 }, // 16MP, 1/2.6"
  { brand:"Samsung", label:"Galaxy S4 (2013)",           sensor_w:4.88, sensor_h:3.66,  focal_length:4.20, focal_length_eq:31 }, // 13MP, 1/3.1", 1.14µm, 31mm confirmed
  { brand:"Samsung", label:"Galaxy S3 (2012)",           sensor_w:4.54, sensor_h:3.42,  focal_length:4.41, focal_length_eq:35 }, // 8MP, 1/3.2" approx
  { brand:"Samsung", label:"Galaxy S2 (2011)",           sensor_w:4.54, sensor_h:3.42,  focal_length:3.66, focal_length_eq:29 }, // 8MP, 1/3.2", f/2.65 approx
  { brand:"Samsung", label:"Galaxy S (2010)",            sensor_w:4.54, sensor_h:3.42,  focal_length:4.41, focal_length_eq:35 }, // 5MP, 1/3.2" approx

  // Google Nexus
  { brand:"Google",  label:"Nexus 6P (2015)",            sensor_w:6.23, sensor_h:4.67,  focal_length:4.67, focal_length_eq:27 }, // Sony IMX377, 1/2.3"
  { brand:"Google",  label:"Nexus 5X (2015)",            sensor_w:6.23, sensor_h:4.67,  focal_length:4.67, focal_length_eq:27 }, // Sony IMX377, 1/2.3"

  // HTC
  { brand:"HTC",     label:"One M9 (2015)",              sensor_w:5.54, sensor_h:4.16,  focal_length:4.31, focal_length_eq:28 }, // 20MP, 1/2.6" approx
  { brand:"HTC",     label:"One M8 (2014)",              sensor_w:5.29, sensor_h:3.97,  focal_length:3.82, focal_length_eq:26 }, // 4MP UltraPixel, 2.0µm
  { brand:"HTC",     label:"One M7 (2013)",              sensor_w:5.29, sensor_h:3.97,  focal_length:3.82, focal_length_eq:26 }, // 4MP UltraPixel, 2.0µm
  { brand:"HTC",     label:"One X (2012)",               sensor_w:4.54, sensor_h:3.42,  focal_length:3.53, focal_length_eq:28 }, // 8MP, 1/3.2", f/2.0
  { brand:"HTC",     label:"Sensation (2011)",           sensor_w:5.54, sensor_h:4.16,  focal_length:4.31, focal_length_eq:28 }, // 8MP, eq approx
  { brand:"HTC",     label:"Desire HD (2010)",           sensor_w:4.54, sensor_h:3.42,  focal_length:3.53, focal_length_eq:28 }, // 8MP, 1/3.2" approx
  { brand:"HTC",     label:"Desire (2010)",              sensor_w:4.54, sensor_h:3.42,  focal_length:4.41, focal_length_eq:35 }, // 5MP, 1/3.2" approx

  // Nokia / Lumia
  { brand:"Nokia",   label:"Nokia 8 / 8.1 (2017/2018)",  sensor_w:5.54, sensor_h:4.16,  focal_length:4.00, focal_length_eq:26 }, // 13MP Carl Zeiss, 1/2.6" approx
  { brand:"Nokia",   label:"Nokia 6.1 (2018)",            sensor_w:4.59, sensor_h:3.44,  focal_length:3.57, focal_length_eq:28 }, // 16MP, 1/2.8", EXIF confirmed
  { brand:"Nokia",   label:"Lumia 1020 (2013)",           sensor_w:7.44, sensor_h:5.58,  focal_length:5.38, focal_length_eq:26 }, // 41MP PureView, ~1/1.5"
  { brand:"Nokia",   label:"Lumia 930 (2014)",            sensor_w:5.76, sensor_h:4.32,  focal_length:4.16, focal_length_eq:26 }, // 20MP PureView, Carl Zeiss, approx
  { brand:"Nokia",   label:"Lumia 920 (2012)",            sensor_w:4.80, sensor_h:3.60,  focal_length:3.73, focal_length_eq:28 }, // 8.7MP, Carl Zeiss, 1/3"
  { brand:"Nokia",   label:"N8 (2010)",                   sensor_w:7.00, sensor_h:5.25,  focal_length:5.44, focal_length_eq:28 }, // 12MP, Carl Zeiss, 1/1.83" approx

  // Sony Xperia
  { brand:"Sony",    label:"Xperia 1 V / 5 V (2023)",    sensor_w:9.49, sensor_h:7.12,  focal_length:6.33, focal_length_eq:24 }, // 12MP Exmor RS, 1/1.35" approx
  { brand:"Sony",    label:"Xperia 1 III / 5 III (2021)", sensor_w:7.60, sensor_h:5.70,  focal_length:5.07, focal_length_eq:24 }, // 12MP, 1/1.7" approx
  { brand:"Sony",    label:"Xperia XZ2 / XZ3 (2018)",    sensor_w:6.13, sensor_h:4.60,  focal_length:4.26, focal_length_eq:25 }, // 19MP Motion Eye, 1/2.3"
  { brand:"Sony",    label:"Xperia XZ / XZ1 (2016/2017)", sensor_w:6.13, sensor_h:4.60,  focal_length:4.09, focal_length_eq:24 }, // 23MP IMX300/IMX400, 1/2.3"
  { brand:"Sony",    label:"Xperia Z5 / Z3+ (2015)",     sensor_w:6.13, sensor_h:4.60,  focal_length:4.09, focal_length_eq:24 }, // 23MP IMX300, 1/2.3"
  { brand:"Sony",    label:"Xperia Z2 / Z3 (2014)",      sensor_w:6.13, sensor_h:4.60,  focal_length:4.76, focal_length_eq:28 }, // 20.7MP IMX220 approx
  { brand:"Sony",    label:"Xperia Z1 (2013)",           sensor_w:6.13, sensor_h:4.60,  focal_length:4.60, focal_length_eq:27 }, // 20.7MP IMX135, 1/2.3"
  { brand:"Sony",    label:"Xperia Z / Arc S (2012)",    sensor_w:4.54, sensor_h:3.42,  focal_length:3.53, focal_length_eq:28 }, // 13MP/8MP Exmor RS, 1/3.2" approx

  // Xiaomi — pre-2017
  { brand:"Xiaomi",  label:"Mi 5 (2016)",                sensor_w:4.80, sensor_h:3.60,  focal_length:3.73, focal_length_eq:28 }, // 16MP Sony IMX298 approx
  { brand:"Xiaomi",  label:"Mi 4 (2014)",                sensor_w:4.80, sensor_h:3.60,  focal_length:3.73, focal_length_eq:28 }, // 13MP Sony IMX214 approx
  { brand:"Xiaomi",  label:"Mi 3 (2013)",                sensor_w:4.54, sensor_h:3.42,  focal_length:4.41, focal_length_eq:35 }, // 13MP approx

  // ── CUSTOM ───────────────────────────────────────────────────────────────
  { brand:"—", label:"Custom sensor dimensions …", sensor_w:null, sensor_h:null, focal_length:null, focal_length_eq:null },
];
