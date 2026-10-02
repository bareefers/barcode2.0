/**
 * Origin of the legacy Barcode Nuxt app (served under `/bc/`).
 * Next 2.0 (e.g. barcode2-0) does not implement those routes; use this for deep links.
 */
export function legacyBarcodeOrigin(): string {
  const fromEnv = process.env.NEXT_PUBLIC_LEGACY_BARCODE_ORIGIN?.replace(/\/$/, '');
  if (fromEnv) return fromEnv;
  if (process.env.NODE_ENV === 'development') return 'http://localhost:8080';
  return 'https://barcode.bareefers.org';
}

/** Absolute URL on the legacy Barcode site (path should include `/bc/...` when needed). */
export function legacyBarcodeUrl(path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${legacyBarcodeOrigin()}${p}`;
}

/** Equipment `picture` field is stored like `uploads/...` or `picture-placeholder.png`. */
export function equipmentPictureUrl(picture: string | null | undefined): string {
  if (!picture) return legacyBarcodeUrl('/bc/picture-placeholder.png');
  const rel = picture.startsWith('/') ? picture.slice(1) : picture;
  return legacyBarcodeUrl(`/bc/${rel}`);
}
