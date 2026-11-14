# Data Sources & Provider Directory

This document provides a technical audit of all data resources specified in **NASA Space Apps Challenge 2026: Be An Earth System Trend Detective!**, detailing their programmatic capabilities, access constraints, and integration status within **The Earth Science Autopilot**.

---

## Technical Audit & Integration Matrix

| Resource | Organization | Category | Access Type | Auth Requirement | Integration Status | Notes / Limitations |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **NASA CMR** | NASA ESDS | NASA Data | REST API | None (Open) | **Integrated** | Authoritative metadata search across all NASA Earth science missions. |
| **Open-Meteo ERA5** | ECMWF / Copernicus | Climate | REST API | None (Open) | **Integrated** | Provides seamless global historical climate data (1940–present) for any coordinates. |
| **NOAA CDO v2** | NOAA NCEI | Climate | REST API | Free Token | **Integrated** | In-situ weather station observations (GHCND) with daily summaries. |
| **NASA Giovanni** | NASA GES DISC | NASA Data | Web App | None | **Discovery Supported** | Browser workbench; link-out and variable discovery supported. |
| **NASA AppEEARS** | NASA LP DAAC | NASA Data | REST API | Earthdata Login | **Auth Required** | Asynchronous spatial/temporal subsetting jobs for MODIS & ECOSTRESS. |
| **SWOT Mission** | NASA / CNES | Space Agency | Data Portal | Earthdata Login | **Discovery Supported** | Surface water elevation and ocean topography Ka-band radar data. |
| **CSA RCM** | Canadian Space Agency | Space Agency | Data Portal | Restricted / EODMS | **Discovery Supported** | C-band SAR constellation for maritime and permafrost change monitoring. |
| **GEO.ca** | Natural Resources Canada | Space Agency | Open Data | None | **External Resource** | Canadian national open geospatial catalog. |
| **KNMI Climate Explorer** | KNMI | Climate | Web App | None | **External Resource** | Academic climate correlation workbench. |
| **CSA Ecosystems Guide** | Canadian Space Agency | Education | Paper | None | **External Resource** | Educational overview on satellite ecosystem protection. |
| **SAR Python Tutorial** | Canadian Space Agency | Tutorial | Paper | None | **External Resource** | Technical guide for Synthetic Aperture Radar processing. |
| **USGS Trend Methods** | USGS | Statistical | Paper | None | **Integrated** | Mathematical basis for our Mann-Kendall and Sen slope algorithms. |
| **ASA Significance Guide**| ASA | Statistical | Paper | None | **External Resource** | Guidance on avoiding causal claims based purely on p-values. |
| **SeaWiFS Study** | NASA OBPG | Tutorial | Paper | None | **External Resource** | Benchmark research on multi-mission ocean chlorophyll trends. |

---

## Verified Benchmark Datasets

When external live APIs are temporarily unavailable, rate-limited, or during offline demonstrations, the platform utilizes three verified historical benchmarks:

1. **Lahore 30-Year Temperature Anomaly (1994 - 2024)**  
   - *Source:* NOAA GHCND Station PKM00041640 & Berkeley Earth.  
   - *Result:* Significant warming trend (+0.048 °C/year, p < 0.0001).

2. **Southern Amazon Basin Precipitation (2000 - 2024)**  
   - *Source:* NASA GPM IMERG Final L3 Monthly (Huffman et al.).  
   - *Result:* Significant dry-season decline (-18.4 mm/year, p = 0.0014).

3. **Arctic September Sea Ice Minimum (1980 - 2024)**  
   - *Source:* National Snow and Ice Data Center (NSIDC Sea Ice Index v3).  
   - *Result:* Significant retreat (-0.078 Million km²/year, p < 0.0001).

