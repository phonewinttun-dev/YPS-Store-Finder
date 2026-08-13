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
    setLocationState((prev) => ({
      ...prev,
      isTracking: false,
      latitude: null,
      longitude: null,
      accuracy: null,
    }));
  }, []);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationState((prev) => ({
        ...prev,
        permissionState: 'unsupported',
        error: 'locationUnsupported',
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
      let errorMsg = 'locationDenied';
      let permState: UserLocationState['permissionState'] = 'denied';

      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMsg = 'locationDenied';
          permState = 'denied';
          break;
        case error.POSITION_UNAVAILABLE:
          errorMsg = 'locationUnavailable';
          break;
        case error.TIMEOUT:
          errorMsg = 'locationTimeout';
          break;
      }

      setLocationState((prev) => ({
        ...prev,
        isTracking: false,
        permissionState: permState,
        error: errorMsg,
      }));
    };

    // Attempt position retrieval with high accuracy first, falling back to low accuracy
    navigator.geolocation.getCurrentPosition(handleSuccess, (err) => {
      if (err.code === err.TIMEOUT || err.code === err.POSITION_UNAVAILABLE) {
        navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 5000,
        });
      } else {
        handleError(err);
      }
    }, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    });

    // Start watch for movement updates
    watchIdRef.current = navigator.geolocation.watchPosition(handleSuccess, () => {}, {
      enableHighAccuracy: false,
      timeout: 15000,
      maximumAge: 5000,
    });
  }, []);

  // Sync initial permission state if Permissions API is available
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        setLocationState((prev) => ({
          ...prev,
          permissionState: result.state as UserLocationState['permissionState'],
        }));
        result.onchange = () => {
          setLocationState((prev) => ({
            ...prev,
            permissionState: result.state as UserLocationState['permissionState'],
          }));
        };
      }).catch(() => {});
    }
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
