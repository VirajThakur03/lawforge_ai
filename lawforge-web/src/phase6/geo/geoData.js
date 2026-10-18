// src/phase6/geo/geoData.js

export const GEO_ZONES = [
  {
    city: 'Mumbai', district: 'Bandra West', state: 'Maharashtra',
    minLat: 19.04, maxLat: 19.07, minLon: 72.82, maxLon: 72.84,
    policeStation: 'Bandra Police Station — 022-2643 1224',
    courtName: 'Bandra Metropolitan Magistrate Court',
    localMuniCode: 'MCGM Noise Regulation: Loudspeakers strictly prohibited 10 PM to 6 AM.',
    legalOverrides: ['File local grievance at MCGM H-West Ward office before approaching court.']
  },
  {
    city: 'Mumbai', district: 'Andheri East', state: 'Maharashtra',
    minLat: 19.09, maxLat: 19.12, minLon: 72.85, maxLon: 72.89,
    policeStation: 'MIDC Police Station — 022-2836 1234',
    courtName: 'Andheri Magistrate Court',
    localMuniCode: 'MIDC Zone strict parking enforcements.',
    legalOverrides: ['For commercial zones, MIDC bylaws supersede standard municipal bylaws.']
  },
  {
    city: 'Mumbai', district: 'South Mumbai', state: 'Maharashtra',
    minLat: 18.91, maxLat: 18.97, minLon: 72.79, maxLon: 72.84,
    policeStation: 'Colaba Police Station — 022-2285 6817',
    courtName: 'Bombay High Court / Sessions Court',
    localMuniCode: 'Heritage precinct building regulations apply.',
    legalOverrides: ['Alterations to properties require Heritage Committee approval.']
  },
  {
    city: 'Delhi', district: 'New Delhi', state: 'Delhi',
    minLat: 28.58, maxLat: 28.65, minLon: 77.15, maxLon: 77.25,
    policeStation: 'Parliament Street Police Station — 011-2336 1100',
    courtName: 'Patiala House Courts',
    localMuniCode: 'NDMC limits. High security zone provisions apply.',
    legalOverrides: ['Protest gatherings strictly regulated under Section 144 CRPC equivalents locally.']
  },
  {
    city: 'Delhi', district: 'South Delhi', state: 'Delhi',
    minLat: 28.50, maxLat: 28.57, minLon: 77.18, maxLon: 77.28,
    policeStation: 'Hauz Khas Police Station — 011-2686 4220',
    courtName: 'Saket District Court',
    localMuniCode: 'DDA Housing zone regulations.',
    legalOverrides: ['Unlicensed commercial activity in residential zones is subject to immediate MCD sealing.']
  },
  {
    city: 'Bengaluru', district: 'Koramangala', state: 'Karnataka',
    minLat: 12.92, maxLat: 12.94, minLon: 77.61, maxLon: 77.64,
    policeStation: 'Koramangala Police Station — 080-2294 2571',
    courtName: 'Mayo Hall Court',
    localMuniCode: 'BBMP Commercial zoning restrictions block 3 onwards.',
    legalOverrides: ['Noise complaints against pubs are routed via BBMP and local ACP office.']
  },
  {
    city: 'Bengaluru', district: 'Indiranagar', state: 'Karnataka',
    minLat: 12.96, maxLat: 12.99, minLon: 77.63, maxLon: 77.65,
    policeStation: 'Indiranagar Police Station — 080-2294 2568',
    courtName: 'Mayo Hall Court',
    localMuniCode: 'BBMP strict enforcement against illegal commercial conversion.',
    legalOverrides: ['Citizens can file PILs against commercial properties operating without Trade License.']
  },
  {
    city: 'Chennai', district: 'Mylapore', state: 'Tamil Nadu',
    minLat: 13.02, maxLat: 13.05, minLon: 80.25, maxLon: 80.28,
    policeStation: 'Mylapore E-1 Police Station — 044-2345 2345',
    courtName: 'Madras High Court / Egmore Magistrate Court',
    localMuniCode: 'GCC Heritage zone restrictions.',
    legalOverrides: ['Temple precinct traffic restrictions apply.']
  },
  {
    city: 'Hyderabad', district: 'Banjara Hills', state: 'Telangana',
    minLat: 17.40, maxLat: 17.44, minLon: 78.43, maxLon: 78.46,
    policeStation: 'Banjara Hills Police Station — 040-2785 2419',
    courtName: 'Nampally Criminal Courts',
    localMuniCode: 'GHMC high-density commercial routing protocols.',
    legalOverrides: ['Traffic fines for improper parking are severely strictly enforced in this precinct.']
  },
  {
    city: 'Pune', district: 'Koregaon Park', state: 'Maharashtra',
    minLat: 18.53, maxLat: 18.55, minLon: 73.88, maxLon: 73.91,
    policeStation: 'Koregaon Park Police Station — 020-2612 3422',
    courtName: 'Shivajinagar District Court',
    localMuniCode: 'PMC Tree preservation rules.',
    legalOverrides: ['Cutting trees requires PMC Tree Authority NOC. Fines exceed Rs. 50,000.']
  },
  {
    city: 'Pune', district: 'Hinjewadi', state: 'Maharashtra',
    minLat: 18.58, maxLat: 18.61, minLon: 73.72, maxLon: 73.76,
    policeStation: 'Hinjewadi Police Station — 020-2293 2344',
    courtName: 'Shivajinagar District Court',
    localMuniCode: 'PCMC / MIDC combined jurisdiction.',
    legalOverrides: ['IT Parks are categorized under continuous continuous operational zones, easing labor hour restrictions.']
  },
  {
    city: 'Kolkata', district: 'Park Street', state: 'West Bengal',
    minLat: 22.54, maxLat: 22.56, minLon: 88.34, maxLon: 88.36,
    policeStation: 'Park Street Police Station — 033-2229 4504',
    courtName: 'Bankshall Court',
    localMuniCode: 'KMC commercial heritage enforcement.',
    legalOverrides: ['Under KMC Act, specific architectural preservation clauses apply to frontage.']
  },
  {
    city: 'Jaipur', district: 'C-Scheme', state: 'Rajasthan',
    minLat: 26.90, maxLat: 26.93, minLon: 75.79, maxLon: 75.82,
    policeStation: 'Ashok Nagar Police Station — 0141-282 1445',
    courtName: 'Jaipur District Court',
    localMuniCode: 'JMC specific residential limits.',
    legalOverrides: ['Tourist safety protocols mandate immediate FIR registration for foreign nationals.']
  },
  {
    city: 'Ahmedabad', district: 'Navrangpura', state: 'Gujarat',
    minLat: 23.03, maxLat: 23.05, minLon: 72.54, maxLon: 72.57,
    policeStation: 'Navrangpura Police Station — 079-2644 1400',
    courtName: 'Bhadra / Metro Court',
    localMuniCode: 'AMC parking compliance is actively enforced.',
    legalOverrides: ['Gujarat prohibition laws apply strictly. Immediate arrest without warrant for possession.']
  },
  {
    city: 'Panaji', district: 'Central Panaji', state: 'Goa',
    minLat: 15.49, maxLat: 15.51, minLon: 73.81, maxLon: 73.83,
    policeStation: 'Panaji Police Station — 0832-222 5360',
    courtName: 'District and Sessions Court, Panaji',
    localMuniCode: 'CCP limits.',
    legalOverrides: ['Goa Civil Code (Uniform Civil Code) applies to family and succession matters, superseding personal religious laws.']
  }
];
