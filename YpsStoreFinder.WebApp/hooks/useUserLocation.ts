import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { UserLocationState } from '../types/store';

// Default Fallback Coordinates (Yangon City Center / Sule Pagoda)
export const DEFAULT_YANGON_LOCATION = {
  latitude: 16.7759633,
  longitude: 96.1587317,
};

export function useUserLocation() {
  const [locationState, setLocationState] = useState<UserLocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    isTracking: false,
    permissionState: 'prompt',
    error: null,
  });

  const watchIdRef = useRef<number | null>(null);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setLocationState((prev) => ({ ...prev, isTracking: false }));
  }, []);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationState((prev) => ({
        ...prev,
        permissionState: 'unsupported',
        error: 'Geolocation is not supported by your browser.',
      }));
      return;
    }

    setLocationState((prev) => ({ ...prev, isTracking: true, error: null }));

    const handleSuccess = (position: GeolocationPosition) => {
      setLocationState({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        isTracking: true,
        permissionState: 'granted',
        error: null,
      });
    };

    const handleError = (error: GeolocationPositionError) => {
      let errorMsg = 'Failed to obtain device location.';
      let permState: UserLocationState['permissionState'] = 'denied';

      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMsg = 'Location permission was denied. Turn on device location in browser settings.';
          permState = 'denied';
          break;
        case error.POSITION_UNAVAILABLE:
          errorMsg = 'Location information is currently unavailable.';
          break;
        case error.TIMEOUT:
          errorMsg = 'The request to get device location timed out.';
          break;
      }

      setLocationState((prev) => ({
        ...prev,
        isTracking: false,
        permissionState: permState,
        error: errorMsg,
      }));
    };

    // Get immediate position first
    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    });

    // Start watch for movement updates
    watchIdRef.current = navigator.geolocation.watchPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 2000,
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  const activeLocation = useMemo(
    () => ({
      latitude: locationState.latitude ?? DEFAULT_YANGON_LOCATION.latitude,
      longitude: locationState.longitude ?? DEFAULT_YANGON_LOCATION.longitude,
      hasRealLocation: locationState.latitude !== null && locationState.longitude !== null,
    }),
    [locationState.latitude, locationState.longitude]
  );

  return {
    locationState,
    startTracking,
    stopTracking,
    activeLocation,
  };
}
