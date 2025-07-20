export const normalizeUrl = (url: string): string => {
  try {
    const parsedUrl = new URL(url.startsWith("http") ? url : "https://" + url);
    return parsedUrl.hostname.replace(/^www\./, "");
  } catch (e) {
    console.error("Invalid URL:", url, e);
    return url;
  }
};
