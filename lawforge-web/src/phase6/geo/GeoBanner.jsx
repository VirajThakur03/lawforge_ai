// src/phase6/geo/GeoBanner.jsx
import { useStore } from '../../store';
import { GeoIntelligence } from './GeoIntelligence';
import { MapPin, X, Settings, Loader2 } from 'lucide-react';
import { useState } from 'react';

export function GeoBanner() {
  const { geoZone, setGeoZone } = useStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const fetchZone = async () => {
    setLoading(true);
    setError(false);
    const zone = await GeoIntelligence.getLocalContext();
    if (zone) {
      setGeoZone(zone);
    } else {
      setError(true);
    }
    setLoading(false);
  };

  if (geoZone) {
    return (
      <div 
        style={{ 
          background: 'rgba(16, 185, 129, 0.1)', 
          border: '1px solid rgba(16, 185, 129, 0.4)', 
          padding: '0.5rem 1rem', 
          borderRadius: '24px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.75rem', 
          marginBottom: '1rem',
          fontSize: '0.8rem',
          color: '#10b981',
          width: 'fit-content'
        }}
      >
        <MapPin size={16} />
        <span style={{ fontWeight: 600 }}>Detected:</span>
        <span>{geoZone.city}, {geoZone.district} · {geoZone.courtName}</span>
        <button 
          onClick={() => {
            sessionStorage.removeItem('lf_geozone');
            setGeoZone(null);
          }}
          style={{ background: 'none', border: 'none', color: '#10b981', cursor: 'pointer', display: 'flex', marginLeft: '0.5rem' }}
        >
          <X size={14} />
        </button>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <button 
        onClick={fetchZone} 
        disabled={loading}
        className="btn-glass"
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem', 
          padding: '0.4rem 0.8rem', 
          fontSize: '0.75rem', 
          color: error ? '#ef4444' : 'var(--on-surface-variant)',
          opacity: 0.8
        }}
      >
        {loading ? <Loader2 size={14} className="spin" /> : <MapPin size={14} />}
        {error ? 'Location access denied or unavailable' : 'Add Location for local laws'}
      </button>
    </div>
  );
}
