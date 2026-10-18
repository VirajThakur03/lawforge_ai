// src/phase6/geo/GeoIntelligence.js
import { GEO_ZONES } from './geoData';

export class GeoIntelligence {
  static async detectLocation() {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        (error) => {
          console.error("Geolocation omitted/denied", error);
          resolve(null);
        },
        { timeout: 5000, maximumAge: 60000 }
      );
    });
  }

  static matchZone(lat, lon) {
    if (!lat || !lon) return null;
    
    for (const zone of GEO_ZONES) {
      if (lat >= zone.minLat && lat <= zone.maxLat && 
          lon >= zone.minLon && lon <= zone.maxLon) {
        return zone;
      }
    }
    return null;
  }

  static async getLocalContext() {
    try {
      const cached = sessionStorage.getItem('lf_geozone');
      if (cached) {
        return JSON.parse(cached);
      }
      
      const coords = await this.detectLocation();
      if (!coords) return null;
      
      const matchedZone = this.matchZone(coords.lat, coords.lon);
      if (matchedZone) {
        sessionStorage.setItem('lf_geozone', JSON.stringify(matchedZone));
      }
      return matchedZone;
    } catch (e) {
      console.warn("Geo context resolution failed", e);
      return null;
    }
  }
}
