// Lightweight Largest-Triangle-Three-Buckets (LTTB) downsampling
// For uniform x spacing datasets. For scatter, expects points with x,y in [0,100].

export function lttb(values: number[], threshold = 120): number[] {
  const dataLength = values.length;
  if (threshold >= dataLength || threshold < 3) return values.slice();
  const sampled: number[] = [];
  const bucketSize = (dataLength - 2) / (threshold - 2);
  let a = 0;
  sampled.push(values[a]);
  for (let i = 0; i < threshold - 2; i++) {
    const rangeStart = Math.floor((i + 1) * bucketSize) + 1;
    const rangeEnd = Math.floor((i + 2) * bucketSize) + 1;
    const rangeEndClamped = Math.min(rangeEnd, dataLength);
    // Average for next bucket
    let avgY = 0;
    const avgRangeStart = rangeStart;
    const avgRangeEnd = rangeEndClamped;
    const avgRangeLen = avgRangeEnd - avgRangeStart;
    for (let j = avgRangeStart; j < avgRangeEnd; j++) avgY += values[j];
    avgY /= Math.max(1, avgRangeLen);
    // Pick point in [rangeStart-1, rangeEndClamped-1] that maximizes area with point a and avg
    const rangeOffStart = Math.floor(i * bucketSize) + 1;
    const rangeOffEnd = rangeStart;
    let maxArea = -1;
    let nextA = rangeOffStart;
    for (let j = rangeOffStart; j < rangeOffEnd; j++) {
      const ax = a;
      const ay = values[a];
      const bx = j;
      const by = values[j];
      const cx = (avgRangeStart + avgRangeEnd) / 2;
      const cy = avgY;
      const area = Math.abs((ax - cx) * (by - ay) - (ax - bx) * (cy - ay));
      if (area > maxArea) {
        maxArea = area;
        nextA = j;
      }
    }
    sampled.push(values[nextA]);
    a = nextA;
  }
  sampled.push(values[dataLength - 1]);
  return sampled;
}

export function lttbScatter(points: { x: number; y: number }[], threshold = 150) {
  const n = points.length;
  if (threshold >= n || threshold < 3) return points.slice();
  const sampled: { x: number; y: number }[] = [];
  const bucketSize = (n - 2) / (threshold - 2);
  let a = 0;
  sampled.push(points[a]);
  for (let i = 0; i < threshold - 2; i++) {
    const rangeStart = Math.floor((i + 1) * bucketSize) + 1;
    const rangeEnd = Math.floor((i + 2) * bucketSize) + 1;
    const rangeEndClamped = Math.min(rangeEnd, n);
    // Average for next bucket
    let avgX = 0, avgY = 0;
    const avgRangeStart = rangeStart;
    const avgRangeEnd = rangeEndClamped;
    const avgRangeLen = avgRangeEnd - avgRangeStart;
    for (let j = avgRangeStart; j < avgRangeEnd; j++) { avgX += points[j].x; avgY += points[j].y; }
    avgX /= Math.max(1, avgRangeLen);
    avgY /= Math.max(1, avgRangeLen);
    // Pick point maximizing triangle area
    const rangeOffStart = Math.floor(i * bucketSize) + 1;
    const rangeOffEnd = rangeStart;
    let maxArea = -1;
    let nextA = rangeOffStart;
    for (let j = rangeOffStart; j < rangeOffEnd; j++) {
      const ax = a; // use index as x proxy for ordering
      const ay = points[a].y;
      const bx = j;
      const by = points[j].y;
      const cx = (avgRangeStart + avgRangeEnd) / 2;
      const cy = avgY;
      const area = Math.abs((ax - cx) * (by - ay) - (ax - bx) * (cy - ay));
      if (area > maxArea) { maxArea = area; nextA = j; }
    }
    sampled.push(points[nextA]);
    a = nextA;
  }
  sampled.push(points[n - 1]);
  return sampled;
}
