import { useEffect } from 'react';
import { useAnalytics } from '@/context/AnalyticsContext';
import { useLocation } from 'react-router-dom';

export const usePageTracking = (pageTitle: string) => {
  const { trackPageView, trackPageExit } = useAnalytics();
  const location = useLocation();

  useEffect(() => {
    // Start tracking on page entry
    trackPageView(location.pathname, pageTitle);

    // Track page exit when component unmounts or path changes
    return () => {
      trackPageExit(location.pathname);
    };
  }, [location.pathname, pageTitle, trackPageView, trackPageExit]);
};

export const useProductTracking = (productId: string, productName: string) => {
  const { trackProductView, trackProductExit, trackClick } = useAnalytics();

  useEffect(() => {
    // Track product page entry
    trackProductView(productId, productName);

    // Track product page exit
    return () => {
      trackProductExit(productId);
    };
  }, [productId, productName, trackProductView, trackProductExit]);

  const registerClick = () => {
    trackClick(window.location.pathname, productId);
  };

  return { registerClick };
};
