export function calculateBBoxFromCoordinates(
  coordinates: number[][][]
): { minLat: number; minLng: number; maxLat: number; maxLng: number } {
  let minLat = Infinity;
  let minLng = Infinity;
  let maxLat = -Infinity;
  let maxLng = -Infinity;

  for (const ring of coordinates) {
    for (const [lng, lat] of ring) {
      minLat = Math.min(minLat, lat);
      maxLat = Math.max(maxLat, lat);
      minLng = Math.min(minLng, lng);
      maxLng = Math.max(maxLng, lng);
    }
  }

  return { minLat, minLng, maxLat, maxLng };
}

export function expandBBox(
  bbox: { minLat: number; minLng: number; maxLat: number; maxLng: number },
  percent: number = 10
) {
  const latDiff = (bbox.maxLat - bbox.minLat) * (percent / 100);
  const lngDiff = (bbox.maxLng - bbox.minLng) * (percent / 100);

  return {
    minLat: bbox.minLat - latDiff,
    minLng: bbox.minLng - lngDiff,
    maxLat: bbox.maxLat + latDiff,
    maxLng: bbox.maxLng + lngDiff,
  };
}
