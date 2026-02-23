import Cookies from 'js-cookie';

/**
 * Stocke le Scent ID de l'utilisateur dans un cookie pendant 30 jours
 * Cela permet de retrouver le profil olfactif même sans compte utilisateur
 */
export const storeScentId = (scentId: string): void => {
  Cookies.set('scent-id', scentId, {
    expires: 30, // 30 jours
    secure: true,
    sameSite: 'strict'
  });
};

/**
 * Récupère le Scent ID stocké dans le cookie
 */
export const getStoredScentId = (): string | undefined => {
  return Cookies.get('scent-id');
};

/**
 * Supprime le Scent ID du cookie
 */
export const removeScentId = (): void => {
  Cookies.remove('scent-id');
};

/**
 * Vérifie si l'utilisateur a consenti aux cookies analytiques
 */
export const hasAnalyticsConsent = (): boolean => {
  return Cookies.get('analytics-consent') === 'true';
};

/**
 * Vérifie si l'utilisateur a consenti aux cookies marketing
 */
export const hasMarketingConsent = (): boolean => {
  return Cookies.get('marketing-consent') === 'true';
};

/**
 * Vérifie si l'utilisateur a donné son consentement général
 */
export const hasCookieConsent = (): boolean => {
  const consent = Cookies.get('cookie-consent');
  return consent === 'accepted' || consent === 'customized';
};