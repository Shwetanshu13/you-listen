export const getFromCache = (key: string) => {
  if (typeof window === "undefined") return null;
  try {
    const itemStr = sessionStorage.getItem(key);
    if (!itemStr) return null;
    const item = JSON.parse(itemStr);
    const now = new Date();
    if (now.getTime() > item.expiry) {
      sessionStorage.removeItem(key);
      return null;
    }
    return item.value;
  } catch (error) {
    console.error("Error reading from cache", error);
    return null;
  }
};

export const setInCache = (key: string, value: any, ttlInSeconds = 300) => {
  if (typeof window === "undefined") return;
  try {
    const now = new Date();
    const item = {
      value: value,
      expiry: now.getTime() + ttlInSeconds * 1000,
    };
    sessionStorage.setItem(key, JSON.stringify(item));
  } catch (error) {
    console.error("Error writing to cache", error);
  }
};

export const removeFromCache = (key: string) => {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(key);
};
