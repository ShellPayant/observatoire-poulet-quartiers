// Pure geo helpers for the radius search (unit-testable, no deps).
const R = 6371000; // earth radius, metres
const toRad = (d) => (d * Math.PI) / 180;

export function haversine(lat1, lon1, lat2, lon2) {
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

/** Filter points within `metres` of center [lat,lon]. getLatLon(p) → [lat,lon]. */
export function withinRadius(points, center, metres, getLatLon = (p) => [p.lat, p.lon]) {
  const [clat, clon] = center;
  return points.filter((p) => {
    const [lat, lon] = getLatLon(p);
    return haversine(clat, clon, lat, lon) <= metres;
  });
}

/** Département prefix from an INSEE commune code (handles Corsica 2A/2B, DOM 97x). */
export function depOf(codeCommune) {
  if (!codeCommune) return null;
  return String(codeCommune).slice(0, 2);
}
