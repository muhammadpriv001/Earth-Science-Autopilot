// ==============================================================================
// THE EARTH SCIENCE AUTOPILOT — EARTH SCIENCE VARIABLE CATALOG
// ==============================================================================
// Variables curated according to NASA Space Apps Challenge 2026:
// "Be An Earth System Trend Detective!"
// ==============================================================================

import { EarthVariable } from '@/types';

export const EARTH_VARIABLES: EarthVariable[] = [
  // 1. ATMOSPHERE
  {
    id: 'air-temperature',
    name: 'Near-Surface Air Temperature (2m)',
    system: 'Atmosphere',
    unit: '°C',
    description: 'The temperature of the air at 2 meters above the Earth surface, representing human-experienced weather and climate thermal trends.',
    measurementPrinciple: 'In-situ weather stations (thermometers) and satellite infrared/microwave sounders calibrated via numerical data assimilation.',
    typicalRange: '-60°C to +55°C',
    temporalResolution: 'Hourly / Daily / Monthly',
    spatialResolution: 'Point stations up to 0.25° (~25km) gridded',
    availableDateRange: '1940 - Present',
    limitations: [
      'Urban heat island effects can bias local point observations.',
      'Sparse coverage in high-latitude, desert, and open ocean regions.',
      'Diurnal variability requires consistent daily averaging.'
    ],
    recommendedDatasets: ['ERA5_REANALYSIS', 'GHCND', 'AIRS_AIRX3STM']
  },
  {
    id: 'precipitation',
    name: 'Total Precipitation Rate & Accumulation',
    system: 'Atmosphere',
    unit: 'mm/day or mm/month',
    description: 'The amount of liquid or frozen water that condenses and falls from clouds onto the Earth surface.',
    measurementPrinciple: 'Active spaceborne radar (DPR), passive microwave sensors (GMI), ground rain-gauges, and radar networks.',
    typicalRange: '0 to 500 mm/month',
    temporalResolution: 'Daily / Monthly',
    spatialResolution: '0.1° (~10km) to 0.25° (~25km)',
    availableDateRange: '2000 - Present (TRMM/GPM Era)',
    limitations: [
      'High spatial heterogeneity makes regional averages sensitive to boundary definition.',
      'Light rainfall (<0.5 mm/hr) and snowfall detection have higher relative uncertainties.',
      'Convective storm events can produce extreme localized outliers.'
    ],
    recommendedDatasets: ['GPM_3IMERGM.07', 'ERA5_REANALYSIS', 'GHCND']
  },
  {
    id: 'tropospheric-no2',
    name: 'Tropospheric Nitrogen Dioxide (NO2)',
    system: 'Atmosphere',
    unit: '10¹⁵ molecules/cm²',
    description: 'A key air pollutant and tracer of fossil-fuel combustion, industrial activity, and wildfire emissions in the lower atmosphere.',
    measurementPrinciple: 'Ultraviolet-visible solar backscatter spectrometers measuring differential optical absorption (DOAS).',
    typicalRange: '0.1 to 30.0 × 10¹⁵ molec/cm²',
    temporalResolution: 'Daily / Monthly',
    spatialResolution: '0.25° (OMI) to 5.5 x 3.5 km (TROPOMI)',
    availableDateRange: '2004 - Present',
    limitations: [
      'Cloud cover obscures lower tropospheric columns.',
      'Boundary layer height variations affect column-to-surface concentrations.',
      'Short atmospheric lifetime (~hours) requires high temporal sampling.'
    ],
    recommendedDatasets: ['OMI_MINDO2', 'TROPOMI_NO2']
  },

  // 2. LAND
  {
    id: 'land-surface-temperature',
    name: 'Land Surface Temperature (LST)',
    system: 'Land',
    unit: '°C',
    description: 'The radiometric skin temperature of the land surface, indicating how hot the ground surface feels to the touch.',
    measurementPrinciple: 'Thermal infrared radiometry measuring thermal radiance emitted by land, corrected for atmospheric transmission and emissivity.',
    typicalRange: '-40°C to +70°C',
    temporalResolution: 'Daily / 8-Day / Monthly',
    spatialResolution: '1 km (MODIS) to 70 m (ECOSTRESS)',
    availableDateRange: '2000 - Present',
    limitations: [
      'Only available in cloud-free conditions; cloud masking can introduce fair-weather sampling bias.',
      'Differs substantially from 2m air temperature over bare soil and concrete.'
    ],
    recommendedDatasets: ['MOD11A2.061', 'MYD11A2.061', 'ERA5_REANALYSIS']
  },
  {
    id: 'ndvi',
    name: 'Normalized Difference Vegetation Index (NDVI)',
    system: 'Land',
    unit: 'Dimensionless (-1 to +1)',
    description: 'A remote-sensing index measuring photosynthetic active vegetation density, health, and seasonal greenness.',
    measurementPrinciple: 'Contrast between Red absorption (chlorophyll) and Near-Infrared reflectance (mesophyll cell structure): (NIR - RED) / (NIR + RED).',
    typicalRange: '0.0 (bare soil) to 0.9 (dense rainforest)',
    temporalResolution: '16-Day / Monthly',
    spatialResolution: '250m - 1km (MODIS), 30m (Landsat)',
    availableDateRange: '1981 - Present (AVHRR / MODIS / Landsat)',
    limitations: [
      'Saturates over dense, multi-layered forest canopies (NDVI > 0.8).',
      'Atmospheric aerosols, volcanic dust, and persistent tropical cloudiness contaminate signals.'
    ],
    recommendedDatasets: ['MOD13A2.061', 'AVHRR_NDVI']
  },

  // 3. HYDROLOGY
  {
    id: 'soil-moisture',
    name: 'Surface Volumetric Soil Moisture',
    system: 'Hydrology',
    unit: 'm³/m³ (or % saturation)',
    description: 'The water content contained in the upper 5 cm of the soil column, critical for agriculture, flood prediction, and drought monitoring.',
    measurementPrinciple: 'L-band microwave radiometry (1.4 GHz) exploiting high dielectric contrast between liquid water (~80) and dry soil (~4).',
    typicalRange: '0.02 (arid desert) to 0.50 (waterlogged/marsh)',
    temporalResolution: 'Daily / 3-Day',
    spatialResolution: '9 km to 36 km',
    availableDateRange: '2015 - Present (SMAP era), 1979 - Present (CCI)',
    limitations: [
      'Penetration depth is restricted to the top 5 cm (does not directly sample deep root zones).',
      'Dense forest canopies and frozen ground attenuate or invalidate microwave signals.'
    ],
    recommendedDatasets: ['SMAP_L3_SM_P', 'ERA5_REANALYSIS']
  },
  {
    id: 'evapotranspiration',
    name: 'Actual Evapotranspiration (ET)',
    system: 'Hydrology',
    unit: 'mm/day or mm/month',
    description: 'The total loss of water to the atmosphere through evaporation from soil/open water plus transpiration from vegetation.',
    measurementPrinciple: 'Surface energy balance models combining satellite thermal infrared, vegetation indices, solar radiation, and meteorological reanalysis.',
    typicalRange: '0 to 12 mm/day',
    temporalResolution: 'Daily / 8-Day / Monthly',
    spatialResolution: '500m (MODIS MOD16) to 0.25°',
    availableDateRange: '2000 - Present',
    limitations: [
      'Modeled product with inherent parameterization uncertainties in stomatal conductance.',
      'Requires cloud-free thermal radiance observations for accurate surface temperature input.'
    ],
    recommendedDatasets: ['MOD16A2GF.061', 'ERA5_REANALYSIS']
  },
  {
    id: 'water-surface-elevation',
    name: 'Surface Water Elevation & Extent',
    system: 'Hydrology',
    unit: 'm (orthometric height)',
    description: 'Height and surface area of inland water bodies (rivers, lakes, wetlands, reservoirs) above reference geoid.',
    measurementPrinciple: 'Ka-band radar interferometry (SWOT) and nadir radar altimetry (Jason/Sentinel-3) measuring pulse round-trip time and phase interference.',
    typicalRange: '-400 m to +5000 m',
    temporalResolution: '21-day orbit repeat',
    spatialResolution: 'Rivers >50m wide, lakes >62,500 m²',
    availableDateRange: '2023 - Present (SWOT mission)',
    limitations: [
      'Vegetation overhang along riverbanks causes radar shadow and layover.',
      'Steep topography causes radar distortion in narrow mountainous valleys.'
    ],
    recommendedDatasets: ['SWOT_L2_HR_RiverSP', 'SWOT_L2_HR_LakeSP']
  },

  // 4. OCEAN
  {
    id: 'sea-surface-temperature',
    name: 'Sea Surface Temperature (SST)',
    system: 'Ocean',
    unit: '°C',
    description: 'The thermodynamic temperature of the top millimeters to centimeters of the global ocean.',
    measurementPrinciple: 'Infrared radiometers (skin SST) and microwave radiometers (sub-skin SST) blended with in-situ drifter buoys and Argo floats.',
    typicalRange: '-2°C to +35°C',
    temporalResolution: 'Daily / Monthly',
    spatialResolution: '0.05° (~5km) to 0.25° (~25km)',
    availableDateRange: '1981 - Present',
    limitations: [
      'Thermal skin effect: infrared measures top 10-20 micrometers which can be 0.1-0.5°C cooler than bulk water due to evaporative cooling.',
      'Diurnal warming layers form under light winds and strong insolation.'
    ],
    recommendedDatasets: ['GHRSST_MUR_L4', 'NOAA_OISST_V2']
  },
  {
    id: 'ocean-chlorophyll',
    name: 'Ocean Chlorophyll-a Concentration',
    system: 'Ocean',
    unit: 'mg/m³',
    description: 'A primary proxy for phytoplankton biomass, oceanic primary productivity, and marine ecosystem health.',
    measurementPrinciple: 'Ocean color radiometry measuring water-leaving radiance blue-to-green spectral band ratios (e.g. 443/555 nm).',
    typicalRange: '0.01 (oligotrophic gyres) to 30.0 mg/m³ (coastal blooms)',
    temporalResolution: 'Daily / 8-Day / Monthly',
    spatialResolution: '4 km to 9 km global',
    availableDateRange: '1997 - Present (SeaWiFS / MODIS-Aqua / VIIRS)',
    limitations: [
      'Turbid coastal waters with high colored dissolved organic matter (CDOM) and sediment cause standard algorithms to overestimate chlorophyll.',
      'Cloud cover, sea ice, and low sun angles prevent polar winter observations.'
    ],
    recommendedDatasets: ['MODISA_L3m_CHL', 'SeaWiFS_CHL']
  },

  // 5. CRYOSPHERE
  {
    id: 'sea-ice-extent',
    name: 'Sea Ice Concentration & Extent',
    system: 'Cryosphere',
    unit: '% (concentration) & Million km² (extent)',
    description: 'The fractional coverage of sea ice over ocean surface, a prime indicator of polar climate feedback and global energy balance.',
    measurementPrinciple: 'Passive microwave brightness temperatures (19, 37, 85 GHz) identifying emission contrast between ice and open seawater.',
    typicalRange: '0% to 100%',
    temporalResolution: 'Daily / Monthly',
    spatialResolution: '12.5 km to 25 km',
    availableDateRange: '1979 - Present',
    limitations: [
      'Summer melt ponds on ice surfaces are frequently misclassified as open water by microwave algorithms.',
      'Thin ice (<10 cm) has intermediate brightness temperatures leading to underestimation.'
    ],
    recommendedDatasets: ['NSIDC_G02202', 'AMSR2_SEAICE']
  }
];

export function getVariableById(id: string): EarthVariable | undefined {
  return EARTH_VARIABLES.find(v => v.id === id);
}

export function getVariablesBySystem(system: EarthVariable['system']): EarthVariable[] {
  return EARTH_VARIABLES.filter(v => v.system === system);
}

