const CLOUDINARY_HOST = "res.cloudinary.com";
const LISTING_TRANSFORM = "c_limit,w_480,q_auto:eco/f_auto";

/** Return a small CDN-generated variant for product cards. */
export function getListingImageUrl(source: string): string {
  try {
    const url = new URL(source);
    if (url.hostname !== CLOUDINARY_HOST) return source;

    const uploadMarker = "/image/upload/";
    const markerIndex = url.pathname.indexOf(uploadMarker);
    if (markerIndex < 0) return source;

    const afterUpload = url.pathname.slice(markerIndex + uploadMarker.length);
    url.pathname = `${url.pathname.slice(0, markerIndex + uploadMarker.length)}${LISTING_TRANSFORM}/${afterUpload}`;
    return url.toString();
  } catch {
    return source;
  }
}
