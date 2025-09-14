export function haversine(aLat:number, aLon:number, bLat:number, bLon:number) {
  const toRad = (d:number) => d * Math.PI / 180;
  const R = 6371000;
  const dLat = toRad(bLat - aLat), dLon = toRad(bLon - aLon);
  const A = Math.sin(dLat/2)**2 + Math.cos(toRad(aLat))*Math.cos(toRad(bLat))*Math.sin(dLon/2)**2;
  return 2 * R * Math.asin(Math.sqrt(A));
}
