import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { Button } from '@/components/ui/button';
import { X, Settings } from 'lucide-react';

const CookieBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà donné son consentement
    const consent = Cookies.get('cookie-consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    Cookies.set('cookie-consent', 'accepted', { expires: 365 });
    Cookies.set('analytics-consent', 'true', { expires: 365 });
    Cookies.set('marketing-consent', 'true', { expires: 365 });
    setIsVisible(false);
    // Ici on pourrait déclencher le chargement des scripts de tracking
    loadTrackingScripts();
  };

  const handleCustomize = () => {
    setShowCustomize(!showCustomize);
  };

  const handleSavePreferences = (analytics: boolean, marketing: boolean) => {
    Cookies.set('cookie-consent', 'customized', { expires: 365 });
    Cookies.set('analytics-consent', analytics ? 'true' : 'false', { expires: 365 });
    Cookies.set('marketing-consent', marketing ? 'true' : 'false', { expires: 365 });
    setIsVisible(false);

    if (analytics || marketing) {
      loadTrackingScripts();
    }
  };

  const handleDecline = () => {
    Cookies.set('cookie-consent', 'declined', { expires: 365 });
    Cookies.set('analytics-consent', 'false', { expires: 365 });
    Cookies.set('marketing-consent', 'false', { expires: 365 });
    setIsVisible(false);
  };

  const loadTrackingScripts = () => {
    // Charger Google Analytics ou autres scripts de tracking ici
    console.log('📊 Chargement des scripts de tracking...');
    // Exemple pour Google Analytics :
    // if (typeof gtag !== 'undefined') {
    //   gtag('consent', 'update', {
    //     analytics_storage: 'granted',
    //     ad_storage: 'granted'
    //   });
    // }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <div className="max-w-4xl mx-auto bg-[#F9F8F6] border border-[#D4AF37]/30 rounded-lg shadow-lg">
        <div className="p-6">
          {!showCustomize ? (
            <>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-montserrat font-semibold text-gray-900 mb-2">
                    🍪 Cookies & Vie Privée
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed font-montserrat">
                    Nous utilisons des cookies pour améliorer votre expérience sur Rayha Store,
                    analyser le trafic et personnaliser le contenu. Votre Scent ID est également
                    stocké pour vous permettre de retrouver vos préférences olfactives.
                  </p>
                </div>
                <button
                  onClick={() => setIsVisible(false)}
                  className="ml-4 p-1 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Fermer"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleAccept}
                  className="bg-[#D4AF37] hover:bg-[#B8941F] text-white font-montserrat font-medium px-6 py-2"
                >
                  Accepter tout
                </Button>
                <Button
                  onClick={handleCustomize}
                  variant="outline"
                  className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-white font-montserrat px-6 py-2"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Personnaliser
                </Button>
                <Button
                  onClick={handleDecline}
                  variant="ghost"
                  className="text-gray-500 hover:text-gray-700 font-montserrat px-6 py-2"
                >
                  Refuser
                </Button>
              </div>
            </>
          ) : (
            <CookieCustomization onSave={handleSavePreferences} onBack={() => setShowCustomize(false)} />
          )}
        </div>
      </div>
    </div>
  );
};

// Composant pour la personnalisation des cookies
const CookieCustomization: React.FC<{
  onSave: (analytics: boolean, marketing: boolean) => void;
  onBack: () => void;
}> = ({ onSave, onBack }) => {
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-montserrat font-semibold text-gray-900">
          Personnaliser vos préférences
        </h3>
        <button
          onClick={onBack}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Retour"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <div className="space-y-4 mb-6">
        <div className="flex items-start space-x-3">
          <input
            type="checkbox"
            id="analytics"
            checked={analytics}
            onChange={(e) => setAnalytics(e.target.checked)}
            className="mt-1 w-4 h-4 text-[#D4AF37] border-gray-300 rounded focus:ring-[#D4AF37]"
          />
          <div>
            <label htmlFor="analytics" className="text-sm font-montserrat font-medium text-gray-900">
              Cookies analytiques
            </label>
            <p className="text-xs text-gray-600 font-montserrat">
              Nous permettent d'analyser l'utilisation du site pour l'améliorer.
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <input
            type="checkbox"
            id="marketing"
            checked={marketing}
            onChange={(e) => setMarketing(e.target.checked)}
            className="mt-1 w-4 h-4 text-[#D4AF37] border-gray-300 rounded focus:ring-[#D4AF37]"
          />
          <div>
            <label htmlFor="marketing" className="text-sm font-montserrat font-medium text-gray-900">
              Cookies marketing
            </label>
            <p className="text-xs text-gray-600 font-montserrat">
              Utilisés pour la publicité personnalisée et le suivi des conversions.
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <input
            type="checkbox"
            checked={true}
            disabled
            className="mt-1 w-4 h-4 text-[#D4AF37] border-gray-300 rounded opacity-50 cursor-not-allowed"
          />
          <div>
            <label className="text-sm font-montserrat font-medium text-gray-900">
              Cookies fonctionnels (obligatoires)
            </label>
            <p className="text-xs text-gray-600 font-montserrat">
              Essentiels pour le fonctionnement du site, y compris votre Scent ID.
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          onClick={() => onSave(analytics, marketing)}
          className="bg-[#D4AF37] hover:bg-[#B8941F] text-white font-montserrat font-medium px-6 py-2"
        >
          Sauvegarder mes choix
        </Button>
        <Button
          onClick={onBack}
          variant="outline"
          className="border-gray-300 text-gray-700 hover:bg-gray-50 font-montserrat px-6 py-2"
        >
          Annuler
        </Button>
      </div>
    </>
  );
};

export default CookieBanner;