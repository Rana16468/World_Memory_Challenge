// hooks/useDeviceFingerprint.js
import { useState, useEffect } from 'react';

export const useDeviceFingerprint = () => {
  const [deviceId, setDeviceId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const generateFingerprint = async () => {
      try {
        setLoading(true);
        
        // Import FingerprintJS dynamically
        const FingerprintJS = await import('@fingerprintjs/fingerprintjs');
        
        // Initialize the agent
        const fp = await FingerprintJS.load();
        
        // Get the visitor identifier
        const result = await fp.get();
        console.log(result);
        
        setDeviceId(result.visitorId);
        setError(null);
      } catch (err) {
        setError(err.message);
        setDeviceId(null);
      } finally {
        setLoading(false);
      }
    };

    generateFingerprint();
  }, []);

  return { deviceId, loading, error };
};

// Example usage in a component:
/*
import { useDeviceFingerprint } from './hooks/useDeviceFingerprint';

function MyComponent() {
  const { deviceId, loading, error } = useDeviceFingerprint();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <p>Device ID: {deviceId}</p>
    </div>
  );
}
*/

// Advanced hook with caching and persistence
export const useDeviceFingerprintWithCache = (cacheKey = 'device_fingerprint') => {
  const [deviceId, setDeviceId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const generateOrRetrieveFingerprint = async () => {
      try {
        setLoading(true);
        
        // Check if we have a cached fingerprint (in memory for this session)
        const sessionCache = window.sessionCache || {};
        if (sessionCache[cacheKey]) {
          setDeviceId(sessionCache[cacheKey]);
          setLoading(false);
          return;
        }

        // Generate new fingerprint
        const FingerprintJS = await import('@fingerprintjs/fingerprintjs');
        const fp = await FingerprintJS.load();
        const result = await fp.get();
        
        // Cache the result in session memory
        if (!window.sessionCache) window.sessionCache = {};
        window.sessionCache[cacheKey] = result.visitorId;
        
        setDeviceId(result.visitorId);
        setError(null);
      } catch (err) {
        setError(err.message);
        setDeviceId(null);
      } finally {
        setLoading(false);
      }
    };

    generateOrRetrieveFingerprint();
  }, [cacheKey]);

  const regenerateFingerprint = async () => {
    // Clear cache and regenerate
    if (window.sessionCache) {
      delete window.sessionCache[cacheKey];
    }
    
    try {
      setLoading(true);
      const FingerprintJS = await import('@fingerprintjs/fingerprintjs');
      const fp = await FingerprintJS.load();
      const result = await fp.get();
      
      if (!window.sessionCache) window.sessionCache = {};
      window.sessionCache[cacheKey] = result.visitorId;
      
      setDeviceId(result.visitorId);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { 
    deviceId, 
    loading, 
    error, 
    regenerateFingerprint 
  };
};