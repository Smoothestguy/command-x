import { useState, useEffect } from "react";

// Standardized breakpoints for Command-X
const BREAKPOINTS = {
  mobile: 480,
  mobileLarge: 767,
  tablet: 1023,
  desktop: 1024,
} as const;

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    // Safe check for window object (SSR compatibility)
    if (typeof window === "undefined") return false;
    return window.innerWidth <= BREAKPOINTS.mobileLarge;
  });

  useEffect(() => {
    // Additional safety check
    if (typeof window === "undefined") return;

    const mql = window.matchMedia(`(max-width: ${BREAKPOINTS.mobileLarge}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth <= BREAKPOINTS.mobileLarge);
    };

    // Set initial value
    setIsMobile(window.innerWidth <= BREAKPOINTS.mobileLarge);

    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return isMobile;
}

export function useIsSmallMobile() {
  const [isSmallMobile, setIsSmallMobile] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth <= BREAKPOINTS.mobile;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mql = window.matchMedia(`(max-width: ${BREAKPOINTS.mobile}px)`);
    const onChange = () => {
      setIsSmallMobile(window.innerWidth <= BREAKPOINTS.mobile);
    };

    setIsSmallMobile(window.innerWidth <= BREAKPOINTS.mobile);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return isSmallMobile;
}

export function useIsTablet() {
  const [isTablet, setIsTablet] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const width = window.innerWidth;
    return width > BREAKPOINTS.mobileLarge && width <= BREAKPOINTS.tablet;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mql = window.matchMedia(
      `(min-width: ${BREAKPOINTS.mobileLarge + 1}px) and (max-width: ${
        BREAKPOINTS.tablet
      }px)`
    );
    const onChange = () => {
      const width = window.innerWidth;
      setIsTablet(
        width > BREAKPOINTS.mobileLarge && width <= BREAKPOINTS.tablet
      );
    };

    const width = window.innerWidth;
    setIsTablet(width > BREAKPOINTS.mobileLarge && width <= BREAKPOINTS.tablet);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return isTablet;
}

export function useScreenSize() {
  const [screenSize, setScreenSize] = useState<"mobile" | "tablet" | "desktop">(
    () => {
      if (typeof window === "undefined") return "desktop";
      const width = window.innerWidth;
      if (width <= BREAKPOINTS.mobileLarge) return "mobile";
      if (width <= BREAKPOINTS.tablet) return "tablet";
      return "desktop";
    }
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const updateScreenSize = () => {
      const width = window.innerWidth;
      if (width <= BREAKPOINTS.mobileLarge) {
        setScreenSize("mobile");
      } else if (width <= BREAKPOINTS.tablet) {
        setScreenSize("tablet");
      } else {
        setScreenSize("desktop");
      }
    };

    updateScreenSize();
    window.addEventListener("resize", updateScreenSize);
    return () => window.removeEventListener("resize", updateScreenSize);
  }, []);

  return screenSize;
}

// Device detection utilities
export function useDeviceInfo() {
  const [deviceInfo, setDeviceInfo] = useState(() => {
    if (typeof window === "undefined" || typeof navigator === "undefined") {
      return {
        isIOS: false,
        isAndroid: false,
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        hasTouch: false,
      };
    }

    const userAgent = navigator.userAgent;
    const isIOS = /iPhone|iPad|iPod/.test(userAgent);
    const isAndroid = /Android/.test(userAgent);
    const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    const width = window.innerWidth;
    const isMobile = width <= BREAKPOINTS.mobileLarge;
    const isTablet =
      width > BREAKPOINTS.mobileLarge && width <= BREAKPOINTS.tablet;
    const isDesktop = width > BREAKPOINTS.tablet;

    return {
      isIOS,
      isAndroid,
      isMobile,
      isTablet,
      isDesktop,
      hasTouch,
    };
  });

  useEffect(() => {
    if (typeof window === "undefined" || typeof navigator === "undefined")
      return;

    const userAgent = navigator.userAgent;
    const isIOS = /iPhone|iPad|iPod/.test(userAgent);
    const isAndroid = /Android/.test(userAgent);
    const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;

    const updateDeviceInfo = () => {
      const width = window.innerWidth;
      const isMobile = width <= BREAKPOINTS.mobileLarge;
      const isTablet =
        width > BREAKPOINTS.mobileLarge && width <= BREAKPOINTS.tablet;
      const isDesktop = width > BREAKPOINTS.tablet;

      setDeviceInfo({
        isIOS,
        isAndroid,
        isMobile,
        isTablet,
        isDesktop,
        hasTouch,
      });
    };

    updateDeviceInfo();
    window.addEventListener("resize", updateDeviceInfo);
    return () => window.removeEventListener("resize", updateDeviceInfo);
  }, []);

  return deviceInfo;
}

export { BREAKPOINTS };
