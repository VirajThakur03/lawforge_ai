// src/phase6/geo/GeoOverride.js

export function applyGeoOverrides(response, geoZone) {
  if (!geoZone || !response) return response;

  const newResponse = { ...response };

  let lawsArr = [];
  if (newResponse.laws) {
    if (Array.isArray(newResponse.laws)) {
      lawsArr = [...newResponse.laws];
    } else if (typeof newResponse.laws === 'string') {
      lawsArr = newResponse.laws.split('\n\n').map(l => l.trim()).filter(l => l.length > 0);
    }
  }

  let nextStepsArr = [];
  if (newResponse.next_steps) {
    if (Array.isArray(newResponse.next_steps)) {
      nextStepsArr = [...newResponse.next_steps];
    } else if (typeof newResponse.next_steps === 'string') {
      nextStepsArr = newResponse.next_steps.split('\n').map(s => s.trim()).filter(s => s.length > 0);
    }
  }
  
  if (geoZone.localMuniCode) {
    lawsArr.unshift(`**[LOCAL ORDINANCE]**\n${geoZone.localMuniCode}`);
  }

  if (geoZone.legalOverrides && geoZone.legalOverrides.length > 0) {
    geoZone.legalOverrides.forEach(override => {
      nextStepsArr.push(`📍 LOCAL RULE: ${override}`);
    });
  }

  if (typeof response.laws === 'string') {
    newResponse.laws = lawsArr.join('\n\n');
  } else {
    newResponse.laws = lawsArr;
  }

  if (typeof response.next_steps === 'string') {
    newResponse.next_steps = nextStepsArr.map((s, i) => {
      if (s.startsWith('📍')) return s;
      const cleanStep = s.replace(/^\d+[.\s]+/, '');
      return `${i + 1}. ${cleanStep}`;
    }).join('\n');
  } else {
    newResponse.next_steps = nextStepsArr;
  }

  if (geoZone.policeStation) {
    if (newResponse.advice) {
      newResponse.advice = `${newResponse.advice}\n\n📍 Local Resource: ${geoZone.policeStation}`;
    } else {
      newResponse.advice = `📍 Local Resource: ${geoZone.policeStation}`;
    }
  }

  return newResponse;
}
