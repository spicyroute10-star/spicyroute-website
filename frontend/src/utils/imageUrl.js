/**
 * Formats image URLs so that Google Drive, Dropbox, and other cloud storage
 * share links are automatically transformed into direct-embed image streams
 * that render cleanly inside HTML <img> tags.
 */
export function formatDirectImageUrl(url) {
  if (!url || typeof url !== 'string') return url;
  const trimmed = url.trim();

  // 1. Google Drive Share Links
  // Matches /file/d/ID/view, /open?id=ID, /uc?id=ID, etc.
  const driveRegex = /(?:drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:export=[^&]+&)?id=)|docs\.google\.com\/file\/d\/)([a-zA-Z0-9_-]{25,})/;
  const driveMatch = trimmed.match(driveRegex);
  if (driveMatch && driveMatch[1]) {
    const fileId = driveMatch[1];
    // lh3.googleusercontent.com/d/FILE_ID is Google's high-speed direct CDN stream
    return `https://lh3.googleusercontent.com/d/${fileId}`;
  }

  // 2. Dropbox Share Links (convert dl=0 to raw=1 for direct binary stream)
  if (trimmed.includes('dropbox.com')) {
    if (trimmed.includes('dl=0')) {
      return trimmed.replace('dl=0', 'raw=1');
    }
    if (!trimmed.includes('raw=1')) {
      return trimmed.includes('?') ? `${trimmed}&raw=1` : `${trimmed}?raw=1`;
    }
  }

  return trimmed;
}
