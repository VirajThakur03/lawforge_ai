/**
 * LAWFORGE AI — Offline Legal Bundle
 * Merges all country databases into a single lookup object.
 * 100% offline. No API required.
 */

/* global LAWS_IN, LAWS_US, LAWS_GB, LAWS_AU, LAWS_CA, LAWS_AE, LAWS_DE, LAWS_SG, LAWS_PK, LAWS_NG, LAWS_ZA, LAWS_BD, LAWS_MY, LAWS_NZ */

const LAWS_BUNDLE = {
  IN: LAWS_IN,
  US: LAWS_US,
  GB: LAWS_GB,
  AU: LAWS_AU,
  CA: LAWS_CA,
  AE: LAWS_AE,
  DE: LAWS_DE,
  SG: LAWS_SG,
  PK: LAWS_PK,
  NG: LAWS_NG,
  ZA: LAWS_ZA,
  BD: LAWS_BD,
  MY: LAWS_MY,
  NZ: LAWS_NZ,
};

// Countries that have limited data → show partial results + lawyer notice
const LIMITED_DATA_COUNTRIES = ['FR','JP','CN','BR','ET','TZ','UG','CO','CL','NL','SE','NO','CH','PH','TH','ID','TR','EG','IL','PL','PT','RU','KR','LK','NP','MM','VN','IQ','MA','KE','GH','IT','ES','MX','AR'];

const DISCLAIMER_TEXT = "This information is for general educational purposes only. It does not constitute legal advice and should not be relied upon as such. Laws vary by jurisdiction and change frequently. Always consult a qualified, licensed lawyer in your specific jurisdiction for advice on your particular situation.";
