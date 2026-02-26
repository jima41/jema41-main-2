import { useState, useEffect, useRef, RefObject } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Loader2, AlertCircle } from 'lucide-react';

// Constantes Supabase pour l'appel direct (fonctionne invité + connecté)
const SUPABASE_URL      = import.meta.env.VITE_SUPABASE_URL      as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

// ── Stripe singleton ────────────────────────────────────────────────────────

const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ?? ''
);
// ── Appearance API — Luxe de Nuit ──────────────────────────────────────────
// theme: 'flat' pour un contrôle maximal des bordures.
// Variables : fond #0E0E0E, texte blanc, accent doré #D4AF37.
// Bordures inputs : très fines #333, dorées au focus.
// Onglets (carte / Apple Pay / Google Pay) : style sombre assorti.

const STRIPE_APPEARANCE = {
  theme: 'flat' as const,
  variables: {
    colorPrimary:    '#D4AF37',
    colorBackground: '#0E0E0E',
    colorText:       '#ffffff',
    colorDanger:     '#f87171',
    fontFamily:      '"Georgia", "Times New Roman", serif',
    fontSizeBase:    '14px',
    borderRadius:    '2px',
    spacingUnit:     '4px',
  },
  rules: {
    /* ── Inputs ── */
    '.Input': {
      backgroundColor: 'rgba(255,255,255,0.04)',
      border:          '1px solid #333333',
      color:           '#ffffff',
      padding:         '14px 16px',
      boxShadow:       'none',
      transition:      'border-color 0.2s',
      outline:         'none',
    },
    '.Input:focus': {
      borderColor: '#D4AF37',
      boxShadow:   'none',
      outline:     'none',
    },
    '.Input--invalid': {
      borderColor: '#f87171',
      boxShadow:   'none',
    },
    '.Input::placeholder': {
      color: 'rgba(255,255,255,0.2)',
    },

    /* ── Labels ── */
    '.Label': {
      color:         '#A68A56',
      fontSize:      '9px',
      letterSpacing: '0.2em',
      textTransform: 'uppercase',
      fontWeight:    '500',
    },

    /* ── Erreurs ── */
    '.Error': {
      color:    '#f87171',
      fontSize: '11px',
    },

    /* ── Onglets Apple Pay / Google Pay / Carte ── */
    '.Tab': {
      backgroundColor: 'rgba(255,255,255,0.03)',
      border:          '1px solid #333333',
      color:           'rgba(255,255,255,0.5)',
      boxShadow:       'none',
      transition:      'all 0.2s',
    },
    '.Tab:hover': {
      backgroundColor: 'rgba(255,255,255,0.06)',
      borderColor:     '#555555',
      color:           '#ffffff',
    },
    '.Tab--selected': {
      backgroundColor: 'rgba(212,175,55,0.06)',
      borderColor:     '#D4AF37',
      color:           '#D4AF37',
      boxShadow:       'none',
    },
    '.Tab--selected:focus': {
      boxShadow: 'none',
      outline:   'none',
    },
    '.TabIcon--selected': {
      fill: '#D4AF37',
    },
    '.TabLabel--selected': {
      color: '#D4AF37',
    },

    /* ── Bloc général (wallets) ── */
    '.Block': {
      backgroundColor: 'transparent',
      border:          '1px solid #333333',
    },

    /* ── Checkbox (ex : sauvegarder la carte) ── */
    '.Checkbox': {
      border: '1px solid #444444',
    },
    '.Checkbox--checked': {
      backgroundColor: '#D4AF37',
      borderColor:     '#D4AF37',
    },
  },
};

// ── PaymentFields — interne, doit être dans <Elements> ───────────────────────

interface PaymentFieldsProps {
  clientSecret:    string;
  onSuccess:       (paymentIntentId: string) => void;
  onError:         (msg: string) => void;
  onLoadingChange: (v: boolean) => void;
  onReady:         (ready: boolean) => void;
  submitRef:       RefObject<(() => void) | null>;
}

