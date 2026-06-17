import { useEffect, useState } from "react";

/**
 * Hook to detect when the component has hydrated on the client
 * Prevents hydration mismatches when using localStorage
 */
export function useHydration() {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return isHydrated;
}
