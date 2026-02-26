import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Sparkles, Box, Wind, FileDown, Package } from 'lucide-react';
import Footer from '@/components/Footer';
import type { CartItem } from '@/store/useCartStore';

const silkyEase = [0.25, 0.1, 0.25, 1];

interface SuccessState {
  orderRef: string;
  total: number;
  subtotal: number;
  shippingCost: number;
  items: CartItem[];
  shippingInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  promoCode: string | null;
  promoDiscount: number;
}

const Success = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state    = location.state as SuccessState | null;

  // Accès direct sans state → retour accueil
  useEffect(() => {
    window.scrollTo(0, 0);
    if (!state) navigate('/', { replace: true });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!state) return null;

  const { orderRef, total, subtotal, shippingCost, items, shippingInfo, promoCode, promoDiscount } = state;
  const orderDate  = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
  const totalItems = items.reduce((s, i) => s + i.quantity, 0);

  // ── Facture PDF dans une fenêtre dédiée ──
  const handleDownloadPDF = () => {
    const rows = items.map(item => `
      <tr>
        <td style="padding:12px 8px;border-bottom:1px solid #eee;">
          <div style="display:flex;align-items:center;gap:12px;">
            ${item.image
              ? `<img src="${item.image}" alt="" style="width:48px;height:48px;object-fit:cover;border-radius:6px;flex-shrink:0;"/>`
              : `<div style="width:48px;height:48px;background:#f5f5f5;border-radius:6px;flex-shrink:0;"></div>`}
            <div>
              <div style="font-size:10px;color:#999;text-transform:uppercase;letter-spacing:.08em;margin-bottom:2px;">${item.brand}</div>
              <div style="font-size:13px;font-weight:500;color:#111;">${item.name}</div>
            </div>
          </div>
        </td>
        <td style="padding:12px 8px;border-bottom:1px solid #eee;text-align:center;font-size:13px;color:#555;">${item.quantity}</td>
        <td style="padding:12px 8px;border-bottom:1px solid #eee;text-align:right;font-size:13px;color:#555;">${item.price.toFixed(2)} €</td>
        <td style="padding:12px 8px;border-bottom:1px solid #eee;text-align:right;font-size:13px;font-weight:600;color:#111;">${(item.price * item.quantity).toFixed(2)} €</td>
      </tr>
    `).join('');

    const discountRow = promoDiscount > 0 ? `
      <tr><td>Remise (${promoCode})</td><td style="color:#16a34a;">-${((subtotal * promoDiscount) / 100).toFixed(2)} €</td></tr>
    ` : '';

    const html = `<!DOCTYPE html>
<html lang="fr"><head><meta charset="UTF-8"/>
<title>Facture ${orderRef} — Rayha Store</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box;}
  body{font-family:Georgia,serif;color:#111;background:#fff;padding:48px;}
  .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:40px;padding-bottom:24px;border-bottom:2px solid #D4AF37;}
  .brand{font-size:26px;letter-spacing:.15em;text-transform:uppercase;}
  .brand small{display:block;font-size:10px;color:#A68A56;letter-spacing:.3em;font-family:Arial,sans-serif;margin-top:4px;}
  .meta{text-align:right;font-family:Arial,sans-serif;font-size:12px;color:#666;line-height:1.8;}
  .meta .ref{font-size:20px;color:#D4AF37;letter-spacing:.12em;font-family:Georgia,serif;}
  .section-label{font-family:Arial,sans-serif;font-size:9px;text-transform:uppercase;letter-spacing:.25em;color:#A68A56;margin-bottom:12px;}
  table{width:100%;border-collapse:collapse;margin-bottom:32px;}
  thead th{font-family:Arial,sans-serif;font-size:9px;text-transform:uppercase;letter-spacing:.15em;color:#999;padding:8px;border-bottom:2px solid #eee;text-align:left;}
  thead th:nth-child(2){text-align:center;}thead th:nth-child(3),thead th:nth-child(4){text-align:right;}
  .totals{margin-left:auto;width:260px;}
  .totals td{font-family:Arial,sans-serif;font-size:13px;padding:5px 0;}
  .totals td:last-child{text-align:right;}
  .totals .grand td{font-size:16px;font-weight:700;color:#D4AF37;border-top:1px solid #eee;padding-top:10px;font-family:Georgia,serif;}
  .addr{font-family:Arial,sans-serif;font-size:11px;color:#666;line-height:1.7;margin-bottom:32px;}
  .footer{margin-top:48px;padding-top:16px;border-top:1px solid #eee;font-family:Arial,sans-serif;font-size:10px;color:#bbb;text-align:center;line-height:1.8;}
</style></head><body>
  <div class="header">
    <div class="brand">Rayha Store<small>La Maison du Parfum</small></div>
    <div class="meta">
      <div class="ref">${orderRef}</div>
      Facture — ${orderDate}<br/>${shippingInfo.email}
    </div>
  </div>
  <div class="addr">
    <strong>${shippingInfo.firstName} ${shippingInfo.lastName}</strong><br/>
    ${shippingInfo.address}<br/>
    ${shippingInfo.postalCode} ${shippingInfo.city}, ${shippingInfo.country}<br/>
    ${shippingInfo.phone}
  </div>
  <p class="section-label">Détail de la commande</p>
  <table>
    <thead><tr><th>Produit</th><th>Qté</th><th>Prix unitaire</th><th>Total</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <table class="totals"><tbody>
    <tr><td>Sous-total</td><td>${subtotal.toFixed(2)} €</td></tr>
    ${discountRow}
    <tr><td>Livraison</td><td>${shippingCost === 0 ? 'Offerte' : shippingCost.toFixed(2) + ' €'}</td></tr>
    <tr class="grand"><td>Total TTC</td><td>${total.toFixed(2)} €</td></tr>
  </tbody></table>
  <div class="footer">Rayha Store — conciergerie@rayhastore.com<br/>Ce document tient lieu de facture. Merci pour votre confiance.</div>
  <script>window.onload=()=>{window.print();window.onafterprint=()=>window.close();};<\/script>
</body></html>`;

    const win = window.open('', '_blank');
    if (!win) { alert('Autorisez les pop-ups pour télécharger la facture.'); return; }
    win.document.write(html);
    win.document.close();
  };

  return (
    <div className="min-h-screen bg-[#FCFBF9] flex flex-col">
      <main className="flex-1 py-12 md:py-24 flex items-center justify-center px-5 sm:px-6">
        <div className="w-full max-w-3xl">

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: silkyEase }}
            className="bg-[#0E0E0E] rounded-2xl md:rounded-[2rem] shadow-2xl overflow-hidden border border-[#D4AF37]/20 p-5 sm:p-8 md:p-12 relative"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-[#D4AF37]/10 blur-[100px] rounded-full pointer-events-none" />

            <div className="relative z-10 text-center">

              {/* Icône succès */}
              <motion.div
                className="mb-6 mx-auto flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/5 text-[#D4AF37]"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2, type: 'spring' }}
              >
                <Check className="w-8 h-8" strokeWidth={1.5} />
              </motion.div>

              <span className="text-[10px] text-[#A68A56] uppercase tracking-[0.3em] mb-4 block font-medium">
                Privilège Accordé
              </span>
              <h1 className="font-serif text-3xl md:text-5xl text-white mb-6 leading-tight">
                Votre sillage est réservé
              </h1>
              <p className="text-sm md:text-base text-white/60 mb-12 font-light max-w-lg mx-auto">
                La Maison Rayha vous remercie pour votre confiance. Nos artisans préparent actuellement votre création avec le plus grand soin.
              </p>

              {/* Récapitulatif */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-0 p-5 sm:p-8 rounded-xl bg-white/5 border border-white/10 mb-8 md:mb-10">
                <div className="md:border-r md:border-white/10 flex flex-col items-center justify-center">
                  <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] mb-2">Référence privée</p>
                  <p className="font-serif text-xl text-[#D4AF37] tracking-wider">{orderRef}</p>
                </div>
                <div className="md:border-r md:border-white/10 flex flex-col items-center justify-center">
                  <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] mb-2">Créations</p>
                  <p className="font-serif text-xl text-white">{totalItems}</p>
                </div>
                <div className="flex flex-col items-center justify-center">
                  <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] mb-2">Valeur totale</p>
                  <p className="font-serif text-xl text-white">{total.toFixed(2)} €</p>
                </div>
              </div>

              {/* Liste des produits */}
              <div className="mb-10 text-left">
                <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] mb-4 text-center">Vos créations</p>
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/10">
                      {item.image
                        ? <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-lg flex-shrink-0" />
                        : <div className="w-12 h-12 rounded-lg bg-white/10 flex-shrink-0" />
                      }
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-white/40 uppercase tracking-[0.1em]">{item.brand}</p>
                        <p className="text-sm text-white font-serif truncate">{item.name}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-[10px] text-white/40">×{item.quantity}</p>
                        <p className="text-sm text-[#D4AF37] font-serif">{(item.price * item.quantity).toFixed(2)} €</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 space-y-1 text-right text-xs text-white/50">
                  {promoDiscount > 0 && (
                    <p>Remise ({promoCode}) : <span className="text-emerald-400">-{((subtotal * promoDiscount) / 100).toFixed(2)} €</span></p>
                  )}
                  <p>Livraison : {shippingCost === 0
                    ? <span className="text-emerald-400">Offerte</span>
                    : <span className="text-white/70">{shippingCost.toFixed(2)} €</span>}
                  </p>
                  <p className="text-sm text-white/80">Total : <span className="text-[#D4AF37] font-serif text-base">{total.toFixed(2)} €</span></p>
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
                <motion.button
                  onClick={() => navigate('/mes-commandes')}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg border border-white/20 text-white/70 text-xs uppercase tracking-widest hover:bg-white/5 hover:text-white transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Package className="w-4 h-4" />
                  Suivre ma commande
                </motion.button>

                <motion.button
                  onClick={handleDownloadPDF}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg border border-[#D4AF37]/40 text-[#D4AF37] text-xs uppercase tracking-widest hover:bg-[#D4AF37]/10 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <FileDown className="w-4 h-4" />
                  Télécharger la facture PDF
                </motion.button>
              </div>

              {/* Étapes du rituel */}
              <div className="text-left max-w-md mx-auto mb-16">
                <h3 className="text-[10px] text-white/40 uppercase tracking-[0.2em] mb-8 text-center border-b border-white/10 pb-4">Le Rituel d'Expédition</h3>
                <div className="space-y-8">
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4, duration: 0.6 }} className="flex gap-5">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/5 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-serif text-white text-lg mb-1">Vérification de votre commande</h4>
                      <p className="text-xs text-white/50 font-light leading-relaxed">Chaque flacon est soumis à un dernier contrôle rigoureux pour garantir les standards de la Maison.</p>
                    </div>
                  </motion.div>
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6, duration: 0.6 }} className="flex gap-5">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40">
                      <Box className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-serif text-white text-lg mb-1">Conditionnement de votre commande</h4>
                      <p className="text-xs text-white/50 font-light leading-relaxed">Mise en boîte sécurisée pour le transport. Nous veillons à la protection de votre produit.</p>
                    </div>
                  </motion.div>
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8, duration: 0.6 }} className="flex gap-5">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40">
                      <Wind className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-serif text-white text-lg mb-1">Expédition de votre commande</h4>
                      <p className="text-xs text-white/50 font-light leading-relaxed">Votre commande quitte nos ateliers sous 24h. Le lien de suivi vous sera communiqué par email.</p>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Bouton retour accueil */}
              <motion.button
                onClick={() => navigate('/')}
                className="group relative overflow-hidden rounded-lg flex items-center justify-center w-full sm:w-auto mx-auto min-w-[280px]"
                style={{ backgroundColor: '#FCFBF9', border: '1px solid #FCFBF9', boxShadow: '0 4px 15px -5px rgba(255,255,255,0.1)' }}
                whileHover={{ backgroundColor: '#D4AF37', borderColor: '#D4AF37' }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.5, ease: silkyEase }}
              >
                <div className="relative z-10 flex items-center justify-center gap-3 px-6 py-4 w-full">
                  <span className="font-montserrat text-[11px] font-bold tracking-[0.2em] uppercase text-[#0E0E0E]">
                    Retourner à la Maison
                  </span>
                </div>
              </motion.button>

              <p className="mt-12 text-[10px] text-white/30 uppercase tracking-widest">
                La Conciergerie :{' '}
                <a href="mailto:conciergerie@rayhastore.com" className="text-white/60 hover:text-[#D4AF37] transition-colors">
                  conciergerie@rayhastore.com
                </a>
              </p>

            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Success;
