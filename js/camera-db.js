/* camera-db.js - physical sensor dimensions for SiliconAperture (main/wide camera)
   sensor_w / sensor_h : sensor size in mm
   focal_length        : actual focal length in mm (null for ILC bodies; EXIF-authoritative)
   focal_length_eq     : 35mm equivalent, display only
   Formula: focal_length = focal_length_eq × sensor_w / 36
   Sources: GSMarena spec pages; pixel math (pixel_count × pixel_size_µm / 1000) where noted.

   Confidence markers (shown as labels in the camera dropdown):
     [✓]  "confirmed"     — verified from a GSMarena spec page (sensor format + focal_eq);
                            "[✓] focal_eq ~" means sensor confirmed but focal_eq is approximate
     [~]  "unconfirmed"   — sensor family or optical format known, not directly verified against a spec page
     [?]  "missing data"  — no source data; values are estimates
   ILC bodies (focal_length: null) carry no marker — sensor size is a published industry standard. */

const CAMERA_DB = [

  // ── APPLE ────────────────────────────────────────────────────────────────
  { brand:"Apple", label:"iPhone 17 Pro Max",            sensor_w:10.00, sensor_h:7.50,  focal_length:6.67, focal_length_eq:24, confidence:"✓" }, // [✓] 1/1.28"; 24mm
  { brand:"Apple", label:"iPhone 17 Pro",                sensor_w:10.00, sensor_h:7.50,  focal_length:6.67, focal_length_eq:24, confidence:"✓" }, // [✓] 1/1.28"; 24mm
  { brand:"Apple", label:"iPhone Air",                   sensor_w:8.21,  sensor_h:6.15,  focal_length:5.93, focal_length_eq:26, confidence:"✓" }, // [✓] 1/1.56"; 26mm
  { brand:"Apple", label:"iPhone 17",                    sensor_w:8.21,  sensor_h:6.15,  focal_length:5.93, focal_length_eq:26, confidence:"✓" }, // [✓] 1/1.56"; 26mm
  { brand:"Apple", label:"iPhone 17e",                   sensor_w:5.60,  sensor_h:4.20,  focal_length:4.20, focal_length_eq:26, confidence:"✓" }, // [✓] 1/2.55"; 26mm; focal_length EXIF
  { brand:"Apple", label:"iPhone 16 Pro Max",          sensor_w:10.00, sensor_h:7.50,  focal_length:6.67, focal_length_eq:24, confidence:"✓" }, // [✓] 1/1.28"; 24mm
  { brand:"Apple", label:"iPhone 16 Pro",              sensor_w:10.00, sensor_h:7.50,  focal_length:6.67, focal_length_eq:24, confidence:"✓" }, // [✓] 1/1.28"; 24mm
  { brand:"Apple", label:"iPhone 16 / 16 Plus",        sensor_w:8.21,  sensor_h:6.15,  focal_length:5.93, focal_length_eq:26, confidence:"✓" }, // [✓] 1/1.56"; 26mm
  { brand:"Apple", label:"iPhone 16e",                   sensor_w:5.60,  sensor_h:4.20,  focal_length:4.20, focal_length_eq:26, confidence:"✓" }, // [✓] 1/2.55"; 26mm; focal_length EXIF (implies ~27mm; Apple states 26mm)
  { brand:"Apple", label:"iPhone 15 Pro Max",          sensor_w:10.00, sensor_h:7.50,  focal_length:6.67, focal_length_eq:24, confidence:"✓" }, // [✓] 1/1.28"; 24mm
  { brand:"Apple", label:"iPhone 15 Pro",              sensor_w:10.00, sensor_h:7.50,  focal_length:6.67, focal_length_eq:24, confidence:"✓" }, // [✓] 1/1.28"; 24mm
  { brand:"Apple", label:"iPhone 15 / 15 Plus",        sensor_w:8.21,  sensor_h:6.15,  focal_length:5.93, focal_length_eq:26, confidence:"✓" }, // [✓] 1/1.56"; 26mm
  { brand:"Apple", label:"iPhone 14 Pro Max",          sensor_w:10.00, sensor_h:7.50,  focal_length:6.67, focal_length_eq:24, confidence:"✓" }, // [✓] 1/1.28"; 24mm
  { brand:"Apple", label:"iPhone 14 Pro",              sensor_w:10.00, sensor_h:7.50,  focal_length:6.67, focal_length_eq:24, confidence:"✓" }, // [✓] 1/1.28"; 24mm
  { brand:"Apple", label:"iPhone 14 / 14 Plus",        sensor_w:7.60,  sensor_h:5.70,  focal_length:5.49, focal_length_eq:26, confidence:"✓" }, // [✓] 1/1.7" 1.9µm; 26mm
  { brand:"Apple", label:"iPhone 13 Pro / Pro Max",    sensor_w:7.60,  sensor_h:5.70,  focal_length:5.49, focal_length_eq:26, confidence:"✓" }, // [✓] 1/1.7" 1.9µm; 26mm
  { brand:"Apple", label:"iPhone 13 / 13 mini",        sensor_w:6.80,  sensor_h:5.10,  focal_length:4.91, focal_length_eq:26, confidence:"✓" }, // [✓] 1/1.9" 1.7µm; 26mm
  { brand:"Apple", label:"iPhone 12 Pro Max",          sensor_w:6.80,  sensor_h:5.10,  focal_length:4.91, focal_length_eq:26, confidence:"✓" }, // [✓] 1/1.9" 1.7µm; 26mm
  { brand:"Apple", label:"iPhone 12 Pro",              sensor_w:5.60,  sensor_h:4.20,  focal_length:4.04, focal_length_eq:26, confidence:"✓" }, // [✓] 1/2.55" 1.4µm; 26mm
  { brand:"Apple", label:"iPhone 12 / 12 mini",        sensor_w:5.60,  sensor_h:4.20,  focal_length:4.04, focal_length_eq:26, confidence:"✓" }, // [✓] 1/2.55" 1.4µm; 26mm
  { brand:"Apple", label:"iPhone SE (3rd gen, 2022)",  sensor_w:4.80,  sensor_h:3.60,  focal_length:3.73, focal_length_eq:28, confidence:"?" }, // [?]
  { brand:"Apple", label:"iPhone 11 Pro / Pro Max",    sensor_w:5.60,  sensor_h:4.20,  focal_length:4.04, focal_length_eq:26, confidence:"✓" }, // [✓] 1/2.55" 1.4µm; 26mm
  { brand:"Apple", label:"iPhone 11",                  sensor_w:5.60,  sensor_h:4.20,  focal_length:4.04, focal_length_eq:26, confidence:"✓" }, // [✓] 1/2.55" 1.4µm; 26mm
  { brand:"Apple", label:"iPhone SE (2nd gen, 2020)",  sensor_w:4.80,  sensor_h:3.60,  focal_length:3.73, focal_length_eq:28, confidence:"~" }, // [~] inferred same camera as iPhone 8
  { brand:"Apple", label:"iPhone XS Max / XS (2018)",  sensor_w:5.60,  sensor_h:4.20,  focal_length:4.04, focal_length_eq:26, confidence:"✓" }, // [✓] 1/2.55" 1.4µm; 26mm
  { brand:"Apple", label:"iPhone XR (2018)",           sensor_w:5.60,  sensor_h:4.20,  focal_length:4.04, focal_length_eq:26, confidence:"✓" }, // [✓] 1/2.55" 1.4µm; 26mm
  { brand:"Apple", label:"iPhone X (2017)",            sensor_w:4.88,  sensor_h:3.66,  focal_length:3.80, focal_length_eq:28, confidence:"✓" }, // [✓] 1/3.0" 1.22µm; 28mm
  { brand:"Apple", label:"iPhone 8 / 8 Plus (2017)",  sensor_w:4.88,  sensor_h:3.66,  focal_length:3.80, focal_length_eq:28, confidence:"~" }, // [~] 1/3.0"; 28mm; no sensor size in GSMarena
  { brand:"Apple", label:"iPhone 7 / 7 Plus (2016)",  sensor_w:4.88,  sensor_h:3.66,  focal_length:3.80, focal_length_eq:28, confidence:"✓" }, // [✓] 1/3.0" 1.22µm; 28mm
  { brand:"Apple", label:"iPhone SE (1st gen, 2016)",  sensor_w:4.88,  sensor_h:3.66,  focal_length:3.93, focal_length_eq:29, confidence:"✓" }, // [✓] 1/3.0" 1.22µm; 29mm
  { brand:"Apple", label:"iPhone 6s / 6s Plus (2015)", sensor_w:4.88,  sensor_h:3.66,  focal_length:3.93, focal_length_eq:29, confidence:"✓" }, // [✓] 1/3.0" 1.22µm; 29mm
  { brand:"Apple", label:"iPhone 6 / 6 Plus (2014)",  sensor_w:4.90,  sensor_h:3.68,  focal_length:3.95, focal_length_eq:29, confidence:"✓" }, // [✓] 1/3.0" 1.5µm; 29mm
  { brand:"Apple", label:"iPhone 5s (2013)",            sensor_w:4.90,  sensor_h:3.68,  focal_length:3.95, focal_length_eq:29, confidence:"✓" }, // [✓] 1/3.0" 1.5µm; 29mm
  { brand:"Apple", label:"iPhone 5 / 5c (2012)",        sensor_w:4.57,  sensor_h:3.43,  focal_length:4.19, focal_length_eq:33, confidence:"✓" }, // [✓] 1/3.2" 1.4µm; 33mm
  { brand:"Apple", label:"iPhone 4S (2011)",            sensor_w:4.57,  sensor_h:3.43,  focal_length:4.44, focal_length_eq:35, confidence:"✓" }, // [✓] 1/3.2" 1.4µm; 35mm
  { brand:"Apple", label:"iPhone 4 (2010)",             sensor_w:4.54,  sensor_h:3.42,  focal_length:4.41, focal_length_eq:35, confidence:"~" }, // [~] 1/3.2"; 35mm

  // ── SAMSUNG ──────────────────────────────────────────────────────────────
  { brand:"Samsung", label:"Galaxy S26 Ultra",          sensor_w:9.80,  sensor_h:7.35,  focal_length:6.26, focal_length_eq:23, confidence:"✓" }, // [✓] 1/1.3" 0.6µm; 23mm
  { brand:"Samsung", label:"Galaxy S26 / S26+",         sensor_w:8.21,  sensor_h:6.15,  focal_length:5.47, focal_length_eq:24, confidence:"✓" }, // [✓] 1/1.56" 1.0µm; 24mm
  { brand:"Samsung", label:"Galaxy S25 Ultra",         sensor_w:9.80,  sensor_h:7.35,  focal_length:6.53, focal_length_eq:24, confidence:"✓" }, // [✓] 1/1.3" 0.6µm; 24mm
  { brand:"Samsung", label:"Galaxy S25 / S25+",        sensor_w:8.21,  sensor_h:6.15,  focal_length:5.47, focal_length_eq:24, confidence:"✓" }, // [✓] 1/1.56" 1.0µm; 24mm
  { brand:"Samsung", label:"Galaxy S25 Edge",           sensor_w:9.80,  sensor_h:7.35,  focal_length:6.53, focal_length_eq:24, confidence:"✓" }, // [✓] 1/1.3" 0.6µm; 24mm
  { brand:"Samsung", label:"Galaxy S25 FE",            sensor_w:8.15,  sensor_h:6.12,  focal_length:5.43, focal_length_eq:24, confidence:"✓" }, // [✓] 1/1.57"; 24mm
  { brand:"Samsung", label:"Galaxy S24 FE",            sensor_w:8.15,  sensor_h:6.12,  focal_length:5.43, focal_length_eq:24, confidence:"✓" }, // [✓] 1/1.57" 1.0µm; 24mm
  { brand:"Samsung", label:"Galaxy S24 Ultra",         sensor_w:9.80,  sensor_h:7.35,  focal_length:6.53, focal_length_eq:24, confidence:"✓" }, // [✓] 1/1.3" 0.6µm; 24mm
  { brand:"Samsung", label:"Galaxy S24 / S24+",        sensor_w:8.21,  sensor_h:6.15,  focal_length:5.47, focal_length_eq:24, confidence:"✓" }, // [✓] 1/1.56" 1.0µm; 24mm
  { brand:"Samsung", label:"Galaxy S23 Ultra",         sensor_w:9.80,  sensor_h:7.35,  focal_length:6.53, focal_length_eq:24, confidence:"✓" }, // [✓] 1/1.3" 0.6µm; 24mm
  { brand:"Samsung", label:"Galaxy S23 / S23+",        sensor_w:8.21,  sensor_h:6.15,  focal_length:5.47, focal_length_eq:24, confidence:"✓" }, // [✓] 1/1.56" 1.0µm; 24mm
  { brand:"Samsung", label:"Galaxy S23 FE",            sensor_w:8.15,  sensor_h:6.12,  focal_length:5.21, focal_length_eq:23, confidence:"✓" }, // [✓] 1/1.57" 1.0µm; 23mm
  { brand:"Samsung", label:"Galaxy S22 Ultra",         sensor_w:9.62,  sensor_h:7.22,  focal_length:6.15, focal_length_eq:23, confidence:"~" }, // [~] 108MP 1/1.33" 0.8µm (HM3, same as S21 Ultra); 23mm
  { brand:"Samsung", label:"Galaxy S22 / S22+",        sensor_w:8.21,  sensor_h:6.15,  focal_length:5.24, focal_length_eq:23, confidence:"✓" }, // [✓] 1/1.56" 1.0µm; 23mm
  { brand:"Samsung", label:"Galaxy Z Fold 6 (main)",   sensor_w:8.15,  sensor_h:6.12,  focal_length:5.21, focal_length_eq:23, confidence:"✓" }, // [✓] 1/1.57" 1.0µm; 23mm
  { brand:"Samsung", label:"Galaxy Z Fold4 (main)",    sensor_w:8.21,  sensor_h:6.15,  focal_length:5.24, focal_length_eq:23, confidence:"✓" }, // [✓] 1/1.56" 1.0µm; 23mm
  { brand:"Samsung", label:"Galaxy Z Fold3 (main)",    sensor_w:7.20,  sensor_h:5.40,  focal_length:5.20, focal_length_eq:26, confidence:"✓" }, // [✓] 1/1.76" 1.8µm; 26mm
  { brand:"Samsung", label:"Galaxy Z Fold2 (main)",    sensor_w:7.20,  sensor_h:5.40,  focal_length:5.20, focal_length_eq:26, confidence:"✓" }, // [✓] 1/1.76" 1.8µm; 26mm
  { brand:"Samsung", label:"Galaxy Fold 5G (main)",    sensor_w:5.60,  sensor_h:4.20,  focal_length:4.20, focal_length_eq:27, confidence:"✓" }, // [✓] 1/2.55" 1.4µm; 27mm
  { brand:"Samsung", label:"Galaxy Fold (main)",       sensor_w:5.60,  sensor_h:4.20,  focal_length:4.20, focal_length_eq:27, confidence:"✓" }, // [✓] 1/2.55" 1.4µm; 27mm
  { brand:"Samsung", label:"Galaxy Z Fold5 (main)",    sensor_w:8.21,  sensor_h:6.15,  focal_length:5.24, focal_length_eq:23, confidence:"✓" }, // [✓] 1/1.56" 1.0µm; 23mm
  { brand:"Samsung", label:"Galaxy Z Fold7 (main)",     sensor_w:9.80,  sensor_h:7.35,  focal_length:6.53, focal_length_eq:24, confidence:"✓" }, // [✓] 1/1.3" 0.6µm; 24mm
  { brand:"Samsung", label:"Galaxy Z TriFold (main)",   sensor_w:9.80,  sensor_h:7.35,  focal_length:6.53, focal_length_eq:24, confidence:"✓" }, // [✓] 1/1.3" 0.6µm; 24mm
  { brand:"Samsung", label:"Galaxy Z Flip7",            sensor_w:8.15,  sensor_h:6.12,  focal_length:5.21, focal_length_eq:23, confidence:"✓" }, // [✓] 1/1.57"; 23mm
  { brand:"Samsung", label:"Galaxy Z Flip7 FE",         sensor_w:8.15,  sensor_h:6.12,  focal_length:5.21, focal_length_eq:23, confidence:"✓" }, // [✓] 1/1.57"; 23mm
  { brand:"Samsung", label:"Galaxy Z Flip6",            sensor_w:8.15,  sensor_h:6.12,  focal_length:5.21, focal_length_eq:23, confidence:"✓" }, // [✓] 1/1.57" 1.0µm; 23mm
  { brand:"Samsung", label:"Galaxy Z Flip5",            sensor_w:7.20,  sensor_h:5.40,  focal_length:4.80, focal_length_eq:24, confidence:"✓" }, // [✓] 1/1.76" 1.8µm; 24mm
  { brand:"Samsung", label:"Galaxy Z Flip4",            sensor_w:7.20,  sensor_h:5.40,  focal_length:4.80, focal_length_eq:24, confidence:"✓" }, // [✓] 1/1.76" 1.8µm; 24mm
  { brand:"Samsung", label:"Galaxy Z Flip3",            sensor_w:5.60,  sensor_h:4.20,  focal_length:4.20, focal_length_eq:27, confidence:"✓" }, // [✓] 1/2.55" 1.4µm; 27mm
  { brand:"Samsung", label:"Galaxy Z Flip 5G",          sensor_w:5.60,  sensor_h:4.20,  focal_length:4.20, focal_length_eq:27, confidence:"✓" }, // [✓] 1/2.55" 1.4µm; 27mm
  { brand:"Samsung", label:"Galaxy Z Flip",             sensor_w:5.60,  sensor_h:4.20,  focal_length:4.20, focal_length_eq:27, confidence:"✓" }, // [✓] 1/2.55" 1.4µm; 27mm
  { brand:"Samsung", label:"Galaxy A55",               sensor_w:8.21,  sensor_h:6.15,  focal_length:5.93, focal_length_eq:26, confidence:"✓" }, // [✓] 1/1.56" 1.0µm; focal_eq ~
  { brand:"Samsung", label:"Galaxy A54",               sensor_w:8.21,  sensor_h:6.15,  focal_length:5.24, focal_length_eq:23, confidence:"✓" }, // [✓] 1/1.56" 1.0µm; 23mm
  { brand:"Samsung", label:"Galaxy A53 5G",            sensor_w:7.40,  sensor_h:5.55,  focal_length:5.34, focal_length_eq:26, confidence:"~" }, // [~] 1/1.7X" 0.8µm pixel math; focal_eq ~
  { brand:"Samsung", label:"Galaxy A52s 5G",           sensor_w:7.40,  sensor_h:5.55,  focal_length:5.34, focal_length_eq:26, confidence:"✓" }, // [✓] 1/1.7" 0.8µm pixel math; focal_eq ~
  { brand:"Samsung", label:"Galaxy Quantum 2",         sensor_w:7.40,  sensor_h:5.55,  focal_length:5.34, focal_length_eq:26, confidence:"~" }, // [~] 1/1.7X" 0.8µm pixel math; focal_eq ~
  { brand:"Samsung", label:"Galaxy A52 5G",            sensor_w:7.40,  sensor_h:5.55,  focal_length:5.34, focal_length_eq:26, confidence:"~" }, // [~] 1/1.7X" 0.8µm pixel math; focal_eq ~
  { brand:"Samsung", label:"Galaxy A52",               sensor_w:7.40,  sensor_h:5.55,  focal_length:5.34, focal_length_eq:26, confidence:"✓" }, // [✓] 1/1.7" 0.8µm pixel math; focal_eq ~
  { brand:"Samsung", label:"Galaxy A51 5G",            sensor_w:6.40,  sensor_h:4.80,  focal_length:4.62, focal_length_eq:26, confidence:"✓" }, // [✓] 1/2.0" 0.8µm; focal_eq ~
  { brand:"Samsung", label:"Galaxy A51 5G UW",         sensor_w:6.40,  sensor_h:4.80,  focal_length:4.62, focal_length_eq:26, confidence:"✓" }, // [✓] 1/2.0" 0.8µm; focal_eq ~
  { brand:"Samsung", label:"Galaxy A51",               sensor_w:6.40,  sensor_h:4.80,  focal_length:4.62, focal_length_eq:26, confidence:"✓" }, // [✓] 1/2.0" 0.8µm; focal_eq ~
  { brand:"Samsung", label:"Galaxy A57 5G",             sensor_w:8.21,  sensor_h:6.15,  focal_length:5.93, focal_length_eq:26, confidence:"✓" }, // [✓] 1/1.56" 1.0µm; focal_eq ~
  { brand:"Samsung", label:"Galaxy A56",               sensor_w:8.21,  sensor_h:6.15,  focal_length:5.93, focal_length_eq:26, confidence:"✓" }, // [✓] 1/1.56" 1.0µm; focal_eq ~
  { brand:"Samsung", label:"Galaxy A73 5G",            sensor_w:9.15,  sensor_h:6.86,  focal_length:6.61, focal_length_eq:26, confidence:"?" }, // [?] 108MP
  { brand:"Samsung", label:"Galaxy A72",               sensor_w:7.40,  sensor_h:5.55,  focal_length:5.34, focal_length_eq:26, confidence:"✓" }, // [✓] 1/1.7" 0.8µm pixel math; focal_eq ~
  { brand:"Samsung", label:"Galaxy A37 5G",             sensor_w:8.21,  sensor_h:6.15,  focal_length:5.93, focal_length_eq:26, confidence:"✓" }, // [✓] 1/1.56" 1.0µm; focal_eq ~
  { brand:"Samsung", label:"Galaxy A36",               sensor_w:6.53,  sensor_h:4.90,  focal_length:4.72, focal_length_eq:26, confidence:"✓" }, // [✓] 1/1.96" 0.8µm; focal_eq ~
  { brand:"Samsung", label:"Galaxy A35",               sensor_w:6.53,  sensor_h:4.90,  focal_length:4.72, focal_length_eq:26, confidence:"✓" }, // [✓] 1/1.96"; focal_eq ~
  { brand:"Samsung", label:"Galaxy A34",               sensor_w:6.40,  sensor_h:4.80,  focal_length:4.62, focal_length_eq:26, confidence:"✓" }, // [✓] 1/2.0" 0.8µm; focal_eq ~
  { brand:"Samsung", label:"Galaxy A33 5G",            sensor_w:6.40,  sensor_h:4.80,  focal_length:4.62, focal_length_eq:26, confidence:"✓" }, // [✓] 1/2.0" 0.8µm; focal_eq ~
  { brand:"Samsung", label:"Galaxy A42 5G",            sensor_w:6.40,  sensor_h:4.80,  focal_length:4.27, focal_length_eq:24, confidence:"✓" }, // [✓] 1/2.0" 0.8µm; 24mm
  { brand:"Samsung", label:"Galaxy A41",               sensor_w:6.40,  sensor_h:4.80,  focal_length:4.62, focal_length_eq:26, confidence:"✓" }, // [✓] 1/2.0" 0.8µm; focal_eq ~
  { brand:"Samsung", label:"Galaxy A31",               sensor_w:6.40,  sensor_h:4.80,  focal_length:4.62, focal_length_eq:26, confidence:"✓" }, // [✓] 1/2.0" 0.8µm; focal_eq ~
  { brand:"Samsung", label:"Galaxy A32 5G",            sensor_w:6.40,  sensor_h:4.80,  focal_length:4.62, focal_length_eq:26, confidence:"✓" }, // [✓] 1/2.0" 0.8µm; focal_eq ~
  { brand:"Samsung", label:"Galaxy A32",               sensor_w:7.40,  sensor_h:5.55,  focal_length:5.34, focal_length_eq:26, confidence:"?" }, // [?] 64MP, no format
  { brand:"Samsung", label:"Galaxy M36 5G",             sensor_w:6.53,  sensor_h:4.90,  focal_length:4.72, focal_length_eq:26, confidence:"✓" }, // [✓] 1/1.96"; focal_eq ~
  { brand:"Samsung", label:"Galaxy M35",               sensor_w:6.53,  sensor_h:4.90,  focal_length:4.72, focal_length_eq:26, confidence:"✓" }, // [✓] 1/1.96"; focal_eq ~
  { brand:"Samsung", label:"Galaxy M34 5G",            sensor_w:6.53,  sensor_h:4.90,  focal_length:4.72, focal_length_eq:26, confidence:"?" }, // [?]
  { brand:"Samsung", label:"Galaxy M33 5G",            sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?]
  { brand:"Samsung", label:"Galaxy M32",               sensor_w:6.50,  sensor_h:4.88,  focal_length:4.69, focal_length_eq:26, confidence:"✓" }, // [✓] 1/1.97" 0.7µm; 26mm
  { brand:"Samsung", label:"Galaxy M22",               sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?]
  { brand:"Samsung", label:"Galaxy M12",               sensor_w:6.40,  sensor_h:4.80,  focal_length:4.62, focal_length_eq:26, confidence:"✓" }, // [✓] 1/2.0" 0.8µm; focal_eq ~
  { brand:"Samsung", label:"Galaxy M21",               sensor_w:6.40,  sensor_h:4.80,  focal_length:4.62, focal_length_eq:26, confidence:"✓" }, // [✓] 1/2.0" 0.8µm; focal_eq ~
  { brand:"Samsung", label:"Galaxy M21 2021",          sensor_w:6.40,  sensor_h:4.80,  focal_length:4.62, focal_length_eq:26, confidence:"✓" }, // [✓] 1/2.0" 0.8µm; 26mm
  { brand:"Samsung", label:"Galaxy F36 5G",             sensor_w:6.53,  sensor_h:4.90,  focal_length:4.72, focal_length_eq:26, confidence:"✓" }, // [✓] 1/1.96"; focal_eq ~
  { brand:"Samsung", label:"Galaxy F55",               sensor_w:8.21,  sensor_h:6.15,  focal_length:5.93, focal_length_eq:26, confidence:"✓" }, // [✓] 1/1.56" 1.0µm; focal_eq ~
  { brand:"Samsung", label:"Galaxy M54",               sensor_w:9.15,  sensor_h:6.86,  focal_length:6.61, focal_length_eq:26, confidence:"?" }, // [?] 108MP
  { brand:"Samsung", label:"Galaxy M53",               sensor_w:9.15,  sensor_h:6.86,  focal_length:6.61, focal_length_eq:26, confidence:"?" }, // [?] 108MP
  { brand:"Samsung", label:"Galaxy M62",               sensor_w:7.40,  sensor_h:5.55,  focal_length:5.34, focal_length_eq:26, confidence:"✓" }, // [✓] 1/1.73" 0.8µm; focal_eq ~
  { brand:"Samsung", label:"Galaxy M51",               sensor_w:7.40,  sensor_h:5.55,  focal_length:5.34, focal_length_eq:26, confidence:"✓" }, // [✓] 1/1.73" 0.8µm; focal_eq ~
  { brand:"Samsung", label:"Galaxy F62",               sensor_w:7.40,  sensor_h:5.55,  focal_length:5.34, focal_length_eq:26, confidence:"✓" }, // [✓] 1/1.73" 0.8µm; focal_eq ~
  { brand:"Samsung", label:"Galaxy M31s",              sensor_w:7.40,  sensor_h:5.55,  focal_length:5.34, focal_length_eq:26, confidence:"✓" }, // [✓] 1/1.73" 0.8µm; focal_eq ~
  { brand:"Samsung", label:"Galaxy A71 5G",            sensor_w:7.40,  sensor_h:5.55,  focal_length:5.34, focal_length_eq:26, confidence:"✓" }, // [✓] 1/1.72" 0.8µm pixel math; focal_eq ~
  { brand:"Samsung", label:"Galaxy A71",               sensor_w:7.40,  sensor_h:5.55,  focal_length:5.34, focal_length_eq:26, confidence:"✓" }, // [✓] 1/1.72" 0.8µm; focal_eq ~
  { brand:"Samsung", label:"Galaxy A Quantum",         sensor_w:7.40,  sensor_h:5.55,  focal_length:5.34, focal_length_eq:26, confidence:"✓" }, // [✓] 1/1.72" 0.8µm pixel math; focal_eq ~
  { brand:"Samsung", label:"Galaxy M31",               sensor_w:7.40,  sensor_h:5.55,  focal_length:5.34, focal_length_eq:26, confidence:"✓" }, // [✓] 1/1.72" 0.8µm pixel math; focal_eq ~
  { brand:"Samsung", label:"Galaxy M31 Prime",         sensor_w:7.40,  sensor_h:5.55,  focal_length:5.34, focal_length_eq:26, confidence:"✓" }, // [✓] 1/1.72" 0.8µm pixel math; focal_eq ~
  { brand:"Samsung", label:"Galaxy M21s",              sensor_w:7.40,  sensor_h:5.55,  focal_length:5.34, focal_length_eq:26, confidence:"✓" }, // [✓] 1/1.72" 0.8µm pixel math; focal_eq ~
  { brand:"Samsung", label:"Galaxy F41",               sensor_w:7.40,  sensor_h:5.55,  focal_length:5.34, focal_length_eq:26, confidence:"✓" }, // [✓] 1/1.72" 0.8µm pixel math; focal_eq ~
  { brand:"Samsung", label:"Galaxy M52 5G",            sensor_w:6.50,  sensor_h:4.88,  focal_length:4.69, focal_length_eq:26, confidence:"✓" }, // [✓] 1/1.97" 0.7µm; 26mm
  { brand:"Samsung", label:"Galaxy M42 5G",            sensor_w:6.40,  sensor_h:4.80,  focal_length:4.62, focal_length_eq:26, confidence:"✓" }, // [✓] 1/2.0" 0.8µm; focal_eq ~
  { brand:"Samsung", label:"Galaxy F54",               sensor_w:9.15,  sensor_h:6.86,  focal_length:6.61, focal_length_eq:26, confidence:"?" }, // [?] 108MP
  { brand:"Samsung", label:"Galaxy F34",               sensor_w:6.53,  sensor_h:4.90,  focal_length:4.72, focal_length_eq:26, confidence:"?" }, // [?]
  { brand:"Samsung", label:"Galaxy F52 5G",            sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?]
  { brand:"Samsung", label:"Galaxy F42 5G",            sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?]
  { brand:"Samsung", label:"Galaxy F23",               sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?]
  { brand:"Samsung", label:"Galaxy F22",               sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?]
  { brand:"Samsung", label:"Galaxy F12",               sensor_w:6.40,  sensor_h:4.80,  focal_length:4.62, focal_length_eq:26, confidence:"✓" }, // [✓] 1/2.0" 0.8µm; focal_eq ~
  { brand:"Samsung", label:"Galaxy C55",               sensor_w:8.21,  sensor_h:6.15,  focal_length:5.93, focal_length_eq:26, confidence:"✓" }, // [✓] 1/1.56" 1.0µm; focal_eq ~
  { brand:"Samsung", label:"Galaxy M55s",              sensor_w:8.21,  sensor_h:6.15,  focal_length:5.93, focal_length_eq:26, confidence:"✓" }, // [✓] 1/1.56" 1.0µm; focal_eq ~
  { brand:"Samsung", label:"Galaxy M55",               sensor_w:8.21,  sensor_h:6.15,  focal_length:5.93, focal_length_eq:26, confidence:"✓" }, // [✓] 1/1.56" 1.0µm; focal_eq ~
  { brand:"Samsung", label:"Galaxy S21 Ultra (2021)",  sensor_w:9.62,  sensor_h:7.22,  focal_length:6.41, focal_length_eq:24, confidence:"✓" }, // [✓] 1/1.33" 0.8µm; 24mm
  { brand:"Samsung", label:"Galaxy S21 FE (2022)",     sensor_w:7.20,  sensor_h:5.40,  focal_length:5.20, focal_length_eq:26, confidence:"✓" }, // [✓] 1/1.76" 1.8µm; 26mm
  { brand:"Samsung", label:"Galaxy S21+ (2021)",       sensor_w:7.20,  sensor_h:5.40,  focal_length:5.20, focal_length_eq:26, confidence:"✓" }, // [✓] 1/1.76" 1.8µm; 26mm
  { brand:"Samsung", label:"Galaxy S21 (2021)",        sensor_w:7.20,  sensor_h:5.40,  focal_length:5.20, focal_length_eq:26, confidence:"✓" }, // [✓] 1/1.76" 1.8µm; 26mm
  { brand:"Samsung", label:"Galaxy Note20 Ultra",      sensor_w:9.62,  sensor_h:7.22,  focal_length:6.95, focal_length_eq:26, confidence:"✓" }, // [✓] 1/1.33" 0.8µm; 26mm
  { brand:"Samsung", label:"Galaxy Note20",            sensor_w:7.20,  sensor_h:5.40,  focal_length:5.20, focal_length_eq:26, confidence:"✓" }, // [✓] 1/1.76" 1.8µm; 26mm
  { brand:"Samsung", label:"Galaxy S20 Ultra",         sensor_w:9.62,  sensor_h:7.22,  focal_length:6.95, focal_length_eq:26, confidence:"✓" }, // [✓] 1/1.33" 0.8µm; 26mm
  { brand:"Samsung", label:"Galaxy S20 FE (2022)",     sensor_w:7.20,  sensor_h:5.40,  focal_length:5.20, focal_length_eq:26, confidence:"✓" }, // [✓] 1/1.76" 1.8µm; 26mm
  { brand:"Samsung", label:"Galaxy S20 FE 5G (2020)", sensor_w:7.20,  sensor_h:5.40,  focal_length:5.20, focal_length_eq:26, confidence:"✓" }, // [✓] 1/1.76" 1.8µm; 26mm
  { brand:"Samsung", label:"Galaxy S20+",              sensor_w:7.20,  sensor_h:5.40,  focal_length:5.20, focal_length_eq:26, confidence:"✓" }, // [✓] 1/1.76" 1.8µm; 26mm
  { brand:"Samsung", label:"Galaxy S20",               sensor_w:7.20,  sensor_h:5.40,  focal_length:5.20, focal_length_eq:26, confidence:"✓" }, // [✓] 1/1.76" 1.8µm; 26mm
  { brand:"Samsung", label:"Galaxy Note10+",           sensor_w:5.60,  sensor_h:4.20,  focal_length:4.20, focal_length_eq:27, confidence:"✓" }, // [✓] 1/2.55" 1.4µm; 27mm
  { brand:"Samsung", label:"Galaxy Note10",            sensor_w:5.60,  sensor_h:4.20,  focal_length:4.20, focal_length_eq:27, confidence:"✓" }, // [✓] 1/2.55" 1.4µm; 27mm
  { brand:"Samsung", label:"Galaxy Note10 Lite",       sensor_w:5.60,  sensor_h:4.20,  focal_length:4.20, focal_length_eq:27, confidence:"✓" }, // [✓] 1/2.55" 1.4µm; 27mm
  { brand:"Samsung", label:"Galaxy S10 5G",            sensor_w:5.60,  sensor_h:4.20,  focal_length:4.04, focal_length_eq:26, confidence:"✓" }, // [✓] 1/2.55" 1.4µm; 26mm
  { brand:"Samsung", label:"Galaxy S10+",              sensor_w:5.60,  sensor_h:4.20,  focal_length:4.04, focal_length_eq:26, confidence:"✓" }, // [✓] 1/2.55" 1.4µm; 26mm
  { brand:"Samsung", label:"Galaxy S10",               sensor_w:5.60,  sensor_h:4.20,  focal_length:4.04, focal_length_eq:26, confidence:"✓" }, // [✓] 1/2.55" 1.4µm; 26mm
  { brand:"Samsung", label:"Galaxy S10e",              sensor_w:5.60,  sensor_h:4.20,  focal_length:4.04, focal_length_eq:26, confidence:"✓" }, // [✓] 1/2.55" 1.4µm; 26mm
  { brand:"Samsung", label:"Galaxy Note9",             sensor_w:5.60,  sensor_h:4.20,  focal_length:4.04, focal_length_eq:26, confidence:"✓" }, // [✓] 1/2.55" 1.4µm; 26mm
  { brand:"Samsung", label:"Galaxy S9+",               sensor_w:5.60,  sensor_h:4.20,  focal_length:4.04, focal_length_eq:26, confidence:"✓" }, // [✓] 1/2.55" 1.4µm; 26mm
  { brand:"Samsung", label:"Galaxy S9",                sensor_w:5.60,  sensor_h:4.20,  focal_length:4.04, focal_length_eq:26, confidence:"✓" }, // [✓] 1/2.55" 1.4µm; 26mm
  { brand:"Samsung", label:"Galaxy Note8",             sensor_w:5.60,  sensor_h:4.20,  focal_length:4.04, focal_length_eq:26, confidence:"✓" }, // [✓] 1/2.55" 1.4µm; 26mm
  { brand:"Samsung", label:"Galaxy S8 Active",         sensor_w:5.60,  sensor_h:4.20,  focal_length:4.04, focal_length_eq:26, confidence:"✓" }, // [✓] 1/2.55" 1.4µm; 26mm
  { brand:"Samsung", label:"Galaxy S8+",               sensor_w:5.60,  sensor_h:4.20,  focal_length:4.04, focal_length_eq:26, confidence:"✓" }, // [✓] 1/2.55" 1.4µm; 26mm
  { brand:"Samsung", label:"Galaxy S8",                sensor_w:5.60,  sensor_h:4.20,  focal_length:4.04, focal_length_eq:26, confidence:"✓" }, // [✓] 1/2.55" 1.4µm; 26mm — confirmed by Note8/S8 Active
  { brand:"Samsung", label:"Galaxy A26",                sensor_w:4.64,  sensor_h:3.48,  focal_length:3.48, focal_length_eq:27, confidence:"✓" }, // [✓] 1/2.76"; 27mm
  { brand:"Samsung", label:"Galaxy A25",               sensor_w:4.64,  sensor_h:3.48,  focal_length:3.48, focal_length_eq:27, confidence:"✓" }, // [✓] 1/2.76"; 27mm
  { brand:"Samsung", label:"Galaxy A24 4G",            sensor_w:4.64,  sensor_h:3.48,  focal_length:3.48, focal_length_eq:27, confidence:"✓" }, // [✓] 1/2.76"; 27mm
  { brand:"Samsung", label:"Galaxy A22 5G",            sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?]
  { brand:"Samsung", label:"Galaxy A21s",              sensor_w:6.40,  sensor_h:4.80,  focal_length:4.62, focal_length_eq:26, confidence:"✓" }, // [✓] 1/2.0" 0.8µm; focal_eq ~
  { brand:"Samsung", label:"Galaxy A21",               sensor_w:4.19,  sensor_h:3.14,  focal_length:3.14, focal_length_eq:27, confidence:"?" }, // [?] 1/3.06" 1.0µm; focal_eq unknown
  { brand:"Samsung", label:"Galaxy A22",               sensor_w:6.40,  sensor_h:4.80,  focal_length:4.62, focal_length_eq:26, confidence:"✓" }, // [✓] 1/2.0" 0.8µm; focal_eq ~
  { brand:"Samsung", label:"Galaxy A23 5G",            sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"✓" }, // [✓] 1/2.76" 0.64µm; focal_eq ~
  { brand:"Samsung", label:"Galaxy A15",               sensor_w:4.57,  sensor_h:3.43,  focal_length:3.30, focal_length_eq:26, confidence:"✓" }, // [✓] 1/2.8" 0.64µm; 26mm
  { brand:"Samsung", label:"Galaxy A15 5G",            sensor_w:4.57,  sensor_h:3.43,  focal_length:3.30, focal_length_eq:26, confidence:"~" }, // [~] 1/2.8"; focal_eq ~
  { brand:"Samsung", label:"Galaxy A13 5G",            sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?]
  { brand:"Samsung", label:"Galaxy A12 Nacho",         sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?]
  { brand:"Samsung", label:"Galaxy A12 (India)",       sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?]
  { brand:"Samsung", label:"Galaxy A12",               sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 48MP, no format
  { brand:"Samsung", label:"Galaxy A11",               sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 13MP, no format
  { brand:"Samsung", label:"Galaxy A14 5G",            sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"✓" }, // [✓] 1/2.76" 0.64µm; focal_eq ~
  { brand:"Samsung", label:"Galaxy A14",               sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"✓" }, // [✓] 1/2.75" 0.64µm; focal_eq ~
  { brand:"Samsung", label:"Galaxy A16",                sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"✓" }, // [✓] 1/2.76"; focal_eq ~
  { brand:"Samsung", label:"Galaxy A16 5G",            sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"✓" }, // [✓] 1/2.76"; focal_eq ~
  { brand:"Samsung", label:"Galaxy M16",                sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"✓" }, // [✓] 1/2.76"; focal_eq ~
  { brand:"Samsung", label:"Galaxy A06 5G",             sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"✓" }, // [✓] 1/2.75"; 26mm
  { brand:"Samsung", label:"Galaxy A06",               sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"✓" }, // [✓] 1/2.76"; focal_eq ~
  { brand:"Samsung", label:"Galaxy A05s",              sensor_w:4.57,  sensor_h:3.43,  focal_length:3.30, focal_length_eq:26, confidence:"✓" }, // [✓] 1/2.8"; focal_eq ~
  { brand:"Samsung", label:"Galaxy A05",               sensor_w:4.57,  sensor_h:3.43,  focal_length:3.30, focal_length_eq:26, confidence:"✓" }, // [✓] 1/2.8"; focal_eq ~
  { brand:"Samsung", label:"Galaxy A04s",              sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"✓" }, // [✓] 1/2.76" 0.64µm; focal_eq ~
  { brand:"Samsung", label:"Galaxy A04e",              sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?]
  { brand:"Samsung", label:"Galaxy A03s",              sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?]
  { brand:"Samsung", label:"Galaxy A03",               sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?]
  { brand:"Samsung", label:"Galaxy A03 Core",          sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?]
  { brand:"Samsung", label:"Galaxy A02s",              sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 13MP, no format
  { brand:"Samsung", label:"Galaxy A02",               sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 13MP, no format
  { brand:"Samsung", label:"Galaxy A01",               sensor_w:4.13,  sensor_h:3.10,  focal_length:3.21, focal_length_eq:28, confidence:"✓" }, // [✓] 1/3.1" 1.12µm; 28mm
  { brand:"Samsung", label:"Galaxy A04",               sensor_w:5.10,  sensor_h:3.83,  focal_length:3.54, focal_length_eq:25, confidence:"✓" }, // [✓] 1/2.51" 0.7µm; 25mm
  { brand:"Samsung", label:"Galaxy A27 5G",             sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"✓" }, // [✓] 1/2.76"; focal_eq ~
  { brand:"Samsung", label:"Galaxy A17",                sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"✓" }, // [✓] 1/2.76"; focal_eq ~
  { brand:"Samsung", label:"Galaxy A17 5G",             sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"✓" }, // [✓] 1/2.76"; focal_eq ~
  { brand:"Samsung", label:"Galaxy A07",                sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"✓" }, // [✓] 1/2.76"; focal_eq ~
  { brand:"Samsung", label:"Galaxy M17 5G",             sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"✓" }, // [✓] 1/2.76"; focal_eq ~
  { brand:"Samsung", label:"Galaxy F07",                sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"✓" }, // [✓] 1/2.76"; focal_eq ~
  { brand:"Samsung", label:"Galaxy M07",                sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?]
  { brand:"Samsung", label:"Galaxy F17 5G",             sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?]
  { brand:"Samsung", label:"Galaxy F16",                sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"✓" }, // [✓] 1/2.76"; focal_eq ~
  { brand:"Samsung", label:"Galaxy XCover7 Pro",        sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"✓" }, // [✓] 1/2.76"; focal_eq ~
  { brand:"Samsung", label:"Galaxy XCover7",            sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"✓" }, // [✓] 1/2.76"; focal_eq ~
  { brand:"Samsung", label:"Galaxy XCover FieldPro",    sensor_w:5.60,  sensor_h:4.20,  focal_length:4.04, focal_length_eq:26, confidence:"?" }, // [?] 1/2.55" 1.4µm; focal_eq unknown
  { brand:"Samsung", label:"Galaxy XCover Pro",         sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 25MP, no format
  { brand:"Samsung", label:"Galaxy XCover 4s",          sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 16MP, no format
  { brand:"Samsung", label:"Galaxy XCover 5",           sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 16MP, no format
  { brand:"Samsung", label:"Galaxy F05",               sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?]
  { brand:"Samsung", label:"Galaxy F04",               sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?]
  { brand:"Samsung", label:"Galaxy F02s",              sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?]
  { brand:"Samsung", label:"Galaxy M05",               sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?]
  { brand:"Samsung", label:"Galaxy M10",               sensor_w:4.13,  sensor_h:3.10,  focal_length:3.10, focal_length_eq:27, confidence:"✓" }, // [✓] 1/3.1" 1.12µm; 27mm
  { brand:"Samsung", label:"Galaxy M10s",              sensor_w:4.13,  sensor_h:3.10,  focal_length:3.10, focal_length_eq:27, confidence:"✓" }, // [✓] 1/3.1" 1.12µm; 27mm
  { brand:"Samsung", label:"Galaxy M11",               sensor_w:4.13,  sensor_h:3.10,  focal_length:3.10, focal_length_eq:27, confidence:"✓" }, // [✓] 1/3.1" 1.12µm; focal_eq ~
  { brand:"Samsung", label:"Galaxy M04",               sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?]
  { brand:"Samsung", label:"Galaxy M02s",              sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 13MP, no format
  { brand:"Samsung", label:"Galaxy M02",               sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 13MP, no format
  { brand:"Samsung", label:"Galaxy J2 Core (2020)",    sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 8MP, no format
  { brand:"Samsung", label:"Galaxy F14 4G",            sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?]
  { brand:"Samsung", label:"Galaxy M15",               sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?]
  { brand:"Samsung", label:"Galaxy M14 4G",            sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?]
  { brand:"Samsung", label:"Galaxy M13",               sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?]
  { brand:"Samsung", label:"Galaxy F15",               sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?]
  { brand:"Samsung", label:"Galaxy A70s",              sensor_w:7.40,  sensor_h:5.55,  focal_length:5.34, focal_length_eq:26, confidence:"✓" }, // [✓] 1/1.72" 0.8µm; focal_eq ~
  { brand:"Samsung", label:"Galaxy M30s",              sensor_w:6.40,  sensor_h:4.80,  focal_length:4.62, focal_length_eq:26, confidence:"✓" }, // [✓] 1/2.0" 0.8µm; focal_eq ~
  { brand:"Samsung", label:"Galaxy A90 5G",            sensor_w:6.40,  sensor_h:4.80,  focal_length:4.62, focal_length_eq:26, confidence:"✓" }, // [✓] 1/2.0" 0.8µm; focal_eq ~
  { brand:"Samsung", label:"Galaxy A50s",              sensor_w:6.40,  sensor_h:4.80,  focal_length:4.62, focal_length_eq:26, confidence:"✓" }, // [✓] 1/2.0" 0.8µm; focal_eq ~
  { brand:"Samsung", label:"Galaxy A30s",              sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 25MP, no format
  { brand:"Samsung", label:"Galaxy A10s",              sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 13MP, no format
  { brand:"Samsung", label:"Galaxy A10e",              sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 8MP, no format
  { brand:"Samsung", label:"Galaxy A2 Core",           sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 5MP, no format
  { brand:"Samsung", label:"Galaxy A80",               sensor_w:6.40,  sensor_h:4.80,  focal_length:4.62, focal_length_eq:26, confidence:"✓" }, // [✓] 1/2.0" 0.8µm; 26mm
  { brand:"Samsung", label:"Galaxy M40",               sensor_w:4.57,  sensor_h:3.43,  focal_length:3.30, focal_length_eq:26, confidence:"✓" }, // [✓] 1/2.8" 0.8µm; 26mm
  { brand:"Samsung", label:"Galaxy M30",               sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 13MP, no format
  { brand:"Samsung", label:"Galaxy M20",               sensor_w:4.13,  sensor_h:3.10,  focal_length:3.10, focal_length_eq:27, confidence:"?" }, // [?] 1/3.1" 1.12µm; focal_eq unknown
  { brand:"Samsung", label:"Galaxy A70",               sensor_w:4.57,  sensor_h:3.43,  focal_length:3.30, focal_length_eq:26, confidence:"✓" }, // [✓] 1/2.8" 0.8µm; 26mm
  { brand:"Samsung", label:"Galaxy A60",               sensor_w:4.57,  sensor_h:3.43,  focal_length:3.30, focal_length_eq:26, confidence:"✓" }, // [✓] 1/2.8" 0.8µm; 26mm
  { brand:"Samsung", label:"Galaxy A50",               sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 25MP, no format
  { brand:"Samsung", label:"Galaxy A40",               sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 16MP, no format
  { brand:"Samsung", label:"Galaxy A30",               sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 16MP, no format
  { brand:"Samsung", label:"Galaxy A9 (2018)",         sensor_w:4.57,  sensor_h:3.43,  focal_length:3.43, focal_length_eq:27, confidence:"✓" }, // [✓] 1/2.8" 0.9µm; 27mm
  { brand:"Samsung", label:"Galaxy A8s",               sensor_w:4.57,  sensor_h:3.43,  focal_length:3.43, focal_length_eq:27, confidence:"✓" }, // [✓] 1/2.8" 0.9µm; 27mm
  { brand:"Samsung", label:"Galaxy A7 (2018)",         sensor_w:4.57,  sensor_h:3.43,  focal_length:3.43, focal_length_eq:27, confidence:"✓" }, // [✓] 1/2.8" 0.9µm; 27mm
  { brand:"Samsung", label:"Galaxy A20e",              sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 13MP, no format
  { brand:"Samsung", label:"Galaxy A20",               sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 13MP, no format
  { brand:"Samsung", label:"Galaxy A10",               sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 13MP, no format
  { brand:"Samsung", label:"Galaxy J6+",               sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 13MP, no format
  { brand:"Samsung", label:"Galaxy J4+",               sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 13MP, no format
  { brand:"Samsung", label:"Galaxy J4 Core",           sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 8MP, no format
  { brand:"Samsung", label:"Galaxy J2 Core",           sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 8MP, no format
  { brand:"Samsung", label:"Galaxy A8 Star",           sensor_w:4.57,  sensor_h:3.43,  focal_length:3.43, focal_length_eq:27, confidence:"✓" }, // [✓] 1/2.8" 0.9µm; 27mm
  { brand:"Samsung", label:"Galaxy On6",               sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 13MP, no format
  { brand:"Samsung", label:"Galaxy J7 (2018)",         sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 8-13MP, operator dependent, no format
  { brand:"Samsung", label:"Galaxy J3 (2018)",         sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 8MP, no format
  { brand:"Samsung", label:"Galaxy S Light Luxury",    sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 16MP 1.12µm, no format
  { brand:"Samsung", label:"Galaxy J8",                sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 16MP, no format
  { brand:"Samsung", label:"Galaxy J6",                sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 13MP, no format
  { brand:"Samsung", label:"Galaxy J4",                sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 13MP, no format
  { brand:"Samsung", label:"Galaxy A6+ (2018)",        sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 16MP, no format (1/2.8" listed is front cam)
  { brand:"Samsung", label:"Galaxy A6 (2018)",         sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 16MP, no format
  { brand:"Samsung", label:"Galaxy J7 Duo",            sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 13MP, no format
  { brand:"Samsung", label:"Galaxy J7 Prime 2",        sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 13MP, no format
  { brand:"Samsung", label:"Galaxy J2 Pro (2018)",     sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 8MP, no format
  { brand:"Samsung", label:"Galaxy A8+ (2018)",        sensor_w:4.57,  sensor_h:3.43,  focal_length:3.30, focal_length_eq:26, confidence:"✓" }, // [✓] 1/2.8" 1.12µm; 26mm (optical formula — pixel math overestimates)
  { brand:"Samsung", label:"Galaxy A8 (2018)",         sensor_w:4.57,  sensor_h:3.43,  focal_length:3.30, focal_length_eq:26, confidence:"✓" }, // [✓] 1/2.8" 1.12µm; 26mm
  { brand:"Samsung", label:"Galaxy J2 (2017)",         sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 5MP, no format
  { brand:"Samsung", label:"Galaxy C7 (2017)",         sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 13MP, no format
  { brand:"Samsung", label:"Galaxy J7 V",              sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 8MP, no format
  { brand:"Samsung", label:"Galaxy Note FE",           sensor_w:5.60,  sensor_h:4.20,  focal_length:4.04, focal_length_eq:26, confidence:"✓" }, // [✓] 1/2.55" 1.4µm; 26mm
  { brand:"Samsung", label:"Galaxy J7 Max",            sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 13MP, no format (1/3.1" is front cam)
  { brand:"Samsung", label:"Galaxy J7 (2017)",         sensor_w:4.13,  sensor_h:3.10,  focal_length:3.10, focal_length_eq:27, confidence:"✓" }, // [✓] 1/3.1" 1.12µm; 27mm
  { brand:"Samsung", label:"Galaxy J7 Pro",            sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 13MP 27mm, no format on main cam
  { brand:"Samsung", label:"Galaxy J5 (2017)",         sensor_w:4.13,  sensor_h:3.10,  focal_length:3.10, focal_length_eq:27, confidence:"✓" }, // [✓] 1/3.1" 1.12µm; 27mm
  { brand:"Samsung", label:"Galaxy J3 (2017)",         sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 13MP, no format
  { brand:"Samsung", label:"Galaxy C5 Pro",            sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 16MP, no format (1/3.06" is front cam)
  { brand:"Samsung", label:"Galaxy XCover 4",          sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 13MP, no format
  { brand:"Samsung", label:"Galaxy J3 Emerge",         sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 5MP, no format
  { brand:"Samsung", label:"Galaxy C7 Pro",            sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 16MP, no format (1/3.06" is front cam)
  { brand:"Samsung", label:"Galaxy A7 (2017)",         sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 16MP, no format (1/3.06" is front cam)
  { brand:"Samsung", label:"Galaxy A5 (2017)",         sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 16MP, no format (1/3.06" is front cam)
  { brand:"Samsung", label:"Galaxy A3 (2017)",         sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 13MP, no format
  { brand:"Samsung", label:"Galaxy Grand Prime Plus",  sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 8MP, no format
  { brand:"Samsung", label:"Galaxy J2 Prime",          sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 8MP, no format
  { brand:"Samsung", label:"Galaxy C9 Pro",            sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 16MP, no format (1/3.06" is front cam)
  { brand:"Samsung", label:"Galaxy A8 (2016)",         sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 16MP, no format
  { brand:"Samsung", label:"Galaxy On8",               sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 13MP, no format
  { brand:"Samsung", label:"Galaxy On7 (2016)",        sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 13MP, no format
  { brand:"Samsung", label:"Galaxy J5 Prime",          sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 13MP, no format
  { brand:"Samsung", label:"Galaxy J7 Prime",          sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 13MP, no format
  { brand:"Samsung", label:"Galaxy Note7",             sensor_w:5.60,  sensor_h:4.20,  focal_length:4.04, focal_length_eq:26, confidence:"✓" }, // [✓] 1/2.55" 1.4µm; 26mm
  { brand:"Samsung", label:"Galaxy On7 Pro",           sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 13MP, no format
  { brand:"Samsung", label:"Galaxy On5 Pro",           sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 8MP, no format
  { brand:"Samsung", label:"Galaxy J Max",             sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 8MP, no format
  { brand:"Samsung", label:"Galaxy J2 Pro (2016)",     sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 8MP, no format
  { brand:"Samsung", label:"Galaxy J2 (2016)",         sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 8MP, no format
  { brand:"Samsung", label:"Galaxy XCover 3 G389F",   sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 5MP, no format
  { brand:"Samsung", label:"Galaxy S7 active",         sensor_w:5.60,  sensor_h:4.20,  focal_length:4.04, focal_length_eq:26, confidence:"✓" }, // [✓] 1/2.55" 1.4µm; 26mm
  { brand:"Samsung", label:"Galaxy J3 Pro",            sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 8MP, no format
  { brand:"Samsung", label:"Galaxy C7",                sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 16MP, no format
  { brand:"Samsung", label:"Galaxy C5",                sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 16MP, no format
  { brand:"Samsung", label:"Galaxy A9 Pro (2016)",     sensor_w:4.57,  sensor_h:3.43,  focal_length:3.30, focal_length_eq:26, confidence:"?" }, // [?] 1/2.8" confirmed; focal_eq unknown
  { brand:"Samsung", label:"Galaxy J7 (2016)",         sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 13MP, no format
  { brand:"Samsung", label:"Galaxy J5 (2016)",         sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 13MP, no format
  { brand:"Samsung", label:"Galaxy S7 edge",           sensor_w:5.60,  sensor_h:4.20,  focal_length:4.04, focal_length_eq:26, confidence:"✓" }, // [✓] 1/2.55" 1.4µm; 26mm
  { brand:"Samsung", label:"Galaxy S7",                sensor_w:5.60,  sensor_h:4.20,  focal_length:4.04, focal_length_eq:26, confidence:"✓" }, // [✓] 1/2.55" 1.4µm; 26mm
  { brand:"Samsung", label:"Galaxy J1 (2016)",         sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 5MP, no format
  { brand:"Samsung", label:"Galaxy A9 (2016)",         sensor_w:4.13,  sensor_h:3.10,  focal_length:3.21, focal_length_eq:28, confidence:"✓" }, // [✓] 1/3.1" 1.12µm; 28mm
  { brand:"Samsung", label:"Galaxy A7 (2016)",         sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 13MP, no format
  { brand:"Samsung", label:"Galaxy A5 (2016)",         sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 13MP, no format
  { brand:"Samsung", label:"Galaxy A3 (2016)",         sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 13MP, no format
  { brand:"Samsung", label:"Galaxy Express Prime",     sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 5MP, no format
  { brand:"Samsung", label:"Galaxy J3 (2016)",         sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 8MP, no format
  { brand:"Samsung", label:"Galaxy On7",               sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 13MP, no format
  { brand:"Samsung", label:"Galaxy On5",               sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 8MP, no format
  { brand:"Samsung", label:"Galaxy Note5",             sensor_w:4.92,  sensor_h:3.69,  focal_length:3.83, focal_length_eq:28, confidence:"✓" }, // [✓] 1/2.6" 1.12µm; 28mm
  { brand:"Samsung", label:"Galaxy S6 edge+",          sensor_w:4.92,  sensor_h:3.69,  focal_length:3.83, focal_length_eq:28, confidence:"✓" }, // [✓] 1/2.6" 1.12µm; 28mm
  { brand:"Samsung", label:"Galaxy S5 Neo",            sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 16MP, no format
  { brand:"Samsung", label:"Galaxy S4 mini I9195I",    sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 8MP, no format
  { brand:"Samsung", label:"Galaxy A8 Duos",           sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 16MP 31mm, no format
  { brand:"Samsung", label:"Galaxy A8 (2015)",         sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 16MP 31mm, no format
  { brand:"Samsung", label:"Galaxy J7 Nxt",            sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 13MP, no format
  { brand:"Samsung", label:"Galaxy J7",                sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 13MP, no format
  { brand:"Samsung", label:"Galaxy J5",                sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 13MP, no format
  { brand:"Samsung", label:"Galaxy S6 active",         sensor_w:4.92,  sensor_h:3.69,  focal_length:3.83, focal_length_eq:28, confidence:"✓" }, // [✓] 1/2.6" 1.12µm; 28mm
  { brand:"Samsung", label:"Galaxy XCover 3",          sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 5MP, no format
  { brand:"Samsung", label:"Galaxy S6 edge",           sensor_w:4.92,  sensor_h:3.69,  focal_length:3.83, focal_length_eq:28, confidence:"✓" }, // [✓] 1/2.6" 1.12µm; 28mm
  { brand:"Samsung", label:"Galaxy S6",                sensor_w:4.92,  sensor_h:3.69,  focal_length:3.83, focal_length_eq:28, confidence:"✓" }, // [✓] 1/2.6" 1.12µm; 28mm
  { brand:"Samsung", label:"Galaxy J1",                sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 5MP, no format
  { brand:"Samsung", label:"Galaxy A7 Duos",           sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 13MP, no format
  { brand:"Samsung", label:"Galaxy A7 (2015)",         sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 13MP, no format
  { brand:"Samsung", label:"Galaxy Grand Max",         sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 13MP, no format
  { brand:"Samsung", label:"Galaxy E7",                sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 13MP, no format
  { brand:"Samsung", label:"Galaxy E5",                sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 8MP, no format
  { brand:"Samsung", label:"Galaxy Core Prime",        sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 5MP, no format
  { brand:"Samsung", label:"Galaxy A5 Duos",           sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 13MP, no format
  { brand:"Samsung", label:"Galaxy A5 (2014)",         sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 13MP, no format
  { brand:"Samsung", label:"Galaxy A3 Duos",           sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 8MP, no format
  { brand:"Samsung", label:"Galaxy A3 (2014)",         sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 8MP, no format
  { brand:"Samsung", label:"Galaxy S5 Plus",           sensor_w:4.92,  sensor_h:3.69,  focal_length:3.83, focal_length_eq:28, confidence:"?" }, // [?] 1/2.6" confirmed; focal_eq unknown
  { brand:"Samsung", label:"Galaxy Grand Prime",        sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 8MP, no format
  { brand:"Samsung", label:"Galaxy Note Edge",          sensor_w:4.92,  sensor_h:3.69,  focal_length:4.23, focal_length_eq:31, confidence:"✓" }, // [✓] 1/2.6" 1.12µm; 31mm
  { brand:"Samsung", label:"Galaxy Note4",              sensor_w:4.92,  sensor_h:3.69,  focal_length:4.23, focal_length_eq:31, confidence:"✓" }, // [✓] 1/2.6" 1.12µm; 31mm
  { brand:"Samsung", label:"Galaxy S5 LTE-A G901F",    sensor_w:4.92,  sensor_h:3.69,  focal_length:3.83, focal_length_eq:28, confidence:"?" }, // [?] 1/2.6" confirmed; focal_eq unknown
  { brand:"Samsung", label:"Galaxy S5 mini Duos",      sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 8MP, no format
  { brand:"Samsung", label:"Galaxy S5 mini",           sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 8MP, no format
  { brand:"Samsung", label:"Galaxy S5 Sport",          sensor_w:4.92,  sensor_h:3.69,  focal_length:3.83, focal_length_eq:28, confidence:"?" }, // [?] 1/2.6" confirmed; focal_eq unknown
  { brand:"Samsung", label:"Galaxy S5 LTE-A G906S",   sensor_w:4.92,  sensor_h:3.69,  focal_length:3.83, focal_length_eq:28, confidence:"?" }, // [?] 1/2.6" confirmed; focal_eq unknown
  { brand:"Samsung", label:"Galaxy S5 Active",         sensor_w:4.92,  sensor_h:3.69,  focal_length:4.23, focal_length_eq:31, confidence:"~" }, // [~] S5-family 1/2.6" inferred; 31mm listed
  { brand:"Samsung", label:"Galaxy S5",                sensor_w:4.92,  sensor_h:3.69,  focal_length:4.23, focal_length_eq:31, confidence:"✓" }, // [✓] 1/2.6" 1.12µm; 31mm
  { brand:"Samsung", label:"Galaxy Note3 Neo Duos",    sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 8MP, no format
  { brand:"Samsung", label:"Galaxy Note3 Neo",          sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 8MP, no format
  { brand:"Samsung", label:"Galaxy S4 Active LTE-A",   sensor_w:4.13,  sensor_h:3.10,  focal_length:3.56, focal_length_eq:31, confidence:"✓" }, // [✓] 1/3.1" 1.14µm; 31mm
  { brand:"Samsung", label:"Galaxy S4 (I9506)",        sensor_w:4.13,  sensor_h:3.10,  focal_length:3.56, focal_length_eq:31, confidence:"✓" }, // [✓] 1/3.1" 1.14µm; 31mm
  { brand:"Samsung", label:"Galaxy Note3",              sensor_w:4.13,  sensor_h:3.10,  focal_length:3.56, focal_length_eq:31, confidence:"✓" }, // [✓] 1/3.1" 1.12µm; 31mm
  { brand:"Samsung", label:"Galaxy S4 mini",            sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 8MP, no format
  { brand:"Samsung", label:"Galaxy S4 Active",          sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 8MP, no format
  { brand:"Samsung", label:"Galaxy S4 (I9505)",        sensor_w:4.13,  sensor_h:3.10,  focal_length:3.56, focal_length_eq:31, confidence:"✓" }, // [✓] 1/3.1" 1.14µm; 31mm
  { brand:"Samsung", label:"Galaxy S4 (I9500)",        sensor_w:4.13,  sensor_h:3.10,  focal_length:3.56, focal_length_eq:31, confidence:"✓" }, // [✓] 1/3.1" 1.14µm; 31mm
  { brand:"Samsung", label:"Galaxy S4 Duos (I9502)",   sensor_w:4.13,  sensor_h:3.10,  focal_length:3.56, focal_length_eq:31, confidence:"✓" }, // [✓] 1/3.1" 1.14µm; 31mm
  { brand:"Samsung", label:"Galaxy S4 CDMA",           sensor_w:4.13,  sensor_h:3.10,  focal_length:3.56, focal_length_eq:31, confidence:"✓" }, // [✓] 1/3.1" 1.14µm; 31mm
  { brand:"Samsung", label:"Galaxy A20s",              sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 13MP, no format
  { brand:"Samsung", label:"Galaxy S3 (2012)",           sensor_w:4.54,  sensor_h:3.42,  focal_length:4.41, focal_length_eq:35, confidence:"~" }, // [~] 1/3.2"; 35mm
  { brand:"Samsung", label:"Galaxy S2 (2011)",           sensor_w:4.54,  sensor_h:3.42,  focal_length:3.66, focal_length_eq:29, confidence:"~" }, // [~] 1/3.2"; 29mm
  { brand:"Samsung", label:"Galaxy S (2010)",            sensor_w:4.54,  sensor_h:3.42,  focal_length:4.41, focal_length_eq:35, confidence:"~" }, // [~] 1/3.2"; 35mm

  // ── GOOGLE ───────────────────────────────────────────────────────────────
  // GN1/GN9 sensor family (50 MP, 1/1.31", 1.2 µm, 25mm): EXIF confirmed on Pixel 7 → 9.78 mm; Pixel 9+ pixel math → 9.80 mm
  { brand:"Google", label:"Pixel 10 Pro XL / 10 Pro",  sensor_w:9.80,  sensor_h:7.35,  focal_length:6.81, focal_length_eq:25, confidence:"✓" }, // [✓] 1/1.31" 1.2µm; 25mm
  { brand:"Google", label:"Pixel 10",                  sensor_w:6.40,  sensor_h:4.80,  focal_length:4.44, focal_length_eq:25, confidence:"✓" }, // [✓] 1/2.0"; 25mm
  { brand:"Google", label:"Pixel 10a",                 sensor_w:6.40,  sensor_h:4.80,  focal_length:4.44, focal_length_eq:25, confidence:"✓" }, // [✓] 1/2.0"; 25mm
  { brand:"Google", label:"Pixel 9 Pro / 9 Pro XL",    sensor_w:9.80,  sensor_h:7.35,  focal_length:6.81, focal_length_eq:25, confidence:"✓" }, // [✓] 1/1.31" 1.2µm; 25mm
  { brand:"Google", label:"Pixel 9",                   sensor_w:9.80,  sensor_h:7.35,  focal_length:6.81, focal_length_eq:25, confidence:"✓" }, // [✓] 1/1.31" 1.2µm; 25mm
  { brand:"Google", label:"Pixel 9 Pro Fold",          sensor_w:6.40,  sensor_h:4.80,  focal_length:4.44, focal_length_eq:25, confidence:"✓" }, // [✓] 1/2.0"; 25mm
  { brand:"Google", label:"Pixel 9a",                  sensor_w:6.40,  sensor_h:4.80,  focal_length:4.44, focal_length_eq:25, confidence:"✓" }, // [✓] 1/2.0"; 25mm
  { brand:"Google", label:"Pixel 8 Pro",               sensor_w:9.80,  sensor_h:7.35,  focal_length:6.81, focal_length_eq:25, confidence:"✓" }, // [✓] 1/1.31" 1.2µm; 25mm
  { brand:"Google", label:"Pixel 8",                   sensor_w:9.80,  sensor_h:7.35,  focal_length:6.81, focal_length_eq:25, confidence:"✓" }, // [✓] 1/1.31" 1.2µm; 25mm
  { brand:"Google", label:"Pixel 8a",                  sensor_w:7.40,  sensor_h:5.55,  focal_length:5.34, focal_length_eq:26, confidence:"✓" }, // [✓] 1/1.73"; 26mm
  { brand:"Google", label:"Pixel Fold (2023)",         sensor_w:6.40,  sensor_h:4.80,  focal_length:4.44, focal_length_eq:25, confidence:"✓" }, // [✓] 1/2.0"; 25mm
  { brand:"Google", label:"Pixel 7 Pro",               sensor_w:9.78,  sensor_h:7.34,  focal_length:6.81, focal_length_eq:25, confidence:"✓" }, // [✓] 1/1.31" EXIF; 25mm
  { brand:"Google", label:"Pixel 7",                   sensor_w:9.78,  sensor_h:7.34,  focal_length:6.81, focal_length_eq:25, confidence:"✓" }, // [✓] 1/1.31" EXIF; 25mm
  { brand:"Google", label:"Pixel 7a",                  sensor_w:7.40,  sensor_h:5.55,  focal_length:5.34, focal_length_eq:26, confidence:"✓" }, // [✓] 1/1.73"; 26mm
  { brand:"Google", label:"Pixel 6 Pro",               sensor_w:9.78,  sensor_h:7.34,  focal_length:6.81, focal_length_eq:25, confidence:"✓" }, // [✓] 1/1.31"; 25mm
  { brand:"Google", label:"Pixel 6",                   sensor_w:9.78,  sensor_h:7.34,  focal_length:6.81, focal_length_eq:25, confidence:"✓" }, // [✓] 1/1.31"; 25mm
  { brand:"Google", label:"Pixel 6a",                  sensor_w:5.64,  sensor_h:4.23,  focal_length:4.23, focal_length_eq:27, confidence:"✓" }, // [✓] 1/2.55"; 27mm
  { brand:"Google", label:"Pixel 5a (2021)",           sensor_w:5.64,  sensor_h:4.23,  focal_length:4.23, focal_length_eq:27, confidence:"~" }, // [~] IMX363 1/2.55"; 27mm
  { brand:"Google", label:"Pixel 5 (2020)",            sensor_w:5.64,  sensor_h:4.23,  focal_length:4.23, focal_length_eq:27, confidence:"~" }, // [~] IMX363 1/2.55"; 27mm
  { brand:"Google", label:"Pixel 4a / 4a 5G (2020)",  sensor_w:5.64,  sensor_h:4.23,  focal_length:4.23, focal_length_eq:27, confidence:"~" }, // [~] IMX363 1/2.55"; 27mm
  { brand:"Google", label:"Pixel 4 / 4 XL (2019)",    sensor_w:5.64,  sensor_h:4.23,  focal_length:4.23, focal_length_eq:27, confidence:"✓" }, // [✓] 1/2.55"; 27mm
  { brand:"Google", label:"Pixel 3a / 3a XL (2019)",  sensor_w:5.64,  sensor_h:4.23,  focal_length:4.40, focal_length_eq:28, confidence:"~" }, // [~] IMX363; 28mm
  { brand:"Google", label:"Pixel 3 / 3 XL (2018)",    sensor_w:5.64,  sensor_h:4.23,  focal_length:4.40, focal_length_eq:28, confidence:"~" }, // [~] IMX363; 28mm
  { brand:"Google", label:"Pixel 2 / 2 XL (2017)",    sensor_w:5.64,  sensor_h:4.23,  focal_length:4.23, focal_length_eq:27, confidence:"✓" }, // [✓] 1/2.55"; 27mm
  { brand:"Google", label:"Pixel / Pixel XL (2016)",   sensor_w:6.23,  sensor_h:4.67,  focal_length:4.67, focal_length_eq:27, confidence:"~" }, // [~] IMX378 1/2.3"; 27mm
  { brand:"Google",  label:"Nexus 6P (2015)",            sensor_w:6.23,  sensor_h:4.67,  focal_length:4.67, focal_length_eq:27, confidence:"~" }, // [~] IMX377 1/2.3"; 27mm
  { brand:"Google",  label:"Nexus 5X (2015)",            sensor_w:6.25,  sensor_h:4.69,  focal_length:4.51, focal_length_eq:26, confidence:"✓" }, // [✓] 12.3MP 1/2.3" 1.55µm pixel math; 26mm

  // ── HONOR ────────────────────────────────────────────────────────────────
  { brand:"Honor", label:"Magic6 Pro / Magic6 RSR PD / Magic6 Ultimate / Magic7 RSR PD / Magic8 Pro / Magic8 Pro Air / Magic8 RSR PD (2024–2026)", sensor_w:9.80, sensor_h:7.35, focal_length:6.26, focal_length_eq:23, confidence:"✓" }, // [✓] 50MP 1/1.3" 1.2µm; 23mm (PD = Porsche Design)
  { brand:"Honor", label:"Magic7 Pro (2024)",            sensor_w:9.80,  sensor_h:7.35,  focal_length:6.53, focal_length_eq:24, confidence:"✓" }, // [✓] 50MP 1/1.3" 1.2µm; 24mm
  { brand:"Honor", label:"Magic V Flip 2 (2025)",        sensor_w:9.80,  sensor_h:7.35,  focal_length:6.81, focal_length_eq:25, confidence:"?" }, // [?] 200MP 1/1.3" 0.6µm pixel math; focal_eq estimated
  { brand:"Honor", label:"Magic V / Magic3 Pro / Magic4 Pro / Magic V Flip / Magic V3 / Magic V5 / Magic V6 (2021–2026)", sensor_w:8.17, sensor_h:6.13, focal_length:5.22, focal_length_eq:23, confidence:"✓" }, // [✓] 50MP 1/1.56" 1.0µm; 23mm (Magic V: no sensor data in spec — inferred from Magic3 Pro/Magic4 Pro same config)
  { brand:"Honor", label:"90 GT / 100 Pro (2023)",       sensor_w:8.17,  sensor_h:6.13,  focal_length:6.13, focal_length_eq:27, confidence:"✓" }, // [✓] 50MP 1/1.56" 1.0µm; 27mm (confirmed on 100 Pro; 90 GT same sensor)
  { brand:"Honor", label:"Magic Vs2 (2023)",             sensor_w:8.17,  sensor_h:6.13,  focal_length:5.67, focal_length_eq:25, confidence:"~" }, // [~] 50MP; 25mm confirmed; sensor_w estimated (no format in spec)
  { brand:"Honor", label:"Win / Win RT / 300 Ultra / 300 Pro / GT Pro / Magic Vs3 (2023–2025)", sensor_w:8.17, sensor_h:6.13, focal_length:5.22, focal_length_eq:23, confidence:"~" }, // [~] 50MP 1/1.56" 1.0µm; focal_eq inferred from Magic V3/V5/V6 (same sensor)
  { brand:"Honor", label:"Magic6 Lite / Magic7 Lite / Magic8 Lite / 400 Lite (2023–2025)", sensor_w:7.68, sensor_h:5.76, focal_length:5.12, focal_length_eq:24, confidence:"~" }, // [~] 108MP 1/1.67"; focal_eq 24mm confirmed on Magic8 Lite; sensor_w from format
  { brand:"Honor", label:"90 Pro / 500 Pro (China) / 400 Pro / 400 (2023–2025)", sensor_w:9.14, sensor_h:6.86, focal_length:6.09, focal_length_eq:24, confidence:"~" }, // [~] 200MP 1/1.4" 0.56µm; focal_eq inferred from 600 Pro (same sensor)
  { brand:"Honor", label:"600 Pro (2026)",               sensor_w:9.14,  sensor_h:6.86,  focal_length:6.09, focal_length_eq:24, confidence:"✓" }, // [✓] 200MP 1/1.4" 0.56µm pixel math+format; 24mm
  { brand:"Honor", label:"Magic5 Pro / Magic5 Ultimate / Magic4 Ultimate (2022–2023)", sensor_w:11.43, sensor_h:8.57, focal_length:7.30, focal_length_eq:23, confidence:"✓" }, // [✓] 50MP 1/1.12" 1.4µm pixel math+format; 23mm
  { brand:"Honor", label:"70 Pro+ / 80 GT / Magic Vs / Magic Vs Ultimate (2022)", sensor_w:8.49, sensor_h:6.37, focal_length:6.37, focal_length_eq:27, confidence:"~" }, // [~] 54MP 1/1.49" 1.0µm pixel math; 27mm confirmed on Magic Vs/Vs Ultimate; 70 Pro+/80 GT same sensor, focal_eq inferred
  { brand:"Honor", label:"80 Pro / 80 Pro Flat (2022–2023)", sensor_w:8.17, sensor_h:6.13, focal_length:5.45, focal_length_eq:24, confidence:"?" }, // [?] 160MP 1/1.56"; focal_eq estimated; sensor_w from format (stated 0.75µm pixel conflicts with format)
  { brand:"Honor", label:"Magic3 Pro+ / 30 Pro+ (2020–2021)", sensor_w:9.96, sensor_h:7.47, focal_length:6.36, focal_length_eq:23, confidence:"✓" }, // [✓] 50MP 1/1.28" 1.22µm pixel math; 23mm
  { brand:"Honor", label:"V30 / V30 Pro / View30 / View30 Pro / 30 / 30 Pro / Play4 Pro (2019–2020)", sensor_w:7.53, sensor_h:5.65, focal_length:5.65, focal_length_eq:27, confidence:"~" }, // [~] 40MP 1/1.7"; 27mm confirmed; sensor_w from format (no pixel size in spec)
  { brand:"Honor", label:"View 20 (2018)",                   sensor_w:6.40,  sensor_h:4.80,  focal_length:4.80, focal_length_eq:27, confidence:"?" }, // [?] 48MP 1/2.0" 0.8µm pixel math+format; focal_eq estimated (no main cam focal_eq in spec)
  { brand:"Honor", label:"V8 / Honor 9 (2016–2017)",          sensor_w:5.00,  sensor_h:3.75,  focal_length:3.75, focal_length_eq:27, confidence:"✓" }, // [✓] 12MP 1/2.9" 1.25µm pixel math; 27mm (V8 confirms sensor; Honor 9 same config)
  { brand:"Honor", label:"Honor 8 (2016)",                   sensor_w:5.00,  sensor_h:3.75,  focal_length:4.86, focal_length_eq:35, confidence:"✓" }, // [✓] 12MP 1/2.9" 1.25µm pixel math; 35mm
  { brand:"Honor", label:"Honor 7 (2015)",                   sensor_w:5.33,  sensor_h:4.00,  focal_length:4.00, focal_length_eq:27, confidence:"~" }, // [~] 20MP 1/2.4"; 27mm confirmed; sensor_w from format (no pixel size in spec)

  // ── ONEPLUS ──────────────────────────────────────────────────────────────
  { brand:"OnePlus", label:"OnePlus 12 / 13 (2023–2024)",             sensor_w:9.14,  sensor_h:6.86,  focal_length:5.84, focal_length_eq:23, confidence:"✓" }, // [✓] 50MP 1/1.43" 1.12µm pixel math; 23mm
  { brand:"OnePlus", label:"Ace 6 Ultra (2026)",                       sensor_w:8.17,  sensor_h:6.13,  focal_length:5.22, focal_length_eq:23, confidence:"~" }, // [~] 50MP 1/1.55" 23mm; pixel pitch not listed; assumed 1.0µm
  { brand:"OnePlus", label:"OnePlus 10 Pro (2022)",     sensor_w:8.96,  sensor_h:6.72,  focal_length:5.72, focal_length_eq:23, confidence:"~" }, // [~] IMX789 1/1.43"; 23mm
  { brand:"OnePlus", label:"OnePlus 9 Pro (2021)",      sensor_w:8.96,  sensor_h:6.72,  focal_length:5.72, focal_length_eq:23, confidence:"~" }, // [~] IMX789 1/1.43"; 23mm
  { brand:"OnePlus", label:"OnePlus 9 (2021)",          sensor_w:8.96,  sensor_h:6.72,  focal_length:5.72, focal_length_eq:23, confidence:"~" }, // [~] IMX689 1/1.43" 1.12µm; 23mm
  { brand:"OnePlus", label:"Open (2023)",                              sensor_w:8.96,  sensor_h:6.72,  focal_length:5.97, focal_length_eq:24, confidence:"✓" }, // [✓] 48MP 1/1.43" 1.12µm pixel math; 24mm
  { brand:"OnePlus", label:"9RT / 10T / Ace Pro / 11 / Ace 2 / 11R / Ace 2 Pro / Ace 3 / Ace 3 Pro / 12R / Ace 5 / Ace 5 Pro / Ace 5 Ultra / 13R / 13s / 13T / 15 / 15R / 15T / Ace 6T (2021–2026)", sensor_w:8.17, sensor_h:6.13, focal_length:5.45, focal_length_eq:24, confidence:"✓" }, // [✓] 50MP 1/1.56" 1.0µm; 24mm
  { brand:"OnePlus", label:"Ace 6 (2025)",                             sensor_w:8.17,  sensor_h:6.13,  focal_length:5.45, focal_length_eq:24, confidence:"~" }, // [~] 50MP 24mm; no sensor format in spec; inferred 1/1.56" 1.0µm from SD 8 Elite family
  { brand:"OnePlus", label:"OnePlus 8T / 8 (2020)",     sensor_w:6.40,  sensor_h:4.80,  focal_length:4.27, focal_length_eq:24, confidence:"~" }, // [~] IMX586 1/2"; 24mm
  { brand:"OnePlus", label:"OnePlus 5 (2017)",          sensor_w:5.17,  sensor_h:3.88,  focal_length:3.45, focal_length_eq:24, confidence:"✓" }, // [✓] 16MP 1/2.8" 1.12µm pixel math; 24mm
  { brand:"OnePlus", label:"OnePlus 8 Pro (2020)",      sensor_w:8.96,  sensor_h:6.72,  focal_length:6.22, focal_length_eq:25, confidence:"✓" }, // [✓] 48MP 1/1.43" 1.12µm pixel math; 25mm
  { brand:"OnePlus", label:"OnePlus 6 / 6T (2018)",     sensor_w:5.64,  sensor_h:4.23,  focal_length:3.92, focal_length_eq:25, confidence:"✓" }, // [✓] IMX519 1/2.6" 1.22µm pixel math; 25mm
  { brand:"OnePlus", label:"Ace 5 Racing (2025)",        sensor_w:6.53,  sensor_h:4.90,  focal_length:4.72, focal_length_eq:26, confidence:"✓" }, // [✓] 50MP 1/1.95" 0.8µm pixel math; 26mm
  { brand:"OnePlus", label:"OnePlus 9R / 7 Pro / 7T (2019–2021)", sensor_w:6.40, sensor_h:4.80, focal_length:4.62, focal_length_eq:26, confidence:"~" }, // [~] IMX586 1/2" 0.8µm; 26mm (9R: 48MP ✓; 7 Pro/7T: ~)
  { brand:"OnePlus", label:"OnePlus 7 (2019)",          sensor_w:5.64,  sensor_h:4.23,  focal_length:4.07, focal_length_eq:26, confidence:"~" }, // [~] IMX519 1/2.55"; 26mm
  { brand:"OnePlus", label:"OnePlus 3 / 3T (2016)",     sensor_w:5.17,  sensor_h:3.88,  focal_length:3.73, focal_length_eq:26, confidence:"~" }, // [~] IMX298 1/2.8" 1.12µm pixel math; focal_eq ~26mm
  { brand:"OnePlus", label:"OnePlus 5T (2017)",         sensor_w:5.17,  sensor_h:3.88,  focal_length:3.88, focal_length_eq:27, confidence:"✓" }, // [✓] 16MP 1/2.8" 1.12µm pixel math; 27mm
  { brand:"OnePlus", label:"OnePlus 2 (2015)",          sensor_w:5.41,  sensor_h:4.06,  focal_length:4.06, focal_length_eq:27, confidence:"~" }, // [~] 13MP 1/2.6" 1.3µm pixel math; focal_eq ~27mm
  { brand:"OnePlus", label:"OnePlus 1 (2014)",          sensor_w:4.66,  sensor_h:3.50,  focal_length:3.63, focal_length_eq:28, confidence:"~" }, // [~] 13MP 1/3.1" 1.12µm pixel math; focal_eq ~28mm

  // ── OPPO ─────────────────────────────────────────────────────────────────
  { brand:"Oppo", label:"Find X6 Pro / Find X7 Ultra / Find X8 Ultra (2023–2025)", sensor_w:13.06, sensor_h:9.80, focal_length:8.34, focal_length_eq:23, confidence:"✓" }, // [✓] 50MP 1.0"-type (IMX989) 1.6µm pixel math; 23mm
  { brand:"Oppo", label:"Find X9 Ultra (2026)",              sensor_w:11.43, sensor_h:8.57,  focal_length:7.30, focal_length_eq:23, confidence:"✓" }, // [✓] 200MP 1/1.12"; 23mm (no pixel size; sensor_w from format; ~0.70µm implied)
  { brand:"Oppo", label:"Find X9 Pro (2025)",                sensor_w:9.96,  sensor_h:7.47,  focal_length:6.36, focal_length_eq:23, confidence:"✓" }, // [✓] 50MP 1/1.28" 1.22µm pixel math; 23mm
  { brand:"Oppo", label:"Find X8 Pro / Find X9 / Find X9s Pro (2024–2026)", sensor_w:9.14, sensor_h:6.86, focal_length:5.84, focal_length_eq:23, confidence:"✓" }, // [✓] 50MP 1/1.4" 1.12µm; 23mm
  { brand:"Oppo", label:"Find N3 (2023)",                    sensor_w:8.96,  sensor_h:6.72,  focal_length:5.97, focal_length_eq:24, confidence:"✓" }, // [✓] 48MP 1/1.43" 1.12µm pixel math; 24mm
  { brand:"Oppo", label:"Find X2 Pro (2020)",                sensor_w:8.96,  sensor_h:6.72,  focal_length:6.22, focal_length_eq:25, confidence:"✓" }, // [✓] 48MP 1/1.43" 1.12µm pixel math; 25mm
  { brand:"Oppo", label:"Find N2 Flip / Find X7 / Find N6 (2022–2026)", sensor_w:8.17, sensor_h:6.13, focal_length:5.22, focal_length_eq:23, confidence:"✓" }, // [✓] 50MP-200MP 1/1.56" 23mm; N6 pixel math confirms sensor_w
  { brand:"Oppo", label:"Find N5 (2025)",                    sensor_w:8.17,  sensor_h:6.13,  focal_length:4.77, focal_length_eq:21, confidence:"~" }, // [~] 50MP 1/1.56" 21mm; pixel size inferred; foldable
  { brand:"Oppo", label:"Reno5 Pro+ 5G / Find X3 Neo / Reno6 Pro+ 5G / Reno6 Pro 5G (SD) / Find N / K10 Pro / Find X5 / Find N2 / Reno9 Pro+ / Reno10 Pro+ / Find X6 / Find N3 Flip / Reno11 Pro (China) / Reno12 Pro (China) / Find X8 / Find X8s / Find X8s+ / Find X9s (2020–2026)", sensor_w:8.17, sensor_h:6.13, focal_length:5.45, focal_length_eq:24, confidence:"✓" }, // [✓] 50MP 1/1.56" 1.0µm pixel math; 24mm
  { brand:"Oppo", label:"Find X5 Pro (2022)",                sensor_w:8.17,  sensor_h:6.13,  focal_length:5.67, focal_length_eq:25, confidence:"✓" }, // [✓] 50MP 1/1.56" 1.0µm; 25mm
  { brand:"Oppo", label:"Find X3 / Find X3 Pro (2021)",      sensor_w:8.17,  sensor_h:6.13,  focal_length:5.90, focal_length_eq:26, confidence:"✓" }, // [✓] 50MP 1/1.56" 1.0µm; 26mm
  { brand:"Oppo", label:"Reno Ace / Reno 5G / Reno 10x zoom / Ace2 / Find X2 (2019–2020)", sensor_w:6.40, sensor_h:4.80, focal_length:4.62, focal_length_eq:26, confidence:"✓" }, // [✓] 48MP 1/2.0" 0.8µm pixel math; 26mm
  { brand:"Oppo", label:"N3 (2014)",                          sensor_w:6.19,  sensor_h:4.64,  focal_length:4.81, focal_length_eq:28, confidence:"?" }, // [?] 16MP 1/2.3" 1.34µm pixel math; focal_eq estimated 28mm
  { brand:"Oppo", label:"Find X / Find X Lamborghini (2018)", sensor_w:5.64,  sensor_h:4.23,  focal_length:3.60, focal_length_eq:23, confidence:"~" }, // [~] 16MP 1/2.6" 1.22µm; pixel math 5.64mm; format gives 4.92mm — conflict
  { brand:"Oppo", label:"Find 7 / Find 7a (2014)",            sensor_w:4.27,  sensor_h:3.20,  focal_length:3.32, focal_length_eq:28, confidence:"?" }, // [?] 13MP 1/3.0" format only; focal_eq estimated 28mm

  // ── REALME ───────────────────────────────────────────────────────────────
  { brand:"Realme", label:"GT 8 Pro (2025)",                            sensor_w:8.17,  sensor_h:6.13,  focal_length:4.99, focal_length_eq:22, confidence:"✓" }, // [✓] 50MP 1/1.56" 1.0µm; 22mm
  { brand:"Realme", label:"GT5 Pro (2023)",                             sensor_w:9.14,  sensor_h:6.86,  focal_length:5.84, focal_length_eq:23, confidence:"✓" }, // [✓] 50MP 1/1.43" 1.12µm pixel math; 23mm
  { brand:"Realme", label:"16 Pro+ (2026)",                             sensor_w:8.17,  sensor_h:6.13,  focal_length:5.22, focal_length_eq:23, confidence:"✓" }, // [✓] 200MP 1/1.56" 0.5µm pixel math; 23mm
  { brand:"Realme", label:"GT 7 Pro / GT7 Pro Racing / 13 Pro+ / P3 Ultra / Neo8 / GT 7T / 15 Pro / P4 Pro (2024–2026)", sensor_w:8.17, sensor_h:6.13, focal_length:5.45, focal_length_eq:24, confidence:"✓" }, // [✓] 50MP 1/1.56" 1.0µm; 24mm
  { brand:"Realme", label:"GT5 / GT5 240W / GT Neo 5 / GT Neo 5 240W / GT3 (2023)",  sensor_w:8.17,  sensor_h:6.13,  focal_length:5.45, focal_length_eq:24, confidence:"✓" }, // [✓] 50MP 1/1.56" 1.0µm; 24mm
  { brand:"Realme", label:"GT2 Pro / GT2 / GT2 Explorer Master / GT Neo 3 / GT Neo 3 150W / GT Explorer Master (2021–2022)", sensor_w:8.17, sensor_h:6.13, focal_length:5.45, focal_length_eq:24, confidence:"✓" }, // [✓] 50MP 1/1.56" 1.0µm; 24mm
  { brand:"Realme", label:"GT 7 (2025)",                                sensor_w:8.17,  sensor_h:6.13,  focal_length:5.45, focal_length_eq:24, confidence:"~" }, // [~] 50MP 1/1.56" 1.0µm; focal_eq not listed in spec; estimated 24mm from GT7T/GT7 Pro/15 Pro family
  { brand:"Realme", label:"GT Neo5 SE (2023)",                          sensor_w:6.47,  sensor_h:4.85,  focal_length:4.49, focal_length_eq:25, confidence:"~" }, // [~] 64MP 1/2.0" 25mm; pixel pitch not listed; 0.7µm inferred (typical 64MP 1/2.0" e.g. Samsung GW3)
  { brand:"Realme", label:"X50 Pro Player (2020)",                      sensor_w:6.40,  sensor_h:4.80,  focal_length:4.62, focal_length_eq:26, confidence:"✓" }, // [✓] 48MP 1/2.0" 0.8µm pixel math; 26mm
  { brand:"Realme", label:"X7 Pro Ultra (2021)",                        sensor_w:6.47,  sensor_h:4.85,  focal_length:4.67, focal_length_eq:26, confidence:"✓" }, // [✓] 64MP 1/2.0" 0.7µm pixel math; 26mm
  { brand:"Realme", label:"X2 Pro / X3 / X3 SuperZoom / X50 Pro 5G / GT 5G / GT Neo / GT Neo Flash / X7 Max 5G / X7 Pro / GT Neo2 (2019–2021)", sensor_w:7.39, sensor_h:5.54, focal_length:5.34, focal_length_eq:26, confidence:"✓" }, // [✓] 64MP 1/1.72–1.73" 0.8µm pixel math; 26mm
  { brand:"Realme", label:"Neo7 SE / Neo7 Turbo / 13 Pro (2024–2025)", sensor_w:6.53,  sensor_h:4.90,  focal_length:4.72, focal_length_eq:26, confidence:"✓" }, // [✓] 50MP 1/1.95" 0.8µm pixel math; 26mm (Neo7 SE/Turbo/13 Pro all confirm 0.8µm)
  { brand:"Realme", label:"Neo7 / GT Neo6 SE (2023–2024)",              sensor_w:6.53,  sensor_h:4.90,  focal_length:4.72, focal_length_eq:26, confidence:"~" }, // [~] 50MP 1/1.95" 26mm; pixel pitch not listed in spec; inferred 0.8µm from Neo7 SE/Turbo/13 Pro cluster
  { brand:"Realme", label:"GT 6 (2024)",                                sensor_w:9.68,  sensor_h:7.26,  focal_length:6.18, focal_length_eq:23, confidence:"?" }, // [?] 50MP 1/1.4" (pixel pitch not listed; sensor_w from format); focal_eq not listed; estimated 23mm

  // ── NOTHING ──────────────────────────────────────────────────────────────
  { brand:"Nothing", label:"Phone (3) (2025)",             sensor_w:9.80,  sensor_h:7.35,  focal_length:6.53, focal_length_eq:24, confidence:"✓" }, // [✓] OmniVision OV50H 50MP 1/1.3" 1.2µm pixel math; 24mm
  { brand:"Nothing", label:"Phone (1) / (2) (2022–2023)",  sensor_w:8.17,  sensor_h:6.13,  focal_length:5.45, focal_length_eq:24, confidence:"✓" }, // [✓] 50MP 1/1.56" 1.0µm; 24mm

  // ── VIVO ─────────────────────────────────────────────────────────────────
  { brand:"vivo", label:"X100 Ultra / X100 Pro / X90 Pro+ / X90 Pro (2022–2024)", sensor_w:13.06, sensor_h:9.80,  focal_length:8.34, focal_length_eq:23, confidence:"✓" }, // [✓] IMX989 1" 1.6µm pixel math; 23mm
  { brand:"vivo", label:"X200 Pro (2024)",                                         sensor_w:9.96,  sensor_h:7.47,  focal_length:6.36, focal_length_eq:23, confidence:"✓" }, // [✓] LYT-818 1/1.28" 1.22µm pixel math; 23mm
  { brand:"vivo", label:"X60 Pro+ / X70 Pro+ / X80 Pro (2021–2022)",              sensor_w:9.80,  sensor_h:7.35,  focal_length:6.26, focal_length_eq:23, confidence:"~" }, // [~] Samsung GN1/GNV 1/1.3" 1.2µm pixel math; focal_eq ~23mm (not in spec)
  { brand:"vivo", label:"X200 Ultra (2025)",                                       sensor_w:9.96,  sensor_h:7.47,  focal_length:9.68, focal_length_eq:35, confidence:"✓" }, // [✓] 1/1.28" 1.22µm pixel math; 35mm — main camera at standard focal length

  // ── HTC ──────────────────────────────────────────────────────────────────
  { brand:"HTC",     label:"U11 / U11+ / U12+ (2017–2018)", sensor_w:5.60, sensor_h:4.20,  focal_length:4.04, focal_length_eq:26, confidence:"~" }, // [~] 12MP 1/2.55" 1.4µm; focal_eq ~26mm
  { brand:"HTC",     label:"10 (2016) / U Ultra (2017)",  sensor_w:6.20,  sensor_h:4.65,  focal_length:4.48, focal_length_eq:26, confidence:"✓" }, // [✓] 12MP 1/2.3" 1.55µm pixel math; 26mm
  { brand:"HTC",     label:"Butterfly 3 (2015)",           sensor_w:4.64,  sensor_h:3.48,  focal_length:3.61, focal_length_eq:28, confidence:"~" }, // [~] 20.2MP 28mm confirmed; no sensor format
  { brand:"HTC",     label:"One M9+ (2015)",             sensor_w:6.20,  sensor_h:4.65,  focal_length:4.82, focal_length_eq:28, confidence:"✓" }, // [✓] 20MP 1/2.4" 1.2µm pixel math; 28mm
  { brand:"HTC",     label:"One M9 (2015)",              sensor_w:5.54,  sensor_h:4.16,  focal_length:4.31, focal_length_eq:28, confidence:"~" }, // [~] 1/2.6"; 28mm
  { brand:"HTC",     label:"One M8s (2015)",             sensor_w:4.64,  sensor_h:3.48,  focal_length:3.61, focal_length_eq:28, confidence:"~" }, // [~] 13MP 28mm confirmed; no sensor format
  { brand:"HTC",     label:"One M8 (2014)",              sensor_w:5.29,  sensor_h:3.97,  focal_length:3.82, focal_length_eq:26, confidence:"~" }, // [~] 2.0µm; 26mm
  { brand:"HTC",     label:"One M7 (2013)",              sensor_w:5.29,  sensor_h:3.97,  focal_length:3.82, focal_length_eq:26, confidence:"~" }, // [~] 2.0µm; 26mm
  { brand:"HTC",     label:"One X (2012)",               sensor_w:4.54,  sensor_h:3.42,  focal_length:3.53, focal_length_eq:28, confidence:"~" }, // [~] 1/3.2"; 28mm
  { brand:"HTC",     label:"Sensation (2011)",           sensor_w:5.54,  sensor_h:4.16,  focal_length:4.31, focal_length_eq:28, confidence:"~" }, // [~] 28mm
  { brand:"HTC",     label:"Desire HD (2010)",           sensor_w:4.54,  sensor_h:3.42,  focal_length:3.53, focal_length_eq:28, confidence:"~" }, // [~] 1/3.2"; 28mm
  { brand:"HTC",     label:"Desire (2010)",              sensor_w:4.54,  sensor_h:3.42,  focal_length:4.41, focal_length_eq:35, confidence:"~" }, // [~] 1/3.2"; 35mm

  // ── NOKIA ────────────────────────────────────────────────────────────────
  { brand:"Nokia",   label:"Nokia 7.2 (2019)",            sensor_w:6.40,  sensor_h:4.80,  focal_length:4.62, focal_length_eq:26, confidence:"~" }, // [~] 48MP 1/2.0" 0.8µm pixel math; focal_eq ~
  { brand:"Nokia",   label:"Nokia 6.2 (2019)",            sensor_w:4.62,  sensor_h:3.47,  focal_length:3.47, focal_length_eq:27, confidence:"~" }, // [~] 16MP 1.0µm pixel math; 27mm confirmed
  { brand:"Nokia",   label:"Nokia 7 Plus (2018)",         sensor_w:5.60,  sensor_h:4.20,  focal_length:3.89, focal_length_eq:25, confidence:"✓" }, // [✓] 12MP 1/2.55" 1.4µm; 25mm Zeiss
  { brand:"Nokia",   label:"Nokia 8 / 8.1 (2017/2018)",  sensor_w:5.54,  sensor_h:4.16,  focal_length:4.00, focal_length_eq:26, confidence:"~" }, // [~] 1/2.6"; 26mm
  { brand:"Nokia",   label:"Nokia 6.1 (2018)",            sensor_w:4.59,  sensor_h:3.44,  focal_length:3.57, focal_length_eq:28, confidence:"✓" }, // [✓] 1/2.8" EXIF; 28mm
  { brand:"Nokia",   label:"Lumia 1020 (2013)",           sensor_w:7.44,  sensor_h:5.58,  focal_length:5.38, focal_length_eq:26, confidence:"~" }, // [~] 1/1.5"; 26mm
  { brand:"Nokia",   label:"Lumia 930 (2014)",            sensor_w:5.76,  sensor_h:4.32,  focal_length:4.16, focal_length_eq:26, confidence:"~" }, // [~] 26mm
  { brand:"Nokia",   label:"Lumia 920 (2012)",            sensor_w:4.80,  sensor_h:3.60,  focal_length:3.73, focal_length_eq:28, confidence:"~" }, // [~] 1/3"; 28mm
  { brand:"Nokia",   label:"N8 (2010)",                   sensor_w:7.00,  sensor_h:5.25,  focal_length:5.44, focal_length_eq:28, confidence:"~" }, // [~] 1/1.83"; 28mm

  // ── XIAOMI ───────────────────────────────────────────────────────────────
  { brand:"Xiaomi", label:"17 Ultra (2026)",             sensor_w:13.2,  sensor_h:8.80,  focal_length:8.43, focal_length_eq:23, confidence:"✓" }, // [✓] 50MP 1.0"-type 1.6µm; 23mm Leica
  { brand:"Xiaomi", label:"17 Max (2026)",               sensor_w:9.14,  sensor_h:6.86,  focal_length:5.84, focal_length_eq:23, confidence:"✓" }, // [✓] 200MP 1/1.4" 0.56µm physical; 23mm Leica
  { brand:"Xiaomi", label:"12 Pro / 17 Pro Max / 17 Pro (2022–2025)", sensor_w:9.96, sensor_h:7.47, focal_length:6.36, focal_length_eq:23, confidence:"✓" }, // [✓] 50MP 1/1.28" 1.22µm; 23mm Leica
  { brand:"Xiaomi", label:"12 Pro (Dim.) / 12S / 12S Pro / 13T / 13T Pro (2022–2023)", sensor_w:9.96, sensor_h:7.47, focal_length:6.64, focal_length_eq:24, confidence:"✓" }, // [✓] 50MP 1/1.28" 1.22µm; 24mm Leica
  { brand:"Xiaomi", label:"14 Pro / 14T Pro / 15 Pro / 15S Pro / 15T Pro / 17 / 17T Pro / K90 Pro Max / Poco F8 Ultra (2023–2026)", sensor_w:9.80, sensor_h:7.35, focal_length:6.26, focal_length_eq:23, confidence:"✓" }, // [✓] 50MP 1/1.31" 1.2µm; 23mm Leica
  { brand:"Xiaomi", label:"14T / K70 Ultra / Mix Flip / Mix Flip 2 / K80 Ultra / 15T / 17T (2024–2026)", sensor_w:8.17, sensor_h:6.13, focal_length:5.22, focal_length_eq:23, confidence:"✓" }, // [✓] 50MP 1/1.55" 1.0µm; 23mm Leica
  { brand:"Xiaomi", label:"K70 / K70 Pro / Poco F6 Pro / K80 / K80 Pro / F7 Pro / F7 Ultra / K90 Max / K90 / F8 Pro (2023–2026)", sensor_w:8.17, sensor_h:6.13, focal_length:5.45, focal_length_eq:24, confidence:"✓" }, // [✓] 50MP 1/1.55" 1.0µm; 24mm
  { brand:"Xiaomi", label:"14 Civi / Civi 4 Pro / Civi 5 Pro (2024–2025)",  sensor_w:8.17,  sensor_h:6.13,  focal_length:5.67, focal_length_eq:25, confidence:"✓" }, // [✓] 50MP 1/1.55" 1.0µm; 25mm Leica
  { brand:"Xiaomi", label:"12T / K50 Ultra (2022)",      sensor_w:7.68,  sensor_h:5.76,  focal_length:5.12, focal_length_eq:24, confidence:"✓" }, // [✓] 108MP 1/1.67" 0.64µm pixel math; 24mm
  { brand:"Xiaomi", label:"Poco F6 / Turbo 3 / F7 / Turbo 4 Pro / X8 Pro Max / X8 Pro / Turbo 5 Max / Turbo 5 (2024–2026)", sensor_w:6.53, sensor_h:4.90, focal_length:4.72, focal_length_eq:26, confidence:"✓" }, // [✓] 50MP 1/1.95" 0.8µm pixel math; 26mm
  { brand:"Xiaomi", label:"K60 / K70E / Poco X6 Pro (2022–2024)", sensor_w:6.47, sensor_h:4.85, focal_length:4.49, focal_length_eq:25, confidence:"✓" }, // [✓] 64MP 1/2.0" 0.7µm pixel math; 25mm
  { brand:"Xiaomi", label:"Xiaomi 15 Ultra (main)",     sensor_w:9.80,  sensor_h:7.35,  focal_length:6.26, focal_length_eq:23, confidence:"~" }, // [~] 1/1.31"; 23mm
  { brand:"Xiaomi", label:"Xiaomi 15 (main)",           sensor_w:7.02,  sensor_h:5.27,  focal_length:4.68, focal_length_eq:24, confidence:"?" }, // [?]
  { brand:"Xiaomi", label:"Xiaomi 14 Ultra (main)",     sensor_w:9.80,  sensor_h:7.35,  focal_length:6.26, focal_length_eq:23, confidence:"~" }, // [~] 1/1.31"; 23mm
  { brand:"Xiaomi", label:"Xiaomi 14 (main)",           sensor_w:7.02,  sensor_h:5.27,  focal_length:4.68, focal_length_eq:24, confidence:"?" }, // [?]
  { brand:"Xiaomi", label:"12S Ultra / 13 Pro / 13 Ultra (2022–2023)", sensor_w:13.2, sensor_h:8.80, focal_length:8.43, focal_length_eq:23, confidence:"✓" }, // [✓] 50MP 1.0"-type 1.6µm; 23mm Leica
  { brand:"Xiaomi", label:"Civi 3 / K60 Ultra / Mix Fold 3 / Mix Fold 4 / 13 (2022–2024)", sensor_w:8.59, sensor_h:6.44, focal_length:5.49, focal_length_eq:23, confidence:"✓" }, // [✓] 50MP 1/1.49" 1.0µm; 23mm Leica
  { brand:"Xiaomi", label:"Mi 11 Pro / Mi 11 Ultra (2021)", sensor_w:11.43, sensor_h:8.57,  focal_length:7.62, focal_length_eq:24, confidence:"✓" }, // [✓] 50MP 1/1.12" 1.4µm pixel math; 24mm
  { brand:"Xiaomi", label:"Mix 4 (2021)",                  sensor_w:9.60,  sensor_h:7.20,  focal_length:6.40, focal_length_eq:24, confidence:"✓" }, // [✓] 108MP 1/1.33" 0.8µm pixel math; 24mm
  { brand:"Xiaomi", label:"Mi 10 Ultra (2020)",            sensor_w:9.60,  sensor_h:7.20,  focal_length:6.67, focal_length_eq:25, confidence:"✓" }, // [✓] 48MP 1/1.32" 1.2µm pixel math; 25mm
  { brand:"Xiaomi", label:"K40 Pro+ / K50 Pro / Mi 11i / Mi 11X Pro / 11T Pro (2021–2022)", sensor_w:8.40, sensor_h:6.30, focal_length:6.07, focal_length_eq:26, confidence:"✓" }, // [✓] 108MP 1/1.52" 0.7µm pixel math; 26mm
  { brand:"Xiaomi", label:"Mi 10T / K30 Pro / K30 Pro Zoom / K40 Pro / K30S / Poco F2 Pro (2020–2021)", sensor_w:7.39, sensor_h:5.54, focal_length:5.34, focal_length_eq:26, confidence:"✓" }, // [✓] 64MP 1/1.7" 0.8µm pixel math; 26mm
  // Xiaomi 12 Pro (2022) — consolidated into "12 Pro / 17 Pro Max / 17 Pro" entry above (1/1.28" 1.22µm 23mm)
  { brand:"Xiaomi", label:"12 (2022)",                  sensor_w:8.17,  sensor_h:6.13,  focal_length:5.90, focal_length_eq:26, confidence:"✓" }, // [✓] 50MP 1/1.56" 1.0µm pixel math; 26mm
  { brand:"Xiaomi", label:"Mi 10 / Mi 10 Pro / Mi 10T Pro / 11 (2020–2021)", sensor_w:9.60, sensor_h:7.20, focal_length:6.93, focal_length_eq:26, confidence:"✓" }, // [✓] 108MP 1/1.33" 0.8µm pixel math; 26mm (Mi 10/10 Pro focal_eq inferred from Mi 10T Pro)
  { brand:"Xiaomi", label:"Mi 9 / Mi 9 Pro / Mi 9 Pro 5G / Mi 9 Explorer (2019)", sensor_w:6.40, sensor_h:4.80, focal_length:4.80, focal_length_eq:27, confidence:"✓" }, // [✓] 48MP 1/2.0" 0.8µm; 27mm
  { brand:"Xiaomi", label:"Mi 9T Pro / K20 Pro / K20 Pro Premium (2019)", sensor_w:6.40, sensor_h:4.80, focal_length:4.62, focal_length_eq:26, confidence:"✓" }, // [✓] 48MP 1/2.0" 0.8µm; 26mm
  { brand:"Xiaomi", label:"Mi 8 / Mi 8 Pro / Mi 8 Explorer / Mi Mix 3 / Mi Mix 3 5G / Poco F1 (2018–2019)", sensor_w:5.64, sensor_h:4.23, focal_length:4.07, focal_length_eq:26, confidence:"~" }, // [~] 12MP IMX363 1/2.55" 1.4µm; 26mm (focal_eq unconfirmed)
  { brand:"Xiaomi", label:"Mi 6 / Mi Mix 2 (2017)",    sensor_w:5.00,  sensor_h:3.75,  focal_length:3.75, focal_length_eq:27, confidence:"✓" }, // [✓] 12MP 1/2.9" 1.25µm pixel math; 27mm (Mi Mix 2 same sensor, focal_eq inferred)
  { brand:"Xiaomi",  label:"Mi 5s (2016)",               sensor_w:6.20,  sensor_h:4.65,  focal_length:4.65, focal_length_eq:27, confidence:"?" }, // [?] 12MP 1/2.3" 1.55µm pixel math; focal_eq estimated
  { brand:"Xiaomi",  label:"Mi Note 2 (2016)",           sensor_w:5.48,  sensor_h:4.11,  focal_length:3.96, focal_length_eq:26, confidence:"?" }, // [?] 22.5MP 1/2.6" 1.0µm pixel math; focal_eq estimated
  { brand:"Xiaomi",  label:"Mi Mix (2016)",              sensor_w:4.62,  sensor_h:3.47,  focal_length:3.34, focal_length_eq:26, confidence:"?" }, // [?] 16MP 1/3.0" 1.0µm pixel math; focal_eq estimated
  { brand:"Xiaomi",  label:"Mi 5s Plus (2016)",          sensor_w:4.66,  sensor_h:3.50,  focal_length:3.62, focal_length_eq:28, confidence:"?" }, // [?] dual 13MP 1/3.1" 1.12µm pixel math; focal_eq estimated
  { brand:"Xiaomi",  label:"Mi 5 (2016)",                sensor_w:5.17,  sensor_h:3.88,  focal_length:4.02, focal_length_eq:28, confidence:"~" }, // [~] 16MP 1/2.8" 1.12µm pixel math; 28mm estimated
  { brand:"Xiaomi",  label:"Mi 4 (2014)",                sensor_w:4.66,  sensor_h:3.50,  focal_length:3.62, focal_length_eq:28, confidence:"~" }, // [~] 13MP 1/3.1" 1.12µm pixel math; 28mm estimated
  { brand:"Xiaomi",  label:"Mi 3 (2013)",                sensor_w:4.54,  sensor_h:3.42,  focal_length:3.53, focal_length_eq:28, confidence:"~" }, // [~] 28mm confirmed; sensor_w estimated (no pixel size in spec)

  // ── HUAWEI ───────────────────────────────────────────────────────────────
  { brand:"Huawei", label:"Mate 80 Pro Max Wind",       sensor_w:4.64,  sensor_h:3.48,  focal_length:3.09, focal_length_eq:24, confidence:"?" }, // [?] 50MP f/1.4-4.0, 24mm; no sensor format
  { brand:"Huawei", label:"Enjoy 90 Pro Max",           sensor_w:8.21,  sensor_h:6.15,  focal_length:5.24, focal_length_eq:23, confidence:"~" }, // [~] 1/1.56" 50MP; focal_eq not listed, 23mm assumed
  { brand:"Huawei", label:"Enjoy 90m Plus",             sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 50MP, no format
  { brand:"Huawei", label:"Enjoy 90 Plus",              sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 50MP, no format
  { brand:"Huawei", label:"Enjoy 90",                   sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 50MP, no format
  { brand:"Huawei", label:"nova 16 Ultra",              sensor_w:10.00, sensor_h:7.50,  focal_length:6.39, focal_length_eq:23, confidence:"✓" }, // [✓] 1/1.28" 200MP; 23mm
  { brand:"Huawei", label:"nova 16 Pro",                sensor_w:10.00, sensor_h:7.50,  focal_length:6.39, focal_length_eq:23, confidence:"✓" }, // [✓] 1/1.28" 200MP; 23mm
  { brand:"Huawei", label:"nova 16",                    sensor_w:8.21,  sensor_h:6.15,  focal_length:5.24, focal_length_eq:23, confidence:"✓" }, // [✓] 1/1.56" 50MP; 23mm
  { brand:"Huawei", label:"nova 16z",                   sensor_w:8.21,  sensor_h:6.15,  focal_length:5.24, focal_length_eq:23, confidence:"✓" }, // [✓] 1/1.56" 50MP; 23mm
  { brand:"Huawei", label:"nova 15 Max",                sensor_w:8.21,  sensor_h:6.15,  focal_length:5.24, focal_length_eq:23, confidence:"~" }, // [~] 1/1.56" 50MP; focal_eq not listed, 23mm assumed
  { brand:"Huawei", label:"nova Y74",                   sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 50MP, no format
  { brand:"Huawei", label:"Pura 90 Pro Max",            sensor_w:4.64,  sensor_h:3.48,  focal_length:3.09, focal_length_eq:24, confidence:"?" }, // [?] 50MP f/1.4-4.0, 24mm; no sensor format
  { brand:"Huawei", label:"Pura 90 Pro",                sensor_w:4.64,  sensor_h:3.48,  focal_length:3.09, focal_length_eq:24, confidence:"?" }, // [?] 50MP f/1.4-4.0, 24mm; no sensor format
  { brand:"Huawei", label:"Pura 90",                    sensor_w:4.64,  sensor_h:3.48,  focal_length:3.09, focal_length_eq:24, confidence:"?" }, // [?] 50MP, 24mm; no sensor format
  { brand:"Huawei", label:"nova 15 Ultra",              sensor_w:4.64,  sensor_h:3.48,  focal_length:3.09, focal_length_eq:24, confidence:"?" }, // [?] 50MP f/1.4-4.0, 24mm; no sensor format
  { brand:"Huawei", label:"nova 15 Pro",                sensor_w:4.64,  sensor_h:3.48,  focal_length:3.09, focal_length_eq:24, confidence:"?" }, // [?] 50MP, 24mm; no sensor format
  { brand:"Huawei", label:"nova 15",                    sensor_w:8.21,  sensor_h:6.15,  focal_length:5.24, focal_length_eq:23, confidence:"✓" }, // [✓] 1/1.56" 50MP; 23mm
  { brand:"Huawei", label:"Mate X7",                    sensor_w:10.00, sensor_h:7.50,  focal_length:6.67, focal_length_eq:24, confidence:"✓" }, // [✓] 1/1.28" 50MP; 24mm (16GB model)
  { brand:"Huawei", label:"Mate 80 RS Ultimate",        sensor_w:4.64,  sensor_h:3.48,  focal_length:3.09, focal_length_eq:24, confidence:"?" }, // [?] 50MP f/1.4-4.0, 24mm; no sensor format
  { brand:"Huawei", label:"Mate 80 Pro Max",            sensor_w:4.64,  sensor_h:3.48,  focal_length:3.09, focal_length_eq:24, confidence:"?" }, // [?] 50MP f/1.4-4.0, 24mm; no sensor format
  { brand:"Huawei", label:"Mate 80 Pro",                sensor_w:4.64,  sensor_h:3.48,  focal_length:3.09, focal_length_eq:24, confidence:"?" }, // [?] 50MP f/1.4-4.0, 24mm; no sensor format
  { brand:"Huawei", label:"Mate 80",                    sensor_w:4.64,  sensor_h:3.48,  focal_length:3.09, focal_length_eq:24, confidence:"?" }, // [?] 50MP f/1.4-4.0, 24mm; no sensor format
  { brand:"Huawei", label:"Mate 70 Air",                sensor_w:9.85,  sensor_h:7.38,  focal_length:6.57, focal_length_eq:24, confidence:"✓" }, // [✓] 1/1.3" 50MP; 24mm
  { brand:"Huawei", label:"nova 14 Lite",               sensor_w:8.21,  sensor_h:6.15,  focal_length:5.24, focal_length_eq:23, confidence:"✓" }, // [✓] 1/1.56" 50MP; 23mm
  { brand:"Huawei", label:"nova Flip S",                sensor_w:8.21,  sensor_h:6.15,  focal_length:5.24, focal_length_eq:23, confidence:"✓" }, // [✓] 1/1.56" 50MP; 23mm
  { brand:"Huawei", label:"nova 14i",                   sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 50MP, 26mm; no sensor format
  { brand:"Huawei", label:"Mate XTs Ultimate",          sensor_w:8.21,  sensor_h:6.15,  focal_length:5.47, focal_length_eq:24, confidence:"✓" }, // [✓] 1/1.56" 1.0µm 50MP; 24mm
  { brand:"Huawei", label:"Pura 80 Ultra",              sensor_w:13.20, sensor_h:8.80,  focal_length:8.43, focal_length_eq:23, confidence:"✓" }, // [✓] 1" type 50MP; 23mm
  { brand:"Huawei", label:"Pura 80 Pro+",               sensor_w:13.20, sensor_h:8.80,  focal_length:8.43, focal_length_eq:23, confidence:"✓" }, // [✓] 1" type 50MP; 23mm
  { brand:"Huawei", label:"Pura 80 Pro",                sensor_w:13.20, sensor_h:8.80,  focal_length:8.43, focal_length_eq:23, confidence:"✓" }, // [✓] 1" type 50MP; 23mm
  { brand:"Huawei", label:"Pura 80",                    sensor_w:9.85,  sensor_h:7.38,  focal_length:6.57, focal_length_eq:24, confidence:"✓" }, // [✓] 1/1.3" 50MP; 24mm
  { brand:"Huawei", label:"nova Y73",                   sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 50MP, no format
  { brand:"Huawei", label:"nova 14 Ultra",              sensor_w:4.64,  sensor_h:3.48,  focal_length:3.09, focal_length_eq:24, confidence:"?" }, // [?] 50MP f/1.4-4.0, 24mm; no sensor format
  { brand:"Huawei", label:"nova 14 Pro",                sensor_w:4.64,  sensor_h:3.48,  focal_length:3.09, focal_length_eq:24, confidence:"?" }, // [?] 50MP f/1.4-4.0, 24mm; no sensor format
  { brand:"Huawei", label:"nova 14",                    sensor_w:8.21,  sensor_h:6.15,  focal_length:5.24, focal_length_eq:23, confidence:"✓" }, // [✓] 1/1.56" 50MP; 23mm
  { brand:"Huawei", label:"nova Y72S",                  sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 50MP, 26mm; no sensor format
  { brand:"Huawei", label:"nova Y63",                   sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 50MP, 26mm; no sensor format
  { brand:"Huawei", label:"Enjoy 80",                   sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 50MP, no format
  { brand:"Huawei", label:"Pura X",                     sensor_w:4.64,  sensor_h:3.48,  focal_length:2.96, focal_length_eq:23, confidence:"?" }, // [?] 50MP f/1.6, 23mm; no sensor format
  { brand:"Huawei", label:"Mate XT Ultimate",           sensor_w:8.21,  sensor_h:6.15,  focal_length:5.47, focal_length_eq:24, confidence:"✓" }, // [✓] 1/1.56" 1.0µm 50MP; 24mm
  { brand:"Huawei", label:"nova 13i",                   sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 108MP, 26mm; no sensor format
  { brand:"Huawei", label:"Enjoy 70X Energy",           sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 50MP, 26mm; no sensor format
  { brand:"Huawei", label:"Enjoy 70X",                  sensor_w:8.21,  sensor_h:6.15,  focal_length:5.24, focal_length_eq:23, confidence:"✓" }, // [✓] 1/1.56" 1.0µm 50MP; 23mm
  { brand:"Huawei", label:"Mate 70 RS Ultimate",        sensor_w:4.64,  sensor_h:3.48,  focal_length:3.09, focal_length_eq:24, confidence:"?" }, // [?] 50MP f/1.4-4.0, 24mm; no sensor format
  { brand:"Huawei", label:"Mate 70 Pro+",               sensor_w:4.64,  sensor_h:3.48,  focal_length:3.09, focal_length_eq:24, confidence:"?" }, // [?] 50MP f/1.4-4.0, 24mm; no sensor format
  { brand:"Huawei", label:"Mate 70 Pro",                sensor_w:4.64,  sensor_h:3.48,  focal_length:3.09, focal_length_eq:24, confidence:"?" }, // [?] 50MP f/1.4-4.0, 24mm; no sensor format
  { brand:"Huawei", label:"Mate 70",                    sensor_w:4.64,  sensor_h:3.48,  focal_length:3.09, focal_length_eq:24, confidence:"?" }, // [?] 50MP f/1.4-4.0, 24mm; no sensor format
  { brand:"Huawei", label:"Mate X6",                    sensor_w:4.64,  sensor_h:3.48,  focal_length:3.09, focal_length_eq:24, confidence:"?" }, // [?] 50MP f/1.4-4.0, 24mm; no sensor format
  { brand:"Huawei", label:"nova 13 Pro",                sensor_w:4.64,  sensor_h:3.48,  focal_length:2.96, focal_length_eq:23, confidence:"?" }, // [?] 50MP f/1.4-4.0, 23mm; no sensor format
  { brand:"Huawei", label:"nova 13",                    sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 50MP, no format, no mm
  { brand:"Huawei", label:"nova Flip",                  sensor_w:8.21,  sensor_h:6.15,  focal_length:5.24, focal_length_eq:23, confidence:"✓" }, // [✓] 1/1.56" 50MP; 23mm
  { brand:"Huawei", label:"Pura 70 Ultra",              sensor_w:13.20, sensor_h:8.80,  focal_length:8.43, focal_length_eq:23, confidence:"✓" }, // [✓] 1" type 50MP retractable; 23mm
  { brand:"Huawei", label:"Pura 70 Pro+",               sensor_w:9.85,  sensor_h:7.38,  focal_length:6.84, focal_length_eq:25, confidence:"✓" }, // [✓] 1/1.3" 50MP; 25mm
  { brand:"Huawei", label:"Pura 70 Pro",                sensor_w:9.85,  sensor_h:7.38,  focal_length:6.84, focal_length_eq:25, confidence:"✓" }, // [✓] 1/1.3" 50MP; 25mm
  { brand:"Huawei", label:"Pura 70",                    sensor_w:9.85,  sensor_h:7.38,  focal_length:6.84, focal_length_eq:25, confidence:"✓" }, // [✓] 1/1.3" 50MP; 25mm
  { brand:"Huawei", label:"nova 12i",                   sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 108MP, 26mm; no sensor format
  { brand:"Huawei", label:"nova 12 SE",                 sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 108MP 1/1.67"; no focal mm listed
  { brand:"Huawei", label:"nova 12s",                   sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 50MP, no format
  { brand:"Huawei", label:"Pocket 2",                   sensor_w:4.64,  sensor_h:3.48,  focal_length:2.96, focal_length_eq:23, confidence:"?" }, // [?] 50MP f/1.6, 23mm; no sensor format
  { brand:"Huawei", label:"Enjoy 70z",                  sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 13MP, no format
  { brand:"Huawei", label:"nova Y72",                   sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 50MP, no format
  { brand:"Huawei", label:"nova 12 Ultra",              sensor_w:4.64,  sensor_h:3.48,  focal_length:3.48, focal_length_eq:27, confidence:"?" }, // [?] 50MP f/1.4-4.0, 27mm; no sensor format
  { brand:"Huawei", label:"nova 12 Pro",                sensor_w:4.64,  sensor_h:3.48,  focal_length:3.48, focal_length_eq:27, confidence:"?" }, // [?] 50MP f/1.4-4.0, 27mm; no sensor format
  { brand:"Huawei", label:"nova 12",                    sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 50MP, no format
  { brand:"Huawei", label:"nova 12 Lite",               sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 50MP, no format
  { brand:"Huawei", label:"Enjoy 70",                   sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 50MP, no format
  { brand:"Huawei", label:"nova 11 SE",                 sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 108MP 1/1.67"; no focal mm listed
  { brand:"Huawei", label:"Mate 60 RS Ultimate",        sensor_w:4.64,  sensor_h:3.48,  focal_length:3.09, focal_length_eq:24, confidence:"?" }, // [?] 48MP f/1.4-4.0, 24mm; no sensor format
  { brand:"Huawei", label:"Mate 60 Pro+",               sensor_w:4.64,  sensor_h:3.48,  focal_length:3.09, focal_length_eq:24, confidence:"?" }, // [?] 48MP f/1.4-4.0, 24mm; no sensor format
  { brand:"Huawei", label:"Mate X5",                    sensor_w:4.64,  sensor_h:3.48,  focal_length:2.96, focal_length_eq:23, confidence:"?" }, // [?] 50MP, 23mm; no sensor format
  { brand:"Huawei", label:"Mate 60 Pro",                sensor_w:4.64,  sensor_h:3.48,  focal_length:3.09, focal_length_eq:24, confidence:"?" }, // [?] 50MP f/1.4-4.0, 24mm; no sensor format
  { brand:"Huawei", label:"Mate 60",                    sensor_w:4.64,  sensor_h:3.48,  focal_length:3.09, focal_length_eq:24, confidence:"?" }, // [?] 50MP f/1.4-4.0, 24mm; no sensor format
  { brand:"Huawei", label:"nova Y91",                   sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 50MP, no format
  { brand:"Huawei", label:"nova 11i",                   sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 48MP, no format
  { brand:"Huawei", label:"nova Y71",                   sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 48MP, 26mm; no sensor format
  { brand:"Huawei", label:"Enjoy 60X",                  sensor_w:7.11,  sensor_h:5.33,  focal_length:5.14, focal_length_eq:26, confidence:"✓" }, // [✓] 50MP 1/1.8", 26mm
  { brand:"Huawei", label:"nova 11 Ultra",              sensor_w:4.64,  sensor_h:3.48,  focal_length:3.22, focal_length_eq:25, confidence:"?" }, // [?] 50MP f/1.4-4.0, 25mm; no sensor format
  { brand:"Huawei", label:"nova 11 Pro",                sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 50MP f/1.9, no format
  { brand:"Huawei", label:"nova 11",                    sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 50MP f/1.9, no format
  { brand:"Huawei", label:"Mate X3",                    sensor_w:4.64,  sensor_h:3.48,  focal_length:2.96, focal_length_eq:23, confidence:"?" }, // [?] 50MP, 23mm; no sensor format
  { brand:"Huawei", label:"P60 Pro",                    sensor_w:4.64,  sensor_h:3.48,  focal_length:3.22, focal_length_eq:25, confidence:"?" }, // [?] 48MP f/1.4-4.0, 25mm; no sensor format
  { brand:"Huawei", label:"P60",                        sensor_w:4.64,  sensor_h:3.48,  focal_length:3.22, focal_length_eq:25, confidence:"?" }, // [?] 48MP f/1.4-4.0, 25mm; no sensor format
  { brand:"Huawei", label:"P60 Art",                    sensor_w:4.64,  sensor_h:3.48,  focal_length:3.22, focal_length_eq:25, confidence:"?" }, // [?] 48MP f/1.4-4.0, 25mm; no sensor format
  { brand:"Huawei", label:"Enjoy 60 Pro",               sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 50MP f/1.8, no format
  { brand:"Huawei", label:"Enjoy 60",                   sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 48MP 1/2.0"; no focal mm listed
  { brand:"Huawei", label:"nova 10 Youth",              sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 108MP, no format
  { brand:"Huawei", label:"Enjoy 50z",                  sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 50MP f/1.8, no format
  { brand:"Huawei", label:"Pocket S",                   sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 40MP f/1.8, no format
  { brand:"Huawei", label:"nova Y61",                   sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 50MP f/1.8, no format
  { brand:"Huawei", label:"nova 10 SE",                 sensor_w:4.64,  sensor_h:3.48,  focal_length:3.48, focal_length_eq:27, confidence:"?" }, // [?] 108MP f/1.9, 27mm; no sensor format
  { brand:"Huawei", label:"Mate 50 RS Porsche Design",  sensor_w:4.64,  sensor_h:3.48,  focal_length:3.09, focal_length_eq:24, confidence:"?" }, // [?] 50MP f/1.4-4.0, 24mm; no sensor format
  { brand:"Huawei", label:"Mate 50 Pro",                sensor_w:4.64,  sensor_h:3.48,  focal_length:3.09, focal_length_eq:24, confidence:"?" }, // [?] 50MP f/1.4-4.0, 24mm; no sensor format
  { brand:"Huawei", label:"Mate 50E",                   sensor_w:4.64,  sensor_h:3.48,  focal_length:3.09, focal_length_eq:24, confidence:"?" }, // [?] 50MP f/1.4-4.0, 24mm; no sensor format
  { brand:"Huawei", label:"Mate 50",                    sensor_w:4.64,  sensor_h:3.48,  focal_length:3.09, focal_length_eq:24, confidence:"?" }, // [?] 50MP f/1.4-4.0, 24mm; no sensor format
  { brand:"Huawei", label:"nova 10z",                   sensor_w:4.64,  sensor_h:3.48,  focal_length:3.48, focal_length_eq:27, confidence:"?" }, // [?] 64MP f/1.9, 27mm; no sensor format
  { brand:"Huawei", label:"nova 10 Pro",                sensor_w:4.64,  sensor_h:3.48,  focal_length:3.48, focal_length_eq:27, confidence:"?" }, // [?] 50MP f/1.8, 27mm; no sensor format
  { brand:"Huawei", label:"nova 10",                    sensor_w:4.64,  sensor_h:3.48,  focal_length:3.48, focal_length_eq:27, confidence:"?" }, // [?] 50MP f/1.9, 27mm; no sensor format
  { brand:"Huawei", label:"nova Y90",                   sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 50MP f/1.8, no format
  { brand:"Huawei", label:"nova 9 SE 5G",               sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 108MP 1/1.52"; no focal mm listed
  { brand:"Huawei", label:"nova Y70 Plus",              sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 48MP, 26mm; no sensor format
  { brand:"Huawei", label:"P50E",                       sensor_w:4.64,  sensor_h:3.48,  focal_length:2.96, focal_length_eq:23, confidence:"?" }, // [?] 50MP f/1.8, 23mm; no sensor format
  { brand:"Huawei", label:"nova 9 SE",                  sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 108MP 1/1.52"; no focal mm listed
  { brand:"Huawei", label:"P50 Pocket",                 sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 40MP f/1.8, no format
  { brand:"Huawei", label:"nova 8 SE 4G",               sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 64MP f/1.9, 26mm; no sensor format
  { brand:"Huawei", label:"nova Y60",                   sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 13MP, 26mm; no sensor format
  { brand:"Huawei", label:"Enjoy 20e",                  sensor_w:4.64,  sensor_h:3.48,  focal_length:3.48, focal_length_eq:27, confidence:"?" }, // [?] 13MP, 27mm; no sensor format
  { brand:"Huawei", label:"nova 9 Pro",                 sensor_w:4.64,  sensor_h:3.48,  focal_length:2.96, focal_length_eq:23, confidence:"?" }, // [?] 50MP f/1.9, 23mm; no sensor format
  { brand:"Huawei", label:"nova 9",                     sensor_w:4.64,  sensor_h:3.48,  focal_length:2.96, focal_length_eq:23, confidence:"?" }, // [?] 50MP f/1.9, 23mm; no sensor format
  { brand:"Huawei", label:"nova 8",                     sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 64MP f/1.9, 26mm; no sensor format
  { brand:"Huawei", label:"P50 Pro",                    sensor_w:4.64,  sensor_h:3.48,  focal_length:2.96, focal_length_eq:23, confidence:"?" }, // [?] 50MP f/1.8, 23mm; no sensor format
  { brand:"Huawei", label:"P50",                        sensor_w:4.64,  sensor_h:3.48,  focal_length:2.96, focal_length_eq:23, confidence:"?" }, // [?] 50MP f/1.8, 23mm; no sensor format
  { brand:"Huawei", label:"nova 8 SE Youth",            sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 48MP, 26mm; no sensor format
  { brand:"Huawei", label:"nova 8i",                    sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 64MP f/1.9, 26mm; no sensor format
  { brand:"Huawei", label:"Mate 40 Pro 4G",             sensor_w:10.0,  sensor_h:7.5,   focal_length:6.39, focal_length_eq:23, confidence:"✓" }, // [✓] 50MP 1/1.28", 23mm
  { brand:"Huawei", label:"Mate 40E 4G",                sensor_w:4.64,  sensor_h:3.48,  focal_length:3.48, focal_length_eq:27, confidence:"?" }, // [?] 64MP f/1.9, 27mm; no sensor format
  { brand:"Huawei", label:"Mate X2 4G",                 sensor_w:10.0,  sensor_h:7.5,   focal_length:6.39, focal_length_eq:23, confidence:"✓" }, // [✓] 50MP 1/1.28", 23mm
  { brand:"Huawei", label:"nova 8 Pro 4G",              sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 64MP f/1.8, 26mm; no sensor format
  { brand:"Huawei", label:"Mate 40E",                   sensor_w:4.64,  sensor_h:3.48,  focal_length:3.48, focal_length_eq:27, confidence:"?" }, // [?] 64MP f/1.9, 27mm; no sensor format
  { brand:"Huawei", label:"P40 4G",                     sensor_w:10.0,  sensor_h:7.5,   focal_length:6.39, focal_length_eq:23, confidence:"✓" }, // [✓] 50MP 1/1.28", 23mm
  { brand:"Huawei", label:"Mate X2",                    sensor_w:10.0,  sensor_h:7.5,   focal_length:6.39, focal_length_eq:23, confidence:"✓" }, // [✓] 50MP 1/1.28", 23mm
  { brand:"Huawei", label:"nova 8 Pro 5G",              sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 64MP f/1.8, 26mm; no sensor format
  { brand:"Huawei", label:"nova 8 5G",                  sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 64MP f/1.9, 26mm; no sensor format
  { brand:"Huawei", label:"Enjoy 20 SE",                sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 13MP f/1.8, 26mm; no sensor format
  { brand:"Huawei", label:"nova 8 SE",                  sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 64MP f/1.9, 26mm; no sensor format
  { brand:"Huawei", label:"Mate 40 RS Porsche Design",  sensor_w:10.0,  sensor_h:7.5,   focal_length:6.39, focal_length_eq:23, confidence:"✓" }, // [✓] 50MP 1/1.28", 23mm
  { brand:"Huawei", label:"Mate 40 Pro+",               sensor_w:10.0,  sensor_h:7.5,   focal_length:6.39, focal_length_eq:23, confidence:"✓" }, // [✓] 50MP 1/1.28", 23mm
  { brand:"Huawei", label:"Mate 40 Pro",                sensor_w:10.0,  sensor_h:7.5,   focal_length:6.39, focal_length_eq:23, confidence:"✓" }, // [✓] 50MP 1/1.28", 23mm
  { brand:"Huawei", label:"Mate 40",                    sensor_w:10.0,  sensor_h:7.5,   focal_length:6.39, focal_length_eq:23, confidence:"✓" }, // [✓] 50MP 1/1.28", 23mm
  { brand:"Huawei", label:"Mate 30E Pro 5G",            sensor_w:7.53,  sensor_h:5.65,  focal_length:5.65, focal_length_eq:27, confidence:"✓" }, // [✓] 40MP 1/1.7", 27mm
  { brand:"Huawei", label:"nova 7 SE 5G Youth",         sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 64MP f/1.8, 26mm; no sensor format
  { brand:"Huawei", label:"Y7a",                        sensor_w:6.40,  sensor_h:4.80,  focal_length:4.62, focal_length_eq:26, confidence:"✓" }, // [✓] 48MP 1/2.0", 26mm
  { brand:"Huawei", label:"P smart 2021",               sensor_w:6.40,  sensor_h:4.80,  focal_length:4.62, focal_length_eq:26, confidence:"✓" }, // [✓] 48MP 1/2.0", 26mm
  { brand:"Huawei", label:"Y9a",                        sensor_w:7.40,  sensor_h:5.55,  focal_length:5.34, focal_length_eq:26, confidence:"✓" }, // [✓] 64MP 1/1.73", 26mm
  { brand:"Huawei", label:"Enjoy 20 Plus 5G",           sensor_w:6.40,  sensor_h:4.80,  focal_length:4.62, focal_length_eq:26, confidence:"✓" }, // [✓] 48MP 1/2.0", 26mm
  { brand:"Huawei", label:"Enjoy 20 5G",                sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 13MP f/1.8, 26mm; no sensor format
  { brand:"Huawei", label:"Enjoy 20 Pro",              sensor_w:6.40,  sensor_h:4.80,  focal_length:4.62, focal_length_eq:26, confidence:"✓" }, // [✓] 48MP 1/2.0", 26mm
  { brand:"Huawei", label:"Enjoy Z 5G",                sensor_w:6.40,  sensor_h:4.80,  focal_length:4.62, focal_length_eq:26, confidence:"✓" }, // [✓] 48MP 1/2.0", 26mm
  { brand:"Huawei", label:"P Smart S",                 sensor_w:6.40,  sensor_h:4.80,  focal_length:4.80, focal_length_eq:27, confidence:"✓" }, // [✓] 48MP 1/2.0", 27mm
  { brand:"Huawei", label:"Y8p",                       sensor_w:6.40,  sensor_h:4.80,  focal_length:4.80, focal_length_eq:27, confidence:"✓" }, // [✓] 48MP 1/2.0", 27mm
  { brand:"Huawei", label:"P40 lite 5G",               sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 64MP f/1.8, 26mm; no sensor format
  { brand:"Huawei", label:"P30 Pro New Edition",       sensor_w:7.53,  sensor_h:5.65,  focal_length:5.65, focal_length_eq:27, confidence:"✓" }, // [✓] 40MP 1/1.7", 27mm
  { brand:"Huawei", label:"Y8s",                       sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 48MP 1/2.0"; no focal mm listed
  { brand:"Huawei", label:"Y6p",                       sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 13MP, no format
  { brand:"Huawei", label:"Y5p",                       sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 8MP, no format
  { brand:"Huawei", label:"P smart 2020",              sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 13MP, no format
  { brand:"Huawei", label:"nova 7 Pro 5G",             sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 64MP f/1.8, 26mm; no sensor format
  { brand:"Huawei", label:"nova 7 5G",                 sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 64MP f/1.8, 26mm; no sensor format
  { brand:"Huawei", label:"nova 7 SE",                 sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 64MP f/1.8, 26mm; no sensor format
  { brand:"Huawei", label:"Enjoy 10e",                 sensor_w:4.64,  sensor_h:3.48,  focal_length:3.48, focal_length_eq:27, confidence:"?" }, // [?] 13MP, 27mm; no sensor format
  { brand:"Huawei", label:"P40 Pro+",                  sensor_w:10.0,  sensor_h:7.5,   focal_length:6.39, focal_length_eq:23, confidence:"✓" }, // [✓] 50MP 1/1.28", 23mm
  { brand:"Huawei", label:"P40 Pro",                   sensor_w:10.0,  sensor_h:7.5,   focal_length:6.39, focal_length_eq:23, confidence:"✓" }, // [✓] 50MP 1/1.28", 23mm
  { brand:"Huawei", label:"P40",                       sensor_w:10.0,  sensor_h:7.5,   focal_length:6.39, focal_length_eq:23, confidence:"✓" }, // [✓] 50MP 1/1.28", 23mm
  { brand:"Huawei", label:"P40 lite E",                sensor_w:6.40,  sensor_h:4.80,  focal_length:4.80, focal_length_eq:27, confidence:"✓" }, // [✓] 48MP 1/2.0", 27mm
  { brand:"Huawei", label:"P40 lite",                  sensor_w:6.40,  sensor_h:4.80,  focal_length:4.62, focal_length_eq:26, confidence:"✓" }, // [✓] 48MP 1/2.0", 26mm
  { brand:"Huawei", label:"P30 lite New Edition",      sensor_w:6.40,  sensor_h:4.80,  focal_length:4.80, focal_length_eq:27, confidence:"✓" }, // [✓] 48MP 1/2.0", 27mm
  { brand:"Huawei", label:"Y7p",                       sensor_w:6.40,  sensor_h:4.80,  focal_length:4.80, focal_length_eq:27, confidence:"✓" }, // [✓] 48MP 1/2.0", 27mm
  { brand:"Huawei", label:"nova 7i",                   sensor_w:6.40,  sensor_h:4.80,  focal_length:4.62, focal_length_eq:26, confidence:"✓" }, // [✓] 48MP 1/2.0", 26mm
  { brand:"Huawei", label:"Y6s (2019)",                sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 13MP, no format
  { brand:"Huawei", label:"P smart Pro 2019",          sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 48MP 1/2.0"; no focal mm listed
  { brand:"Huawei", label:"nova 6 5G",                 sensor_w:7.53,  sensor_h:5.65,  focal_length:5.65, focal_length_eq:27, confidence:"✓" }, // [✓] 40MP 1/1.7", 27mm
  { brand:"Huawei", label:"nova 6",                    sensor_w:7.53,  sensor_h:5.65,  focal_length:5.65, focal_length_eq:27, confidence:"✓" }, // [✓] 40MP 1/1.7", 27mm
  { brand:"Huawei", label:"nova 6 SE",                 sensor_w:6.40,  sensor_h:4.80,  focal_length:4.62, focal_length_eq:26, confidence:"✓" }, // [✓] 48MP 1/2.0", 26mm
  { brand:"Huawei", label:"Y9s",                       sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 48MP 1/2.0"; no focal mm listed
  { brand:"Huawei", label:"nova 5z",                   sensor_w:6.40,  sensor_h:4.80,  focal_length:4.62, focal_length_eq:26, confidence:"✓" }, // [✓] 48MP 1/2.0", 26mm
  { brand:"Huawei", label:"Enjoy 10s",                 sensor_w:6.40,  sensor_h:4.80,  focal_length:4.80, focal_length_eq:27, confidence:"✓" }, // [✓] 48MP 1/2.0", 27mm
  { brand:"Huawei", label:"Enjoy 10",                  sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 48MP 1/2.0"; no focal mm listed
  { brand:"Huawei", label:"Mate 30 RS Porsche Design", sensor_w:7.53,  sensor_h:5.65,  focal_length:5.65, focal_length_eq:27, confidence:"✓" }, // [✓] 40MP 1/1.7", 27mm
  { brand:"Huawei", label:"Mate 30 Pro 5G",            sensor_w:7.53,  sensor_h:5.65,  focal_length:5.65, focal_length_eq:27, confidence:"✓" }, // [✓] 40MP 1/1.7", 27mm
  { brand:"Huawei", label:"Mate 30 Pro",               sensor_w:7.53,  sensor_h:5.65,  focal_length:5.65, focal_length_eq:27, confidence:"✓" }, // [✓] 40MP 1/1.7", 27mm
  { brand:"Huawei", label:"Mate 30 5G",                sensor_w:8.31,  sensor_h:6.23,  focal_length:6.23, focal_length_eq:27, confidence:"✓" }, // [✓] 40MP 1/1.54", 27mm
  { brand:"Huawei", label:"Mate 30",                   sensor_w:8.31,  sensor_h:6.23,  focal_length:6.23, focal_length_eq:27, confidence:"✓" }, // [✓] 40MP 1/1.54", 27mm
  { brand:"Huawei", label:"nova 5i Pro",               sensor_w:6.40,  sensor_h:4.80,  focal_length:4.62, focal_length_eq:26, confidence:"✓" }, // [✓] 48MP 1/2.0", 26mm
  { brand:"Huawei", label:"Enjoy 10 Plus",             sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 48MP 1/2.0"; no focal mm listed
  { brand:"Huawei", label:"nova 5T",                   sensor_w:6.40,  sensor_h:4.80,  focal_length:4.98, focal_length_eq:28, confidence:"✓" }, // [✓] 48MP 1/2.0", 28mm
  { brand:"Huawei", label:"nova 5 Pro",                sensor_w:6.40,  sensor_h:4.80,  focal_length:4.62, focal_length_eq:26, confidence:"✓" }, // [✓] 48MP 1/2.0", 26mm
  { brand:"Huawei", label:"nova 5",                    sensor_w:6.40,  sensor_h:4.80,  focal_length:4.62, focal_length_eq:26, confidence:"✓" }, // [✓] 48MP 1/2.0", 26mm
  { brand:"Huawei", label:"nova 5i",                   sensor_w:4.64,  sensor_h:3.48,  focal_length:3.48, focal_length_eq:27, confidence:"?" }, // [?] 24MP, 27mm; no sensor format
  { brand:"Huawei", label:"Y9 Prime (2019)",           sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 16MP, no format
  { brand:"Huawei", label:"P20 lite (2019)",           sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 16MP, no format
  { brand:"Huawei", label:"P Smart Z",                 sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 16MP, no format
  { brand:"Huawei", label:"Mate 20 X (5G)",            sensor_w:7.53,  sensor_h:5.65,  focal_length:5.65, focal_length_eq:27, confidence:"✓" }, // [✓] 40MP 1/1.7", 27mm
  { brand:"Huawei", label:"P30 Pro",                   sensor_w:7.53,  sensor_h:5.65,  focal_length:5.65, focal_length_eq:27, confidence:"✓" }, // [✓] 40MP 1/1.7", 27mm
  { brand:"Huawei", label:"P30",                       sensor_w:7.53,  sensor_h:5.65,  focal_length:5.65, focal_length_eq:27, confidence:"✓" }, // [✓] 40MP 1/1.7", 27mm
  { brand:"Huawei", label:"P30 lite",                  sensor_w:6.40,  sensor_h:4.80,  focal_length:4.80, focal_length_eq:27, confidence:"✓" }, // [✓] 48MP 1/2.0", 27mm
  { brand:"Huawei", label:"nova 4e",                   sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 24MP, no format
  { brand:"Huawei", label:"Y5 (2019)",                 sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 13MP, no format
  { brand:"Huawei", label:"Enjoy 9e",                  sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 13MP, no format
  { brand:"Huawei", label:"Enjoy 9s",                  sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 24MP, no format
  { brand:"Huawei", label:"Y Max",                     sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 16MP, no format
  { brand:"Huawei", label:"Y6 Pro (2019)",             sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 13MP, no format
  { brand:"Huawei", label:"Y6 (2019)",                 sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 13MP, no format
  { brand:"Huawei", label:"Y7 (2019)",                 sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 13MP, no format
  { brand:"Huawei", label:"Y7 Prime (2019)",           sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 13MP, no format
  { brand:"Huawei", label:"Y7 Pro (2019)",             sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 13MP, no format
  { brand:"Huawei", label:"Y5 lite (2018)",            sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 8MP, no format
  { brand:"Huawei", label:"nova 4",                    sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 48MP 1/2.0"; no focal mm listed
  { brand:"Huawei", label:"P smart 2019",              sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 13MP, no format
  { brand:"Huawei", label:"Enjoy 9",                   sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 13MP, no format
  { brand:"Huawei", label:"Mate 20 RS Porsche Design", sensor_w:7.53,  sensor_h:5.65,  focal_length:5.65, focal_length_eq:27, confidence:"✓" }, // [✓] 40MP 1/1.7", 27mm
  { brand:"Huawei", label:"Mate 20 X",                 sensor_w:7.53,  sensor_h:5.65,  focal_length:5.65, focal_length_eq:27, confidence:"✓" }, // [✓] 40MP 1/1.7", 27mm
  { brand:"Huawei", label:"Mate 20 Pro",               sensor_w:7.53,  sensor_h:5.65,  focal_length:5.65, focal_length_eq:27, confidence:"✓" }, // [✓] 40MP 1/1.7", 27mm
  { brand:"Huawei", label:"Mate 20",                   sensor_w:5.57,  sensor_h:4.17,  focal_length:4.17, focal_length_eq:27, confidence:"✓" }, // [✓] 12MP 1/2.3", 27mm
  { brand:"Huawei", label:"Y9 (2019)",                 sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 13MP, no format
  { brand:"Huawei", label:"Mate 20 lite",              sensor_w:4.64,  sensor_h:3.48,  focal_length:3.48, focal_length_eq:27, confidence:"?" }, // [?] 20MP, 27mm; no sensor format
  { brand:"Huawei", label:"P Smart+ 2019",             sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 24MP, no format
  { brand:"Huawei", label:"nova 3i",                   sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 16MP, no format
  { brand:"Huawei", label:"nova 3",                    sensor_w:4.64,  sensor_h:3.48,  focal_length:3.48, focal_length_eq:27, confidence:"?" }, // [?] 16MP, 27mm; no sensor format
  { brand:"Huawei", label:"Y5 Prime (2018)",           sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 13MP, no format
  { brand:"Huawei", label:"Y3 (2018)",                 sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 8MP, no format
  { brand:"Huawei", label:"Y6 Prime (2018)",           sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 13MP, no format
  { brand:"Huawei", label:"Y6 (2018)",                 sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 13MP, no format
  { brand:"Huawei", label:"Mate RS Porsche Design",    sensor_w:7.53,  sensor_h:5.65,  focal_length:5.65, focal_length_eq:27, confidence:"✓" }, // [✓] 40MP 1/1.7", 27mm
  { brand:"Huawei", label:"P20 Pro",                   sensor_w:7.53,  sensor_h:5.65,  focal_length:5.65, focal_length_eq:27, confidence:"✓" }, // [✓] 40MP 1/1.7", 27mm
  { brand:"Huawei", label:"P20",                       sensor_w:5.57,  sensor_h:4.17,  focal_length:4.17, focal_length_eq:27, confidence:"✓" }, // [✓] 12MP 1/2.3", 27mm
  { brand:"Huawei", label:"P20 lite",                  sensor_w:4.13,  sensor_h:3.10,  focal_length:3.10, focal_length_eq:26, confidence:"?" }, // [?] 16MP 1/3.1"; no focal mm listed
  { brand:"Huawei", label:"Y7 Pro (2018)",             sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 13MP, no format
  { brand:"Huawei", label:"Y7 Prime (2018)",           sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 13MP, no format
  { brand:"Huawei", label:"Y7 (2018)",                 sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 13MP, no format
  { brand:"Huawei", label:"Y9 (2018)",                 sensor_w:4.64,  sensor_h:3.48,  focal_length:3.48, focal_length_eq:27, confidence:"?" }, // [?] 16MP, 27mm; no sensor format
  { brand:"Huawei", label:"P smart",                   sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 13MP, no format
  { brand:"Huawei", label:"nova 2s",                   sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 16MP, no format
  { brand:"Huawei", label:"Mate 10 Porsche Design",    sensor_w:4.41,  sensor_h:3.31,  focal_length:3.31, focal_length_eq:27, confidence:"✓" }, // [✓] 12MP 1/2.9", 27mm
  { brand:"Huawei", label:"Mate 10 Pro",               sensor_w:4.41,  sensor_h:3.31,  focal_length:3.31, focal_length_eq:27, confidence:"✓" }, // [✓] 12MP 1/2.9", 27mm
  { brand:"Huawei", label:"Mate 10",                   sensor_w:4.41,  sensor_h:3.31,  focal_length:3.31, focal_length_eq:27, confidence:"✓" }, // [✓] 12MP 1/2.9", 27mm
  { brand:"Huawei", label:"Mate 10 Lite",              sensor_w:4.64,  sensor_h:3.48,  focal_length:3.48, focal_length_eq:27, confidence:"?" }, // [?] 16MP, 27mm; no sensor format
  { brand:"Huawei", label:"P9 lite mini",              sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 13MP, no format
  { brand:"Huawei", label:"Y7 Prime",                  sensor_w:4.41,  sensor_h:3.31,  focal_length:3.31, focal_length_eq:27, confidence:"?" }, // [?] 12MP 1/2.9"; no focal mm listed
  { brand:"Huawei", label:"nova 2 plus",               sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 12MP, no format
  { brand:"Huawei", label:"nova 2",                    sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 12MP, no format
  { brand:"Huawei", label:"Y6II Compact",              sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 13MP, no format
  { brand:"Huawei", label:"Y7",                        sensor_w:4.41,  sensor_h:3.31,  focal_length:3.31, focal_length_eq:27, confidence:"?" }, // [?] 12MP 1/2.9"; no focal mm listed
  { brand:"Huawei", label:"Y6 (2017)",                 sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 13MP, no format
  { brand:"Huawei", label:"Y5 (2017)",                 sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 8MP, no format
  { brand:"Huawei", label:"Y3 (2017)",                 sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 8MP, no format
  { brand:"Huawei", label:"P10 Plus",                  sensor_w:4.64,  sensor_h:3.48,  focal_length:3.62, focal_length_eq:28, confidence:"?" }, // [?] 12MP, 28mm; no sensor format
  { brand:"Huawei", label:"P10",                       sensor_w:4.64,  sensor_h:3.48,  focal_length:3.62, focal_length_eq:28, confidence:"?" }, // [?] 12MP, 28mm; no sensor format
  { brand:"Huawei", label:"P10 Lite",                  sensor_w:4.86,  sensor_h:3.64,  focal_length:3.64, focal_length_eq:26, confidence:"?" }, // [?] 12MP 1/2.8"; no focal mm listed
  { brand:"Huawei", label:"P8 Lite (2017)",            sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 12MP, no format
  { brand:"Huawei", label:"Enjoy 6s",                  sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 13MP, no format
  { brand:"Huawei", label:"Mate 9 Pro",                sensor_w:4.41,  sensor_h:3.31,  focal_length:3.31, focal_length_eq:27, confidence:"✓" }, // [✓] 12MP 1/2.9", 27mm
  { brand:"Huawei", label:"Mate 9 Porsche Design",     sensor_w:4.41,  sensor_h:3.31,  focal_length:3.31, focal_length_eq:27, confidence:"✓" }, // [✓] 12MP 1/2.9", 27mm
  { brand:"Huawei", label:"Mate 9",                    sensor_w:4.41,  sensor_h:3.31,  focal_length:3.31, focal_length_eq:27, confidence:"✓" }, // [✓] 12MP 1/2.9", 27mm
  { brand:"Huawei", label:"Enjoy 6",                   sensor_w:4.64,  sensor_h:3.48,  focal_length:3.35, focal_length_eq:26, confidence:"?" }, // [?] 13MP, no format
  { brand:"Huawei", label:"nova plus",                 sensor_w:4.86,  sensor_h:3.64,  focal_length:3.64, focal_length_eq:26, confidence:"?" }, // [?] 16MP 1/2.8"; no focal mm listed
  { brand:"Huawei", label:"nova",                      sensor_w:4.41,  sensor_h:3.31,  focal_length:3.31, focal_length_eq:27, confidence:"?" }, // [?] 12MP 1/2.9"; no focal mm listed
  { brand:"Huawei", label:"G9 Plus",                   sensor_w:4.86,  sensor_h:3.64,  focal_length:3.64, focal_length_eq:26, confidence:"?" }, // [?] 16MP 1/2.8"; no focal mm listed
  { brand:"Huawei", label:"P9 / P9 Plus",             sensor_w:5.00,  sensor_h:3.75,  focal_length:3.75, focal_length_eq:27, confidence:"✓" }, // [✓] 1/2.9" 1.25µm pixel math; 27mm
  { brand:"Huawei", label:"P9 lite",                  sensor_w:4.13,  sensor_h:3.10,  focal_length:3.10, focal_length_eq:27, confidence:"~" }, // [~] 1/3.1" 1.12µm; focal_eq ~
  { brand:"Huawei", label:"Mate 8",                   sensor_w:4.57,  sensor_h:3.43,  focal_length:3.43, focal_length_eq:27, confidence:"✓" }, // [✓] 16MP 1/2.8"; 27mm
  { brand:"Huawei", label:"Mate S",                   sensor_w:4.92,  sensor_h:3.69,  focal_length:3.82, focal_length_eq:28, confidence:"✓" }, // [✓] 13MP 1/2.6"; 28mm
  { brand:"Huawei", label:"P8",                       sensor_w:4.13,  sensor_h:3.10,  focal_length:3.21, focal_length_eq:28, confidence:"✓" }, // [✓] 13MP 1/3.1" 1.12µm; 28mm
  { brand:"Huawei", label:"P8max",                    sensor_w:4.64,  sensor_h:3.48,  focal_length:3.48, focal_length_eq:27, confidence:"?" }, // [?] 13MP; no sensor format
  { brand:"Huawei", label:"P8 lite (2015)",           sensor_w:4.64,  sensor_h:3.48,  focal_length:3.48, focal_length_eq:27, confidence:"~" }, // [~] 13MP 27mm confirmed; no sensor format
  { brand:"Huawei", label:"Ascend Mate7",             sensor_w:4.64,  sensor_h:3.48,  focal_length:3.61, focal_length_eq:28, confidence:"~" }, // [~] 13MP 28mm confirmed; no sensor format

  // ── LG ───────────────────────────────────────────────────────────────────
  { brand:"LG",     label:"V60 ThinQ 5G / V60 ThinQ 5G UW (2020)", sensor_w:7.40, sensor_h:5.55, focal_length:5.55, focal_length_eq:27, confidence:"✓" }, // [✓] 64MP 1/1.72" 0.8µm pixel math; 27mm
  { brand:"LG",     label:"Velvet 5G / Velvet 5G UW (2020)", sensor_w:6.40, sensor_h:4.80, focal_length:4.62, focal_length_eq:26, confidence:"✓" }, // [✓] 48MP 1/2.0" 0.8µm pixel math; 26mm
  { brand:"LG",     label:"Wing 5G (2020)",             sensor_w:7.40,  sensor_h:5.55,  focal_length:5.14, focal_length_eq:25, confidence:"✓" }, // [✓] 64MP 1/1.72" 0.8µm pixel math; 25mm
  { brand:"LG",     label:"G6 / V30 / V30S ThinQ / G7 ThinQ / V35 ThinQ (2017–2018)", sensor_w:4.13, sensor_h:3.10, focal_length:3.44, focal_length_eq:30, confidence:"✓" }, // [✓] 1/3.1"; 30mm
  { brand:"LG",     label:"V40 ThinQ / G8 ThinQ / G8S ThinQ / G8X ThinQ / V50S ThinQ 5G (2018–2019)", sensor_w:5.60, sensor_h:4.20, focal_length:4.20, focal_length_eq:27, confidence:"✓" }, // [✓] 12MP 1/2.55" 1.4µm pixel math; 27mm
  { brand:"LG",     label:"G5 (2016)",                    sensor_w:4.92,  sensor_h:3.69,  focal_length:3.56, focal_length_eq:26, confidence:"✓" }, // [✓] 16MP 1/2.6"; 26mm
  { brand:"LG",     label:"G5 SE / V20 (2016)",           sensor_w:4.92,  sensor_h:3.69,  focal_length:3.96, focal_length_eq:29, confidence:"✓" }, // [✓] 16MP 1/2.6"; 29mm
  { brand:"LG",     label:"G4 / G4 Dual (2015)",         sensor_w:4.92,  sensor_h:3.69,  focal_length:3.83, focal_length_eq:28, confidence:"✓" }, // [✓] 16MP 1/2.6" 1.12µm; 28mm
  { brand:"LG",     label:"V10 (2015)",                   sensor_w:4.92,  sensor_h:3.69,  focal_length:3.83, focal_length_eq:28, confidence:"~" }, // [~] 16MP 1/2.6"; focal_eq ~28mm (G4 same sensor)
  { brand:"LG",     label:"G2 / G3 (2013–2014)",          sensor_w:4.13,  sensor_h:3.10,  focal_length:3.33, focal_length_eq:29, confidence:"✓" }, // [✓] 13MP 1/3.1" 1.12µm; 29mm

  // ── MOTOROLA ─────────────────────────────────────────────────────────────
  { brand:"Motorola", label:"Signature / Razr Fold (2026)",              sensor_w:9.96,  sensor_h:7.47,  focal_length:6.36, focal_length_eq:23, confidence:"✓" }, // [✓] 50MP 1/1.28" 1.22µm pixel math; 23mm
  { brand:"Motorola", label:"Edge 50 Ultra / Moto X50 Ultra (2024)",     sensor_w:9.80,  sensor_h:7.35,  focal_length:6.26, focal_length_eq:23, confidence:"✓" }, // [✓] 50MP 1/1.3" 1.2µm pixel math; 23mm
  { brand:"Motorola", label:"Razr 50 Ultra / Razr+ 2024 / Razr+ 2025",   sensor_w:6.53,  sensor_h:4.90,  focal_length:4.35, focal_length_eq:24, confidence:"✓" }, // [✓] 50MP 1/1.95" 0.8µm pixel math; 24mm
  { brand:"Motorola", label:"Razr 60 Ultra (2025) / Edge 60 Pro (2025) / Edge 70 Pro+ (2026)", sensor_w:8.17, sensor_h:6.13, focal_length:5.45, focal_length_eq:24, confidence:"✓" }, // [✓] 50MP 1/1.56" 1.0µm pixel math; 24mm
  { brand:"Motorola", label:"Edge 30 Ultra / Moto X30 Pro (2022)",          sensor_w:10.45, sensor_h:7.84, focal_length:6.68, focal_length_eq:23, confidence:"~" }, // [~] 200MP 1/1.22" 0.64µm pixel math; focal_eq ~23mm
  { brand:"Motorola", label:"Edge+ 5G UW (2022) / Edge 30 Pro / X40 / Razr 2022 / Edge 40 Pro / Edge+ (2023) / ThinkPhone (2022–2023)", sensor_w:8.17, sensor_h:6.13, focal_length:5.45, focal_length_eq:24, confidence:"~" }, // [~] 50MP 1/1.55" 1.0µm pixel math; focal_eq ~24mm
  { brand:"Motorola", label:"Razr 40 Ultra / Razr+ 2023 (2023)",            sensor_w:5.60,  sensor_h:4.20, focal_length:4.04, focal_length_eq:26, confidence:"~" }, // [~] 12MP 1/2.55" 1.4µm; focal_eq ~26mm (HTC 10 same sensor 26mm)

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

  // ── SONY XPERIA (smartphones) ────────────────────────────────────────────
  { brand:"Sony",    label:"Xperia 1 V / 5 V / 1 VI / 1 VII / 1 VIII (2023–2026)", sensor_w:8.96, sensor_h:6.72, focal_length:5.97, focal_length_eq:24, confidence:"✓" }, // [✓] 48MP 1/1.35" 1.12µm pixel math; 24mm Zeiss
  { brand:"Sony",    label:"Xperia Pro-I (2021)",            sensor_w:9.60,  sensor_h:7.20,  focal_length:6.40, focal_length_eq:24, confidence:"✓" }, // [✓] 12MP 1.0"-type 2.4µm pixel math; 24mm Zeiss
  { brand:"Sony",    label:"Xperia 1 II / 5 II / 1 III / 5 III / 1 IV / 5 IV (2020–2022)", sensor_w:7.60, sensor_h:5.70, focal_length:5.07, focal_length_eq:24, confidence:"✓" }, // [✓] 12MP 1/1.7" 1.8µm; 24mm Zeiss
  { brand:"Sony",    label:"Xperia 10 III (2021)",       sensor_w:4.57,  sensor_h:3.43,  focal_length:3.43, focal_length_eq:27, confidence:"✓" }, // [✓] 12MP 1/2.8"; 27mm
  { brand:"Sony",    label:"Xperia 10 II (2020)",        sensor_w:4.57,  sensor_h:3.43,  focal_length:3.30, focal_length_eq:26, confidence:"✓" }, // [✓] 12MP 1/2.8"; 26mm
  { brand:"Sony",    label:"Xperia 1 / 5 (2019)",        sensor_w:5.60,  sensor_h:4.20,  focal_length:4.04, focal_length_eq:26, confidence:"✓" }, // [✓] 12MP 1/2.55" 1.4µm; 26mm Zeiss
  { brand:"Sony",    label:"Xperia XZ2 / XZ2 Compact / XZ2 Premium / XZ3 (2018)", sensor_w:6.13, sensor_h:4.60, focal_length:4.26, focal_length_eq:25, confidence:"✓" }, // [✓] 19MP 1/2.3" 1.22µm pixel math; 25mm
  { brand:"Sony",    label:"Xperia XZs / XZ Premium / XZ1 / XZ1 Compact (2017)", sensor_w:6.13, sensor_h:4.60, focal_length:4.26, focal_length_eq:25, confidence:"✓" }, // [✓] 19MP 1/2.3"; 25mm
  { brand:"Sony",    label:"Xperia X / X Compact / X Performance / XZ (2016)", sensor_w:6.13, sensor_h:4.60, focal_length:4.09, focal_length_eq:24, confidence:"✓" }, // [✓] 23MP 1/2.3"; 24mm
  { brand:"Sony",    label:"Xperia Z3+ / Z5 / Z5 Compact / Z5 Premium (2015)", sensor_w:6.13, sensor_h:4.60, focal_length:4.09, focal_length_eq:24, confidence:"✓" }, // [✓] 23MP 1/2.3"; 24mm (Z5 confirmed; Z3+ assumed same)
  { brand:"Sony",    label:"Xperia Z2 / Z3 (2014)",      sensor_w:6.13,  sensor_h:4.60,  focal_length:4.76, focal_length_eq:28, confidence:"~" }, // [~] 1/2.3"; 28mm
  { brand:"Sony",    label:"Xperia Z1 (2013)",           sensor_w:6.13,  sensor_h:4.60,  focal_length:4.60, focal_length_eq:27, confidence:"~" }, // [~] 1/2.3"; 27mm
  { brand:"Sony",    label:"Xperia Z / Arc S (2012)",    sensor_w:4.54,  sensor_h:3.42,  focal_length:3.53, focal_length_eq:28, confidence:"~" }, // [~] 1/3.2"; 28mm

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

  // ── CUSTOM ───────────────────────────────────────────────────────────────
  { brand:"—", label:"Custom sensor dimensions …", sensor_w:null, sensor_h:null, focal_length:null, focal_length_eq:null },
];
