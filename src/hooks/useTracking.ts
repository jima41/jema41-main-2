import { useEffect } from 'react';
import { hasAnalyticsConsent, hasMarketingConsent } from '@/lib/cookies';

/**
 * Hook pour charger les scripts de tracking de manière conditionnelle
 * basé sur le consentement de l'utilisateur
 */
export const useTracking = () => {
  useEffect(() => {
    const loadGoogleAnalytics = () => {
      // Vérifier si GA n'est pas déjà chargé
      if (window.gtag) return;

      // Charger Google Analytics
      const script1 = document.createElement('script');
      script1.async = true;
      script1.src = 'https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID';
      document.head.appendChild(script1);

      const script2 = document.createElement('script');
      script2.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'GA_MEASUREMENT_ID', {
          'anonymize_ip': true,
          'allow_google_signals': false,
          'allow_ad_features': false
        });
      `;
      document.head.appendChild(script2);

      console.log('📊 Google Analytics chargé');
    };

    const loadFacebookPixel = () => {
      // Vérifier si FB Pixel n'est pas déjà chargé
      if (window.fbq) return;

      // Charger Facebook Pixel
      const script = document.createElement('script');
      script.innerHTML = `
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', 'YOUR_PIXEL_ID');
        fbq('track', 'PageView');
      `;
      document.head.appendChild(script);

      console.log('📱 Facebook Pixel chargé');
    };

    // Charger les scripts selon le consentement
    if (hasAnalyticsConsent()) {
      loadGoogleAnalytics();
    }

    if (hasMarketingConsent()) {
      loadFacebookPixel();
    }

  }, []);
};

// Déclarations TypeScript pour les scripts externes
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    fbq: (...args: any[]) => void;
  }
}