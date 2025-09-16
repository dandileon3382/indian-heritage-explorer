// src/utils/ar-checker.js

export async function checkARSupport() {
  if (navigator.xr) {
    try {
      // Check if 'immersive-ar' session is supported
      const isSupported = await navigator.xr.isSessionSupported('immersive-ar');
      return isSupported;
    } catch (e) {
      console.error("Error checking AR support:", e);
      return false;
    }
  }
  return false;
}