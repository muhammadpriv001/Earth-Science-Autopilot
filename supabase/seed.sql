-- ==============================================================================
-- THE EARTH SCIENCE AUTOPILOT — SEED DATA
-- ==============================================================================

INSERT INTO public.datasets (provider, external_dataset_id, title, description, metadata_json, source_url)
VALUES
(
    'NASA_CMR',
    'MOD11A2.061',
    'MODIS/Terra Land Surface Temperature/Emissivity 8-Day L3 Global 1km SIN Grid',
    'MOD11A2 Version 6.1 product provides an 8-day average land surface temperature (LST) in a 1200 x 1200 kilometer grid at 1 kilometer resolution.',
    '{"platform": "Terra", "sensor": "MODIS", "spatial_resolution": "1 km", "temporal_resolution": "8-day", "processing_level": "3", "variables": ["Land Surface Temperature", "Emissivity"]}'::jsonb,
    'https://doi.org/10.5067/MODIS/MOD11A2.061'
),
(
    'NASA_CMR',
    'GPM_3IMERGM.07',
    'GPM IMERG Final Precipitation L3 1 month 0.1 degree x 0.1 degree V07',
    'Global Precipitation Measurement (GPM) Integrated Multi-satellitE Retrievals for GPM (IMERG) monthly precipitation estimate.',
    '{"platform": "GPM", "sensor": "GMI/DPR", "spatial_resolution": "0.1 deg (~10km)", "temporal_resolution": "Monthly", "processing_level": "3", "variables": ["Precipitation Rate", "Accumulated Precipitation"]}'::jsonb,
    'https://doi.org/10.5067/GPM/IMERG/3B-MONTH/07'
),
(
    'NOAA_CDO',
    'GHCND',
    'Global Historical Climatology Network - Daily (GHCND)',
    'Comprehensive global daily station observations of maximum/minimum temperature, precipitation, snowfall, and snow depth from thousands of land surface stations.',
    '{"provider": "NOAA NCEI", "spatial_resolution": "Point Station", "temporal_resolution": "Daily", "variables": ["TMAX", "TMIN", "PRCP", "SNOW"]}'::jsonb,
    'https://www.ncei.noaa.gov/products/land-based-station/global-historical-climatology-network-daily'
),
(
    'OPEN_METEO',
    'ERA5_REANALYSIS',
    'ECMWF ERA5 Atmospheric Reanalysis Global Hourly & Daily',
    'Fifth generation ECMWF atmospheric reanalysis of the global climate covering from 1940 to present day, providing complete spatial and temporal consistency.',
    '{"provider": "ECMWF / Copernicus", "spatial_resolution": "0.25 deg (~25km)", "temporal_resolution": "Daily / Hourly", "variables": ["2m Temperature", "Precipitation", "Soil Moisture", "Surface Solar Radiation"]}'::jsonb,
    'https://open-meteo.com/en/docs/historical-weather-api'
)
ON CONFLICT (provider, external_dataset_id) DO NOTHING;

