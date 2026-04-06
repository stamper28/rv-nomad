# Fuel Price API Research

## Options Found

### 1. CollectAPI Gas Prices API
- **URL**: https://collectapi.com/api/gasPrice/gas-prices-api
- **Coverage**: USA (by state + city), Canada, Europe, Australia
- **Data**: Gasoline, midGrade, premium, diesel prices per city
- **Endpoints**: /stateUsaPrice (state+cities), /allUsaPrice, /canada, /fromCoordinates, /fromCity
- **Pricing**:
  - Free Trial: All cities daily, 3 days only
  - Basic: $14.90/month, 100 requests/month
  - America (USA+Canada): $29/month, unlimited requests
  - All: $49/month, unlimited, all cities
  - Enterprise: Contact
- **Pros**: City-level prices for USA and Canada, coordinate-based lookup, real-time
- **Cons**: $29/month minimum for USA+Canada, no individual station-level data (city averages)

### 2. Google Places API (FuelPrice)
- **Coverage**: Global
- **Data**: Per-station fuel prices where available
- **Pricing**: $17 per 1000 requests (Place Details)
- **Pros**: Actual station-level prices, real station names/locations
- **Cons**: Expensive at scale, requires Google Maps API key, fuel prices not available everywhere

### 3. HERE Fuel Prices API
- **Coverage**: Global
- **Data**: Station-level prices along routes or near locations
- **Pricing**: Freemium (250K transactions/month free)
- **Pros**: Real station data, route-based search, generous free tier
- **Cons**: Requires HERE API key, may not cover all US stations

### 4. NREL Alternative Fuel Stations API
- **Coverage**: USA
- **Data**: Alternative fuel stations only (EV, CNG, LPG, biodiesel) — NO regular gas/diesel
- **Pricing**: Free with API key
- **Pros**: Free, government data
- **Cons**: Does NOT include regular gasoline or diesel stations

### 5. EIA API (current approach)
- **Coverage**: USA by PADD region
- **Data**: Weekly state/regional averages for gasoline and diesel
- **Pricing**: Free with API key (DEMO_KEY available)
- **Pros**: Free, official government data, accurate regional averages
- **Cons**: Regional averages only, not per-station, weekly updates

## Recommendation
- **Best free option**: Keep EIA regional averages (current approach) — accurate, free, no key needed
- **Best paid option for city-level**: CollectAPI America plan ($29/month) — city-level prices for USA+Canada
- **Best for station-level**: Google Places API or HERE Fuel Prices — actual per-station data but more expensive
