// src/hooks/useIsPlayerNear.js
import { useSettings } from "../../ui-overlay/SettingsContext";
import { useMemo, useRef, useCallback, useState, useEffect } from 'react';

function euclideanDistance(a, b) {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  const dz = a[2] - b[2];
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

export function useIsPlayerNear(targetPosition, maxDistance = 3, throttleMs = 100) {
  const { settings } = useSettings();
  const playerPos = settings.playerPosition;
  
  const [throttledResult, setThrottledResult] = useState(false);
  const timeoutRef = useRef(null);
  const lastUpdateRef = useRef(0);

  const calculateDistance = useCallback(() => {
    if (!playerPos || !targetPosition) return false;
    return euclideanDistance(playerPos, targetPosition) <= maxDistance;
  }, [playerPos, targetPosition, maxDistance]);

  useEffect(() => {
    const now = Date.now();
    
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // If enough time has passed, update immediately
    if (now - lastUpdateRef.current >= throttleMs) {
      const newResult = calculateDistance();
      setThrottledResult(newResult);
      lastUpdateRef.current = now;
    } else {
      // Otherwise, schedule an update
      const remainingTime = throttleMs - (now - lastUpdateRef.current);
      timeoutRef.current = setTimeout(() => {
        const newResult = calculateDistance();
        setThrottledResult(newResult);
        lastUpdateRef.current = Date.now();
      }, remainingTime);
    }

    // Cleanup timeout on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [calculateDistance, throttleMs]);

  return throttledResult;
}