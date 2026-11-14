// ==============================================================================
// THE EARTH SCIENCE AUTOPILOT — DATA & RESEARCH RESOURCES DIRECTORY
// ==============================================================================
// Official catalog of challenge resources from NASA Space Apps Challenge 2026:
// "Be An Earth System Trend Detective!"
// ==============================================================================

import { ExternalResource } from '@/types';

export const EXTERNAL_RESOURCES: ExternalResource[] = [
  // 1. NASA RESOURCES
  {
    id: 'nasa-cmr',
    name: 'NASA Common Metadata Repository (CMR)',
    organization: 'NASA Earth Science Data Systems (ESDS)',
    category: 'NASA Data',
    accessType: 'API',
    authRequirement: 'None (Open)',
    integrationStatus: 'Integrated',
    url: 'https://cmr.earthdata.nasa.gov/search/site/docs/search/api.html',
    description: 'The authoritative spatial and temporal metadata catalog containing millions of Earth-observation granules across MODIS, Landsat, GPM, SMAP, and VIIRS missions.',
    challengeRelevance: 'Primary programmatic discovery engine for locating NASA Earth observation datasets and granules covering any user-defined region.',
  },
  {
    id: 'nasa-giovanni',
    name: 'NASA Giovanni (Earthdata Bridge)',
    organization: 'NASA Goddard Earth Sciences (GES DISC)',
    category: 'NASA Data',
    accessType: 'Web Application',
    authRequirement: 'None (Open)',
    integrationStatus: 'Discovery Supported',
    url: 'https://giovanni.earthdata.nasa.gov/',
    description: 'Web-based application for visualizing, analyzing, and generating spatial maps, vertical profiles, and time-series from hundreds of NASA geophysical parameters without downloading raw files.',
    challengeRelevance: 'Essential scientific exploratory benchmark for interactive atmospheric and hydrological trend analysis.',
  },
  {
    id: 'nasa-appeears',
    name: 'NASA AppEEARS (Application for Extracting and Exploring Analysis Ready Samples)',
    organization: 'NASA LP DAAC / USGS EROS',
    category: 'NASA Data',
    accessType: 'API',
    authRequirement: 'Earthdata Login',
    integrationStatus: 'Authentication Required',
    url: 'https://appeears.earthdatacloud.nasa.gov/',
    description: 'Enables users to subset, transform, and sample federal geospatial data archives by geographic bounding boxes, polygons, or point coordinates.',
    challengeRelevance: 'Supports automated asynchronous sample extractions for MODIS, VIIRS, and ECOSTRESS time-series workflows.',
  },
  {
    id: 'swot-mission',
    name: 'Surface Water and Ocean Topography (SWOT) Mission',
    organization: 'NASA / CNES / CSA / UKSA',
    category: 'Space Agency',
    accessType: 'Data Portal',
    authRequirement: 'Earthdata Login',
    integrationStatus: 'Discovery Supported',
    url: 'https://swot.jpl.nasa.gov/',
    description: 'First global satellite survey of Earth surface water, measuring water surface elevation across rivers wider than 50m, lakes larger than 62,500 m², and ocean surface topography with Ka-band radar interferometry.',
    challengeRelevance: 'Enables revolutionary trend detection in lake storage changes, river discharge, and coastal sea-level rise.',
  },

  // 2. NOAA & CLIMATE RESOURCES
  {
    id: 'noaa-cdo',
    name: 'NOAA Climate Data Online (CDO) v2 Web Services',
    organization: 'NOAA National Centers for Environmental Information (NCEI)',
    category: 'Climate & Hydrology',
    accessType: 'API',
    authRequirement: 'Free Token Required',
    integrationStatus: 'Integrated',
    url: 'https://www.ncei.noaa.gov/cdo-web/webservices/v2',
    description: 'RESTful API offering access to historical in-situ weather and climate station observations (GHCND, GSOD, Normal summaries) worldwide.',
    challengeRelevance: 'Provides ground-truth validation for temperature and precipitation trends against satellite reanalysis.',
  },
  {
    id: 'open-meteo-era5',
    name: 'Open-Meteo Historical Climate & ECMWF ERA5 Reanalysis',
    organization: 'Open-Meteo & ECMWF Copernicus Climate Change Service',
    category: 'Climate & Hydrology',
    accessType: 'API',
    authRequirement: 'None (Open)',
    integrationStatus: 'Integrated',
    url: 'https://open-meteo.com/en/docs/historical-weather-api',
    description: 'High-resolution global climate reanalysis from 1940 to present day providing seamless hourly and daily observations for any location on Earth.',
    challengeRelevance: 'Powers the keyless live time-series generation engine for temperature, precipitation, and soil moisture across all user-selected coordinates.',
  },
  {
    id: 'knmi-climate-explorer',
    name: 'KNMI Climate Explorer',
    organization: 'Royal Netherlands Meteorological Institute (KNMI)',
    category: 'Climate & Hydrology',
    accessType: 'Web Application',
    authRequirement: 'None (Open)',
    integrationStatus: 'External Resource',
    url: 'https://climexp.knmi.nl/',
    description: 'Research workbench to correlate, plot, and verify historical weather observations, climate indices, and CMIP climate model simulations.',
    challengeRelevance: 'Valuable external scientific validation tool for cross-referencing regional trends and climate anomalies.',
  },

  // 3. CANADIAN SPACE AGENCY (CSA) RESOURCES
  {
    id: 'csa-rcm',
    name: 'RADARSAT Constellation Mission (RCM)',
    organization: 'Canadian Space Agency (CSA)',
    category: 'Space Agency',
    accessType: 'Data Portal',
    authRequirement: 'Restricted / Proposal',
    integrationStatus: 'Discovery Supported',
    url: 'https://www.asc-csa.gc.ca/eng/satellites/radarsat/',
    description: 'Three-satellite C-band Synthetic Aperture Radar (SAR) constellation providing daily revisits of Canada and maritime surveillance, ice mapping, disaster monitoring, and forestry.',
    challengeRelevance: 'Key space agency resource for SAR-based environmental change detection over boreal wetlands, sea ice, and permafrost.',
  },
  {
    id: 'csa-geo-ca',
    name: 'GEO.ca — Canadian Geospatial Platform',
    organization: 'Natural Resources Canada (NRCan) / Open Maps',
    category: 'Space Agency',
    accessType: 'Data Portal',
    authRequirement: 'None (Open)',
    integrationStatus: 'External Resource',
    url: 'https://geo.ca/',
    description: 'Canadas national open geospatial platform providing authoritative spatial data on land cover, water basins, indigenous lands, and natural resources.',
    challengeRelevance: 'Canadian open data catalog for regional environmental overlays and spatial comparison studies.',
  },
  {
    id: 'csa-ecosystems-space',
    name: 'Monitoring and Protecting Our Ecosystems from Space',
    organization: 'Canadian Space Agency (CSA)',
    category: 'Scientific Tutorials',
    accessType: 'Literature / Paper',
    authRequirement: 'None (Open)',
    integrationStatus: 'External Resource',
    url: 'https://www.asc-csa.gc.ca/eng/satellites/everyday-life/monitoring-and-protecting-our-ecosystems.asp',
    description: 'Educational guide explaining how Earth-observation satellites track wetlands, protect wildlife habitats, detect illegal logging, and support ecosystem stewardship.',
    challengeRelevance: 'Core educational reference contextualizing satellite trend detection for conservation and environmental policy.',
  },
  {
    id: 'csa-sar-tutorial',
    name: 'Synthetic Aperture Radar (SAR) Python & QGIS Tutorial',
    organization: 'Canadian Space Agency (CSA)',
    category: 'Scientific Tutorials',
    accessType: 'Literature / Paper',
    authRequirement: 'None (Open)',
    integrationStatus: 'External Resource',
    url: 'https://www.asc-csa.gc.ca/eng/satellites/radarsat/tutorial.asp',
    description: 'Practical engineering tutorial covering radiometric calibration, speckle filtering, and geocoding of satellite radar data using Python.',
    challengeRelevance: 'Hands-on technical reference for users advancing from optical/infrared analysis into active radar imagery processing.',
  },

  // 4. STATISTICAL METHODS & RESEARCH ARTICLES
  {
    id: 'stat-trend-detection-methods',
    name: 'Statistical Methods to Detect Trends in Time-Series Data',
    organization: 'Environmental Modelling & Software / USGS Guidelines',
    category: 'Statistical Methods',
    accessType: 'Literature / Paper',
    authRequirement: 'None (Open)',
    integrationStatus: 'Integrated',
    url: 'https://pubs.usgs.gov/sir/2005/5275/',
    description: 'Authoritative statistical textbook reviewing parametric OLS, non-parametric Mann-Kendall, Seasonal Kendall, and Sen slope estimators for environmental monitoring.',
    challengeRelevance: 'Formulates the mathematical foundation implemented inside the Earth Science Autopilot statistical core.',
  },
  {
    id: 'stat-significance-guide',
    name: 'A Comprehensive Guide to Statistical Significance in Environmental Science',
    organization: 'American Statistical Association (ASA)',
    category: 'Statistical Methods',
    accessType: 'Literature / Paper',
    authRequirement: 'None (Open)',
    integrationStatus: 'External Resource',
    url: 'https://www.amstat.org/asa/files/pdfs/P-ValueStatement.pdf',
    description: 'Authoritative guidance on interpreting p-values, warning against treating p < 0.05 as proof of causation, and emphasizing effect size and confidence intervals.',
    challengeRelevance: 'Ensures our scientific reporting engine adheres strictly to modern statistical best practices without claiming causation.',
  },
  {
    id: 'seawifs-chlorophyll-study',
    name: 'Global Ocean Phytoplankton Chlorophyll Distributions and Trends',
    organization: 'NASA Ocean Biology Processing Group / Remote Sensing of Environment',
    category: 'Scientific Tutorials',
    accessType: 'Literature / Paper',
    authRequirement: 'None (Open)',
    integrationStatus: 'External Resource',
    url: 'https://oceancolor.gsfc.nasa.gov/resources/docs/',
    description: 'Benchmark research paper demonstrating decadal time-series analysis and trend estimation using SeaWiFS and MODIS-Aqua ocean color observations.',
    challengeRelevance: 'Exemplifies multi-mission satellite sensor continuity and trend detection methodology for marine ecosystems.',
  }
];

export function getResourcesByCategory(category: ExternalResource['category']): ExternalResource[] {
  return EXTERNAL_RESOURCES.filter(r => r.category === category);
}

