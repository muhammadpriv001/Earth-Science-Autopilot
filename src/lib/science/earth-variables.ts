// ==============================================================================
// THE EARTH SCIENCE AUTOPILOT — EXPANDED EARTH SYSTEM VARIABLE CATALOG
// ==============================================================================
// Complete coverage of 11 Earth System domains according to NASA Space Apps 2026:
// "Be An Earth System Trend Detective!"
// ==============================================================================

import { EarthVariable } from '@/types';

export const EARTH_VARIABLES: EarthVariable[] = [
  // ----------------------------------------------------------------------------
  // 1. VEGETATION & BIOSPHERE
  // ----------------------------------------------------------------------------
  {
    id: 'ndvi',
    name: 'Normalized Difference Vegetation Index (NDVI)',
    system: 'Vegetation & Biosphere',
    unit: 'Index (-1.0 to +1.0)',
    description: 'A normalized ratio of near-infrared and red reflectances quantifying canopy greenness, photosynthetic activity, and vegetation vigor.',
    simpleExplanation: 'Measures how green and healthy plants are by looking at how they absorb red light and reflect near-infrared sunlight.',
    measurementPrinciple: 'Calculated as (NIR - Red) / (NIR + Red) from multispectral optical satellite sensors (MODIS, Landsat 8/9, Sentinel-2).',
    typicalRange: '0.1 (arid/desert) to 0.85 (dense tropical rainforest)',
    temporalResolution: '16-Day composite / Monthly',
    spatialResolution: '250m (MODIS) / 30m (Landsat) / 10m (Sentinel-2)',
    availableDateRange: '1981 - Present (AVHRR / MODIS / VIIRS)',
    limitations: [
      'Saturates over dense, multi-layered forest canopies (NDVI > 0.8).',
      'Persistent cloud cover, smoke, and shadow cause false downward browning spikes.',
      'Soil background color can distort values in sparsely vegetated arid regions.'
    ],
    recommendedDatasets: ['MOD13Q1.061', 'MYD13Q1.061', 'LANDSAT_SR_NDVI']
  },
  {
    id: 'evi',
    name: 'Enhanced Vegetation Index (EVI)',
    system: 'Vegetation & Biosphere',
    unit: 'Index (-1.0 to +1.0)',
    description: 'An optimized vegetation index designed to enhance vegetation signal with improved sensitivity in high-biomass regions through atmospheric de-coupling.',
    simpleExplanation: 'An improved greenness index that doesn’t saturate in dense rainforests and corrects for haze and background soil.',
    measurementPrinciple: 'Calculated as 2.5 * ((NIR - Red) / (NIR + 6*Red - 7.5*Blue + 1)) to minimize canopy background noise and aerosol scattering.',
    typicalRange: '0.05 to 0.90',
    temporalResolution: '16-Day composite / Monthly',
    spatialResolution: '250m to 500m',
    availableDateRange: '2000 - Present',
    limitations: [
      'Requires accurate blue band calibration; residual cloud haze can affect the denominator.',
      'Slightly higher noise than NDVI in rugged mountainous terrain.'
    ],
    recommendedDatasets: ['MOD13A1.061', 'VNP13A1']
  },
  {
    id: 'lai-fpar',
    name: 'Leaf Area Index (LAI) & FPAR',
    system: 'Vegetation & Biosphere',
    unit: 'm²/m² (LAI) & Fraction 0-1 (FPAR)',
    description: 'LAI quantifies total green leaf area per unit ground surface area; FPAR measures the fraction of photosynthetically active radiation absorbed by vegetation.',
    simpleExplanation: 'Measures the thickness of plant canopies and how much solar energy plants absorb for photosynthesis.',
    measurementPrinciple: '3D radiative transfer model inversion using MODIS/VIIRS surface reflectance bands.',
    typicalRange: '0 to 8 m²/m²',
    temporalResolution: '4-Day / 8-Day / Monthly',
    spatialResolution: '500m global',
    availableDateRange: '2000 - Present',
    limitations: [
      'Model inversion defaults to backup biome look-up tables during prolonged overcast periods.',
      'Canopy saturation limits dynamic sensitivity in dense equatorial forests.'
    ],
    recommendedDatasets: ['MOD15A2H.061', 'MCD15A2H.061']
  },
  {
    id: 'gpp-npp',
    name: 'Gross & Net Primary Productivity (GPP / NPP)',
    system: 'Vegetation & Biosphere',
    unit: 'g C / m² / day & kg C / m² / year',
    description: 'The rate at which vegetation assimilates atmospheric carbon dioxide through photosynthesis (GPP) minus autotrophic respiration losses (NPP).',
    simpleExplanation: 'The primary scorecard of how much carbon plants remove from the air into biomass each season.',
    measurementPrinciple: 'Radiation use efficiency models combining satellite FPAR with gridded meteorological reanalysis (daily temperature, vapor pressure deficit, solar radiation).',
    typicalRange: '0 to 3500 g C/m²/yr',
    temporalResolution: '8-Day / Annual',
    spatialResolution: '500m gridded',
    availableDateRange: '2000 - Present',
    limitations: [
      'Model-dependent on meteorological reanalysis inputs; biases in vapor pressure deficit translate into productivity errors.',
      'Does not directly measure root carbon allocation.'
    ],
    recommendedDatasets: ['MOD17A2H.061', 'MOD17A3HGF.061']
  },
  {
    id: 'forest-cover-loss',
    name: 'Forest Canopy Cover & Annual Loss',
    system: 'Vegetation & Biosphere',
    unit: '% Canopy & Annual Hectares Lost',
    description: 'High-resolution tree canopy closure percentage and annual stand-replacement forest disturbance from logging, wildfires, and agricultural clearing.',
    simpleExplanation: 'Tracks deforestation and forest loss tree-by-tree across the globe using Landsat imagery.',
    measurementPrinciple: 'Multi-decadal time-series analysis of 30-meter Landsat optical and shortwave infrared reflectance (Hansen Global Forest Change).',
    typicalRange: '0% to 100% canopy cover',
    temporalResolution: 'Annual update',
    spatialResolution: '30 meters (~0.00025°)',
    availableDateRange: '2000 - 2024',
    limitations: [
      'Cannot distinguish between sustainable timber plantation harvest cycles and permanent deforestation.',
      'Sub-canopy selective logging without complete canopy removal is difficult to detect.'
    ],
    recommendedDatasets: ['UMD_HANSEN_GFC_V1_11', 'GFW_TREE_LOSS']
  },
  {
    id: 'aboveground-biomass',
    name: 'Aboveground Forest Biomass Density (AGBD)',
    system: 'Vegetation & Biosphere',
    unit: 'Megagrams per Hectare (Mg/ha)',
    description: 'Dry mass of live woody matter above the ground, representing terrestrial forest carbon reservoirs.',
    simpleExplanation: 'Estimates the weight of living trees to calculate how much carbon is stored in our forests.',
    measurementPrinciple: 'Full-waveform lidar altimetry (GEDI / ICESat-2) measuring vertical canopy structure combined with wall-to-wall radar (PALSAR) and optical imagery.',
    typicalRange: '0 to 450 Mg/ha',
    temporalResolution: 'Multi-year mission synthesis',
    spatialResolution: '1 km gridded / 25m footprint profiles',
    availableDateRange: '2019 - Present',
    limitations: [
      'GEDI sampling is constrained between 51.6° N and 51.6° S latitudes.',
      'Extremely dense rainforests (>300 Mg/ha) exhibit saturation and higher estimation errors.'
    ],
    recommendedDatasets: ['GEDI04_B_V002', 'ESA_BIOMASS_CCI']
  },

  // ----------------------------------------------------------------------------
  // 2. ATMOSPHERE & CLIMATE
  // ----------------------------------------------------------------------------
  {
    id: 'air-temperature',
    name: 'Near-Surface Air Temperature (2m)',
    system: 'Atmosphere & Climate',
    unit: '°C',
    description: 'The temperature of the air at 2 meters above the surface, representing thermal energy trends and human heat exposure.',
    simpleExplanation: 'Standard thermometer weather station temperature, calibrated globally using satellites.',
    measurementPrinciple: 'In-situ meteorological stations blended with infrared/microwave sounders (AIRS/IASI) through numerical reanalysis.',
    typicalRange: '-60°C to +55°C',
    temporalResolution: 'Hourly / Daily / Monthly',
    spatialResolution: '0.1° (~10km) to 0.25° (~25km)',
    availableDateRange: '1940 - Present',
    limitations: [
      'Urban heat islands create microclimate warming biases in station records.',
      'Interpolation uncertainty in rugged mountain terrains with sparse weather stations.'
    ],
    recommendedDatasets: ['ERA5_REANALYSIS', 'NOAA_GHCND', 'AIRS_AIRX3STM']
  },
  {
    id: 'tropospheric-no2',
    name: 'Tropospheric Nitrogen Dioxide (NO2)',
    system: 'Atmosphere & Climate',
    unit: '10¹⁵ molecules/cm²',
    description: 'A short-lived reactive trace gas and prime indicator of fossil fuel combustion, vehicular traffic, and industrial pollution.',
    simpleExplanation: 'Satellite-measured smog and urban fossil fuel air pollution.',
    measurementPrinciple: 'Solar backscatter ultraviolet-visible absorption spectroscopy (TROPOMI on Sentinel-5P / OMI on Aura).',
    typicalRange: '0.1 to 35.0 × 10¹⁵ molec/cm²',
    temporalResolution: 'Daily / Monthly',
    spatialResolution: '3.5 x 5.5 km (TROPOMI) / 13 x 24 km (OMI)',
    availableDateRange: '2004 - Present',
    limitations: [
      'Thick clouds shield the lowest tropospheric column from view.',
      'Surface albedo over snow/ice can distort retrieval algorithms.'
    ],
    recommendedDatasets: ['S5P_L2_NO2', 'OMI_OMNO2d']
  },
  {
    id: 'atmospheric-co2',
    name: 'Atmospheric Carbon Dioxide (XCO2)',
    system: 'Atmosphere & Climate',
    unit: 'ppm (parts per million)',
    description: 'The column-averaged dry-air mole fraction of carbon dioxide, the dominant anthropogenic greenhouse gas driving global warming.',
    simpleExplanation: 'The global concentration of carbon dioxide in the air trapping heat on Earth.',
    measurementPrinciple: 'High-resolution grating spectrometers (OCO-2 / OCO-3) measuring absorption bands of CO2 and molecular oxygen in reflected sunlight.',
    typicalRange: '315 ppm (1958) to 425+ ppm (present)',
    temporalResolution: 'Daily soundings / Monthly gridded',
    spatialResolution: '1.29 x 2.25 km soundings / 2° gridded',
    availableDateRange: '2014 - Present (OCO-2 Era)',
    limitations: [
      'Cloud and aerosol optical thickness must be low for valid retrievals.',
      'High-latitude winter observations are impossible due to solar illumination constraints.'
    ],
    recommendedDatasets: ['OCO2_L2_Lite_FP', 'NOAA_ESRL_MAUNA_LOA']
  },

  // ----------------------------------------------------------------------------
  // 3. PRECIPITATION & METEOROLOGY
  // ----------------------------------------------------------------------------
  {
    id: 'precipitation',
    name: 'Total Precipitation Rate & Accumulation',
    system: 'Precipitation & Meteorology',
    unit: 'mm/day or mm/month',
    description: 'The amount of liquid or frozen water falling onto Earth from convective clouds and frontal storm systems.',
    simpleExplanation: 'Rainfall and snowfall measured by satellite radars and global rain gauges.',
    measurementPrinciple: 'Dual-frequency precipitation radar (Ku/Ka band) and multi-channel passive microwave radiometers calibrated against ground networks (NASA GPM IMERG).',
    typicalRange: '0 to 600 mm/month',
    temporalResolution: 'Half-Hourly / Daily / Monthly',
    spatialResolution: '0.1° (~10km) global',
    availableDateRange: '2000 - Present',
    limitations: [
      'Very light drizzle (<0.5 mm/hr) and snowfall have higher relative uncertainties.',
      'Convective downpours can have sharp local boundaries within a 10km grid cell.'
    ],
    recommendedDatasets: ['GPM_3IMERGM.07', 'ERA5_PRECIP', 'CHIRPS_V2']
  },
  {
    id: 'spei-drought',
    name: 'Standardized Precipitation-Evapotranspiration Index (SPEI)',
    system: 'Precipitation & Meteorology',
    unit: 'Standardized Deviations (Z-score)',
    description: 'A multi-scalar drought index accounting for both precipitation supply and atmospheric evaporative demand driven by temperature.',
    simpleExplanation: 'A scientific drought score: negative numbers mean drought, positive mean surplus moisture.',
    measurementPrinciple: 'Climatological difference between precipitation (P) and potential evapotranspiration (PET) fitted to a log-logistic distribution across multiple timescales (1 to 24 months).',
    typicalRange: '-3.0 (extreme drought) to +3.0 (extreme moisture surplus)',
    temporalResolution: 'Monthly',
    spatialResolution: '0.25° to 0.5° gridded',
    availableDateRange: '1950 - Present',
    limitations: [
      'Choice of PET formula (Thornthwaite vs. Penman-Monteith) can influence trend magnitude in warming climates.',
      'Does not account for human groundwater pumping interventions.'
    ],
    recommendedDatasets: ['SPEI_BASE_V2', 'GLOBAL_DROUGHT_MONITOR']
  },

  // ----------------------------------------------------------------------------
  // 4. SOIL & LAND MOISTURE
  // ----------------------------------------------------------------------------
  {
    id: 'soil-moisture',
    name: 'Volumetric Soil Moisture (0-5 cm Surface & Root-Zone)',
    system: 'Soil & Land Moisture',
    unit: 'm³/m³ (or % saturation)',
    description: 'The volume of water contained within the topsoil pore space, regulating land-atmosphere energy exchange and crop germination.',
    simpleExplanation: 'How wet or dry the soil is, which determines plant growth and drought intensity.',
    measurementPrinciple: 'L-band microwave radiometry (1.4 GHz) measuring dielectric permittivity contrasts between liquid water (~80) and dry soil (~3) (NASA SMAP / ESA SMOS).',
    typicalRange: '0.02 (hyper-arid sand) to 0.55 m³/m³ (saturated peat/clay)',
    temporalResolution: 'Daily / 3-Day repeat',
    spatialResolution: '9 km (enhanced) to 36 km',
    availableDateRange: '2015 - Present (SMAP Era)',
    limitations: [
      'Radio-Frequency Interference (RFI) from military radar and wireless signals can corrupt raw brightness temperatures.',
      'Dense vegetation canopies (>5 kg/m² biomass) attenuate microwave signals from underlying soil.'
    ],
    recommendedDatasets: ['SPL3SMP_E.005', 'ESA_CCI_SOILMOISTURE']
  },

  // ----------------------------------------------------------------------------
  // 5. HYDROLOGY & FRESHWATER
  // ----------------------------------------------------------------------------
  {
    id: 'surface-water-elevation',
    name: 'Inland Surface Water Elevation & Extent',
    system: 'Hydrology & Freshwater',
    unit: 'Meters (WGS84 Height) & km²',
    description: 'The absolute water surface elevation and spatial perimeter of rivers, lakes, reservoirs, and floodwaters.',
    simpleExplanation: 'Satellite radar measuring the exact water level and boundary of lakes and rivers worldwide.',
    measurementPrinciple: 'Wide-swath Ka-band radar interferometry (KaRIn) measuring water height with sub-decimeter precision across a 120km swath (NASA/CNES SWOT).',
    typicalRange: '-430m (Dead Sea) to +5000m (Alpine lakes)',
    temporalResolution: '21-Day repeat sub-cycle',
    spatialResolution: '10m to 100m water pixel resolution',
    availableDateRange: '2023 - Present (SWOT Mission)',
    limitations: [
      'Steep mountain canyon shadow and layover can obstruct narrow mountain tributaries.',
      'Dense overhanging tree canopies can interfere with shorelines.'
    ],
    recommendedDatasets: ['SWOT_L2_HR_RiverSP', 'SWOT_L2_HR_LakeSP']
  },
  {
    id: 'terrestrial-water-storage',
    name: 'Terrestrial Water Storage Anomaly (GRACE-FO)',
    system: 'Hydrology & Freshwater',
    unit: 'cm Equivalent Water Thickness (EWT)',
    description: 'The total vertically-integrated mass of water on and beneath land surfaces, including deep groundwater, root-zone moisture, snow, and surface reservoirs.',
    simpleExplanation: 'Weighs water from space using twin satellites to track disappearing deep underground aquifers.',
    measurementPrinciple: 'Ultra-precise satellite-to-satellite laser interferometry measuring sub-micrometer distance changes caused by Earth gravitational anomalies.',
    typicalRange: '-25 cm to +25 cm EWT anomaly',
    temporalResolution: 'Monthly',
    spatialResolution: '300 km (~3° footprint filtered)',
    availableDateRange: '2002 - Present (GRACE & GRACE-FO)',
    limitations: [
      'Coarse spatial resolution (~300km) makes it impossible to isolate individual small agricultural basins without hydrologic modeling.',
      'Data latency is typically 1-2 months behind real-time.'
    ],
    recommendedDatasets: ['GRACE_JPL_RL06_TELLUS', 'GRACE_CSR_MASCON']
  },

  // ----------------------------------------------------------------------------
  // 6. OCEANS & MARINE ECOSYSTEMS
  // ----------------------------------------------------------------------------
  {
    id: 'sea-surface-temperature',
    name: 'Sea Surface Temperature (SST)',
    system: 'Oceans & Marine Ecosystems',
    unit: '°C',
    description: 'The thermodynamic temperature of the global ocean surface, governing hurricane genesis, coral bleaching, and atmospheric teleconnections (El Niño/La Niña).',
    simpleExplanation: 'The temperature of the surface ocean, crucial for marine life and global climate patterns.',
    measurementPrinciple: 'Infrared radiometry (AVHRR / MODIS / VIIRS) and microwave radiometers (AMSR2) combined with Argo floats and drifting buoys.',
    typicalRange: '-2°C to +35°C',
    temporalResolution: 'Daily / Monthly',
    spatialResolution: '0.01° (~1km) to 0.25° (~25km)',
    availableDateRange: '1981 - Present',
    limitations: [
      'Thermal skin layer effect: top 10 micrometers is typically 0.1-0.3°C cooler than the bulk water below due to latent heat loss.',
      'Heavy cloud cover obstructs infrared sensors.'
    ],
    recommendedDatasets: ['GHRSST_MUR_L4', 'NOAA_OISST_V2']
  },
  {
    id: 'ocean-chlorophyll',
    name: 'Ocean Chlorophyll-a Concentration',
    system: 'Oceans & Marine Ecosystems',
    unit: 'mg/m³',
    description: 'A primary optical proxy for marine phytoplankton biomass and base of the marine food web.',
    simpleExplanation: 'Measures microscopic green algae in the ocean from space to evaluate ocean health.',
    measurementPrinciple: 'Multi-band ocean color blue-to-green reflectance ratios (443/555 nm) measuring water-leaving spectral radiance.',
    typicalRange: '0.01 (open ocean gyres) to 30.0 mg/m³ (coastal upwellings)',
    temporalResolution: 'Daily / 8-Day / Monthly',
    spatialResolution: '4 km global',
    availableDateRange: '1997 - Present',
    limitations: [
      'Turbid coastal waters with high suspended sediment and dissolved organic matter (CDOM) can distort algorithms.',
      'Low solar angles and sea ice prevent winter observations in polar latitudes.'
    ],
    recommendedDatasets: ['MODISA_L3m_CHL', 'PACE_OCI_CHL']
  },

  // ----------------------------------------------------------------------------
  // 7. CRYOSPHERE
  // ----------------------------------------------------------------------------
  {
    id: 'sea-ice-extent',
    name: 'Sea Ice Concentration & Extent',
    system: 'Cryosphere',
    unit: '% Concentration & Million km² Extent',
    description: 'Fractional sea ice cover over polar oceans, governing Earth albedo and global climate heat reflection.',
    simpleExplanation: 'Tracks the shrinkage of Arctic and Antarctic sea ice from satellite microwave imagery.',
    measurementPrinciple: 'Passive microwave brightness temperature contrast between sea ice and open ocean water (SSM/I, AMSR2).',
    typicalRange: '0% to 100% concentration',
    temporalResolution: 'Daily / Monthly',
    spatialResolution: '12.5 km to 25 km',
    availableDateRange: '1979 - Present',
    limitations: [
      'Summer melt ponds atop the ice absorb microwaves and are frequently misclassified as open water.',
      'Thin ice (<10 cm) has intermediate microwave emission leading to slight underestimation.'
    ],
    recommendedDatasets: ['NSIDC_G02202', 'AMSR2_SEAICE']
  },
  {
    id: 'snow-water-equivalent',
    name: 'Snow Cover Extent & Snow Water Equivalent (SWE)',
    system: 'Cryosphere',
    unit: '% Cover & mm of Water Equivalent',
    description: 'The area of land blanketed by snow and the depth of water that would result if the snowpack melted entirely.',
    simpleExplanation: 'Measures snowpack volume to predict spring river runoff and water availability.',
    measurementPrinciple: 'Optical Normalized Difference Snow Index (NDSI) for extent; passive microwave scattering attenuation for depth and SWE.',
    typicalRange: '0 to 1200 mm SWE',
    temporalResolution: 'Daily / 8-Day',
    spatialResolution: '500m (optical cover) / 25 km (SWE)',
    availableDateRange: '2000 - Present',
    limitations: [
      'Wet melting snow emits high microwave radiation, preventing reliable microwave depth retrievals.',
      'Dense coniferous forests mask under-canopy snow cover.'
    ],
    recommendedDatasets: ['MOD10A1.061', 'AMSR2_SWE']
  },

  // ----------------------------------------------------------------------------
  // 8. LAND SURFACE & LAND USE
  // ----------------------------------------------------------------------------
  {
    id: 'land-surface-temperature',
    name: 'Land Surface Temperature (LST Day & Night)',
    system: 'Land Surface & Land Use',
    unit: '°C',
    description: 'The radiative skin temperature of the land surface (soil, vegetation, asphalt), directly capturing urban heat island amplification.',
    simpleExplanation: 'How hot the actual ground surface feels to the touch from satellite thermal cameras.',
    measurementPrinciple: 'Thermal infrared split-window algorithms using MODIS/VIIRS/Landsat bands (10.5 - 12.5 μm) with emissivity corrections.',
    typicalRange: '-45°C to +70°C',
    temporalResolution: 'Daily (Day & Night passes) / 8-Day',
    spatialResolution: '1 km (MODIS) / 70m-100m (Landsat/ECOSTRESS)',
    availableDateRange: '2000 - Present',
    limitations: [
      'Directly blocked by cloud cover.',
      'Surface emissivity varies sharply between dry soil, concrete, asphalt, and lush vegetation.'
    ],
    recommendedDatasets: ['MOD11A2.061', 'ECOSTRESS_L2_LST']
  },

  // ----------------------------------------------------------------------------
  // 9. FIRE & ENVIRONMENTAL DISASTERS
  // ----------------------------------------------------------------------------
  {
    id: 'active-fire-firms',
    name: 'Active Fire Hotspots & Fire Radiative Power (FRP)',
    system: 'Fire & Environmental Disasters',
    unit: 'Hotspot Count & Megawatts (MW)',
    description: 'Near-real-time detection of actively burning thermal anomalies and rate of heat energy release from wildfires and agricultural burning.',
    simpleExplanation: 'Real-time detection of wildfires and forest burns from space.',
    measurementPrinciple: 'Mid-infrared (3.9 μm) and thermal (11 μm) radiance detection of sub-pixel combustion anomalies (NASA FIRMS / VIIRS).',
    typicalRange: '1 MW to 10,000+ MW per fire cluster',
    temporalResolution: 'Every 3 to 12 hours (Near-Real-Time)',
    spatialResolution: '375m (VIIRS I-band) / 1 km (MODIS)',
    availableDateRange: '2000 - Present',
    limitations: [
      'Thick pyrocumulus smoke columns and clouds obscure small ground fires.',
      'Short-duration agricultural burnings occurring between satellite overpasses can be missed.'
    ],
    recommendedDatasets: ['FIRMS_VIIRS_375M', 'FIRMS_MODIS_1KM']
  },
  {
    id: 'burned-area-mcd64',
    name: 'Burned Area Extent & Severity',
    system: 'Fire & Environmental Disasters',
    unit: 'Hectares / km² burned',
    description: 'Post-fire scars and charred vegetation footprints mapped after the flame front passes, providing definitive damage assessment.',
    simpleExplanation: 'Maps the exact footprint and scars left behind by wildfires.',
    measurementPrinciple: 'Multi-temporal 500-meter MODIS surface reflectance change detection in shortwave infrared (SWIR) and near-infrared (NIR).',
    typicalRange: '0 to 1,000,000 hectares',
    temporalResolution: 'Monthly burned area product',
    spatialResolution: '500m global',
    availableDateRange: '2000 - Present',
    limitations: [
      'Rapid post-fire grass regrowth in tropical savannas can cause burned scars to fade within weeks.',
      'Understory ground fires beneath dense intact tree canopies leave minimal overhead canopy scars.'
    ],
    recommendedDatasets: ['MCD64A1.061', 'SENTINEL2_NBR']
  },

  // ----------------------------------------------------------------------------
  // 10. SOLID EARTH & GEOPHYSICAL CHANGES
  // ----------------------------------------------------------------------------
  {
    id: 'land-subsidence',
    name: 'Land Subsidence & Surface Displacement (InSAR)',
    system: 'Solid Earth & Geophysical Changes',
    unit: 'mm/year (Vertical Velocity)',
    description: 'Millimeter-scale ground displacement, aquifer-compaction subsidence, and tectonic uplift.',
    simpleExplanation: 'Detects the sinking or rising of ground surfaces down to millimeters per year using radar satellites.',
    measurementPrinciple: 'Interferometric Synthetic Aperture Radar (InSAR) phase-difference analysis across repeat satellite radar passes (Sentinel-1 / NISAR).',
    typicalRange: '-300 mm/yr (severe subsidence) to +50 mm/yr (uplift)',
    temporalResolution: '6 to 12-day repeat cycles / Annual velocity',
    spatialResolution: '20m to 100m gridded velocity',
    availableDateRange: '2014 - Present (Sentinel-1 Era)',
    limitations: [
      'Dense vegetated landscapes cause temporal decorrelation of the radar phase signal.',
      'Atmospheric water vapor delays can introduce phase noise requiring tropospheric correction models.'
    ],
    recommendedDatasets: ['SENTINEL1_INSAR', 'COMET_LIOCS']
  },

  // ----------------------------------------------------------------------------
  // 11. HUMAN DIMENSIONS & EXPOSURE
  // ----------------------------------------------------------------------------
  {
    id: 'urban-heat-exposure',
    name: 'Population Exposure to Extreme Heat & Climate Hazards',
    system: 'Human Dimensions & Exposure',
    unit: 'Person-Days > 35°C & % Vulnerability',
    description: 'Spatial intersection of high-resolution human settlement distribution with satellite temperature anomalies, assessing climate vulnerability.',
    simpleExplanation: 'Measures how many people live in extreme heat zones and lack green space cooling.',
    measurementPrinciple: 'Overlay of Global Human Settlement Layer (GHSL) population grids with satellite Land Surface Temperature and ERA5 wet-bulb temperatures.',
    typicalRange: '0 to 365 heat stress days/year',
    temporalResolution: 'Annual multi-year synthesis',
    spatialResolution: '100m to 1km gridded',
    availableDateRange: '2000 - Present',
    limitations: [
      'Census-based disaggregation in informal settlements can have higher demographic uncertainty.',
      'Indoor air conditioning access is not directly observable from space.'
    ],
    recommendedDatasets: ['GHSL_POP_V2', 'SEDAC_POP_DENSITY']
  }
];

export function getVariableById(id: string): EarthVariable | undefined {
  return EARTH_VARIABLES.find(v => v.id === id);
}

export function getVariablesBySystem(system: EarthVariable['system']): EarthVariable[] {
  return EARTH_VARIABLES.filter(v => v.system === system);
}

export const ALL_EARTH_SYSTEMS: EarthVariable['system'][] = [
  'Vegetation & Biosphere',
  'Atmosphere & Climate',
  'Precipitation & Meteorology',
  'Soil & Land Moisture',
  'Hydrology & Freshwater',
  'Oceans & Marine Ecosystems',
  'Cryosphere',
  'Land Surface & Land Use',
  'Fire & Environmental Disasters',
  'Solid Earth & Geophysical Changes',
  'Human Dimensions & Exposure',
];