const PaymentFields: React.FC<PaymentFieldsProps> = ({
  clientSecret,
  onSuccess,
  onError,
  onLoadingChange,
  onReady,
  submitRef,
}) => {
  const stripe   = useStripe();
  const elements = useElements();

  const submit = async () => {
    if (!stripe || !elements) return;
    onLoadingChange(true);

    // confirmPayment supporte CB, Apple Pay, Google Pay, PayPal, etc.
    // redirect: 'if_required' évite la redirection automatique pour les
    // méthodes qui n'en ont pas besoin (carte, wallets).
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // URL de secours si une redirection est requise (ex: 3DS)
        return_url: `${window.location.origin}/success`,
      },
      redirect: 'if_required',
    });

    if (error) {
      onError(error.message ?? 'Erreur de paiement.');
      onLoadingChange(false);
    } else if (paymentIntent?.status === 'succeeded') {
      // Succès → le parent déclenche finalizeOrder() puis /success
      onSuccess(paymentIntent.id);
      // loading reste true, la navigation va se déclencher dans Checkout
    } else if (paymentIntent?.status === 'requires_action') {
      // Cas rare après redirect: 'if_required' — ne devrait pas arriver
      onError('Action supplémentaire requise. Veuillez réessayer.');
      onLoadingChange(false);
    } else {
      onError('Paiement non confirmé. Veuillez réessayer.');
      onLoadingChange(false);
    }
  };

  // Expose la fonction submit au bouton parent via la ref
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { submitRef.current = submit; });

  return (
    <PaymentElement
      options={{
        // 'tabs' affiche les onglets Carte / Apple Pay / Google Pay / PayPal
        layout: {
          type:           'tabs',
          defaultCollapsed: false,
        },
        // Wallets : activer Apple Pay et Google Pay
        wallets: {
          applePay:  'auto',
          googlePay: 'auto',
        },
        // Pré-remplissage adresse de facturation désactivé (on gère l'adresse nous-mêmes)
        fields: {
          billingDetails: {
            address: 'never',
          },
        },
      }}
      onReady={() => onReady(true)}
    />
  );
};

// ── CheckoutForm — export public ─────────────────────────────────────────────

export interface CheckoutFormProps {
  /** Total en euros (ex. 129.99) — converti en centimes en interne */
  amountEuros:     number;
  orderRef:        string;
  /** Appelé après confirmPayment réussi → déclenche finalizeOrder() */
  onSuccess:       (paymentIntentId: string) => void;
  submitRef:       RefObject<(() => void) | null>;
  onLoadingChange: (loading: boolean) => void;
  onReady:         (ready: boolean) => void;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({
  amountEuros,
  orderRef,
  onSuccess,
  submitRef,
  onLoadingChange,
  onReady,
}) => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [initError,    setInitError]    = useState<string | null>(null);
  const [payError,     setPayError]     = useState<string | null>(null);
  const hasFetched = useRef(false);

  // ── Récupère le clientSecret dès l'arrivée sur l'étape de règlement ──────
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const amountCents = Math.round(amountEuros * 100);

    (async () => {
      try {
        const res = await fetch(
          `${SUPABASE_URL}/functions/v1/create-payment-intent`,
          {
            method:  'POST',
            headers: {
              'Content-Type':  'application/json',
              'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({
              amount:   amountCents,
              currency: 'eur',
              metadata: { orderRef },
            }),
          }
        );

        const data = await res.json();

        if (!res.ok) throw new Error(data?.error || `Erreur ${res.status}`);
        if (!data?.clientSecret) throw new Error('clientSecret absent de la réponse');

        setClientSecret(data.clientSecret);
        // onReady(true) sera appelé par le PaymentElement quand il sera monté
      } catch (err: unknown) {
        const msg = err instanceof Error
          ? err.message
          : 'Impossible d\'initialiser le paiement.';
        setInitError(msg);
        onReady(false);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Chargement ── */
  if (!clientSecret && !initError) {
    return (
      <div className="p-10 border border-white/10 rounded-sm bg-white/[0.02] flex items-center justify-center gap-3">
        <Loader2 className="w-5 h-5 text-[#D4AF37] animate-spin" />
        <p className="text-white/50 text-sm">Sécurisation du règlement...</p>
      </div>
    );
  }

  /* ── Erreur d'initialisation ── */
  if (initError) {
    return (
      <div className="p-6 border border-red-900/50 rounded-sm bg-red-900/10 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-red-400 text-sm font-medium">Paiement indisponible</p>
          <p className="text-red-400/70 text-xs mt-1">{initError}</p>
        </div>
      </div>
    );
  }

  /* ── Formulaire de paiement ── */
  return (
    <div className="space-y-4">
      {payError && (
        <div className="flex items-center gap-2 p-3 border border-red-900/50 bg-red-900/10 rounded-sm">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <p className="text-red-400 text-xs">{payError}</p>
        </div>
      )}

      {/*
        <Elements> fournit le contexte Stripe avec l'Appearance API.
        PaymentElement affiche automatiquement les onglets disponibles :
        Carte bancaire, Apple Pay, Google Pay, PayPal, etc.
        selon le navigateur et les méthodes activées dans le dashboard Stripe.
      */}
      <Elements
        stripe={stripePromise}
        options={{
          clientSecret: clientSecret!,
          appearance:   STRIPE_APPEARANCE,
          loader:       'auto',
        }}
      >
        <PaymentFields
          clientSecret={clientSecret!}
          onSuccess={onSuccess}
          onError={(msg) => setPayError(msg)}
          onLoadingChange={onLoadingChange}
          onReady={onReady}
          submitRef={submitRef}
        />
      </Elements>
    </div>
  );
};

export default CheckoutForm;
