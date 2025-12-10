# NDVI Analysis of Lahore using Sentinel-2 and Google Earth Engine

This repository contains a complete Google Earth Engine (GEE) script for generating:

- NDVI computation for Lahore district
- Cloud-masked Sentinel-2 imagery 
- Monthly mean NDVI statistics  
- A line chart showing monthly NDVI trends  
- A median NDVI map layer  
- Export, ready to use NDVI raster    

---

## Project Overview

This project analyzes vegetation conditions across Lahore district, using Sentinel-2 Harmonized imagery for the year 2023. It also computes an NDVI time series chart, removes cloud cover and generates both statistical and spatial outputs.
Link: https://code.earthengine.google.com/411b031fdade0e9445b3a91b0b828525

---

## Dataset Used

- Sentinel-2 Harmonized (COPERNICUS/S2_HARMONIZED)
- Spatial extent: Lahore district shapefile
- Date range: January 1, 2023 – December 31, 2023

---

## Features

### Cloud Masking  
Removes clouds and cirrus using the Sentinel-2 QA60 band.

### NDVI Calculation  
Uses the standard formula:  
NDVI = (NIR – Red) / (NIR + Red), (B8, B4)

### Monthly NDVI Chart  
- Mean NDVI value per month  
- Display using ui.Chart
- Smooth line curve for seasonal trend visualization

### Median NDVI Map  
- Render on the GEE Map  
- Style with a 17-class NDVI palette  
- Exportable as a GeoTIFF

### Export Options  
The script exports the NDVI raster to Google Drive.

---

## License
This project is open-source and free to use, modify, and share with attribution.

---

## Author
Raffay Subhani
Email: raffaysubhani9@gmail.com
