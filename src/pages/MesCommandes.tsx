import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, ChevronLeft, ChevronDown, MapPin, Tag, ShoppingBag, ArrowRight, FileDown, Check, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useOrderManagement, type Order } from '@/store/useAdminStore';
import Footer from '@/components/Footer';

const silkyEase: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

const statusConfig = {
  pending:   { label: 'En attente',   color: 'text-amber-400',   bg: 'bg-amber-500/5 border-amber-500/20',    step: 1 },
  confirmed: { label: 'Confirmée',    color: 'text-[#D4AF37]',   bg: 'bg-[#D4AF37]/5 border-[#D4AF37]/20',   step: 2 },
  shipped:   { label: 'En transit',   color: 'text-white',       bg: 'bg-white/5 border-white/20',            step: 3 },
  delivered: { label: 'Livrée',       color: 'text-emerald-400', bg: 'bg-emerald-500/5 border-emerald-500/20', step: 4 },
  cancelled: { label: 'Annulée',      color: 'text-white/40',    bg: 'bg-white/5 border-white/10',            step: -1 },
} as const;

const steps = [
  { key: 1, label: 'En attente',   sub: 'Commande reçue' },
  { key: 2, label: 'Confirmée',    sub: 'En cours de préparation' },
  { key: 3, label: 'En transit',   sub: 'En route vers vous' },
  { key: 4, label: 'Livrée',       sub: 'Livraison effectuée' },
];

const formatDate = (timestamp: number) =>
  new Date(timestamp).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });

const formatStepTime = (ts: number) => {
  const d = new Date(ts);
  const hm = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const date = d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' });
  return { hm, date };
};

// Mapping step.key → champ timestamp de l'Order
const stepTimestampKey: Record<number, keyof import('@/store/useAdminStore').Order> = {
  1: 'pendingAt',
  2: 'confirmedAt',
  3: 'shippedAt',
  4: 'deliveredAt',
};

// ── Génération de la facture PDF ──────────────────────────────────────────────
const downloadInvoice = (order: Order) => {
  const orderDate = new Date(order.timestamp).toLocaleDateString('fr-FR', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
  const ref = order.reference ?? `#${order.id.slice(0, 8).toUpperCase()}`;

  const rows = order.items.map(item => `
    <tr>
      <td style="padding:12px 8px;border-bottom:1px solid #eee;">
        <div style="font-size:13px;font-weight:500;color:#111;">${item.productName}</div>
        ${item.volume ? `<div style="font-size:10px;color:#999;">${item.volume}</div>` : ''}
      </td>
      <td style="padding:12px 8px;border-bottom:1px solid #eee;text-align:center;font-size:13px;color:#555;">${item.quantity}</td>
      <td style="padding:12px 8px;border-bottom:1px solid #eee;text-align:right;font-size:13px;color:#555;">${item.price.toFixed(2)} €</td>
      <td style="padding:12px 8px;border-bottom:1px solid #eee;text-align:right;font-size:13px;font-weight:600;color:#111;">${(item.price * item.quantity).toFixed(2)} €</td>
    </tr>
  `).join('');

  const discountRow = (order.promoDiscount ?? 0) > 0 ? `
    <tr><td colspan="3" style="padding:5px 0;font-size:13px;">Remise (${order.promoCode})</td>
    <td style="text-align:right;color:#16a34a;font-size:13px;">-${((order.totalAmount * (order.promoDiscount! / (100 - order.promoDiscount!))) / 1).toFixed(2)} €</td></tr>
  ` : '';

  const addrBlock = order.shippingAddress ? `
    <div style="font-family:Arial,sans-serif;font-size:11px;color:#666;line-height:1.7;margin-bottom:32px;">
      <strong>${order.userName ?? ''}</strong><br/>
      ${order.shippingAddress.address}<br/>
      ${order.shippingAddress.postalCode} ${order.shippingAddress.city}, ${order.shippingAddress.country}<br/>
      ${order.userEmail ?? ''}
    </div>
  ` : '';

  const html = `<!DOCTYPE html>
<html lang="fr"><head><meta charset="UTF-8"/>
<title>Facture ${ref} — Rayha Store</title>
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
  .footer{margin-top:48px;padding-top:16px;border-top:1px solid #eee;font-family:Arial,sans-serif;font-size:10px;color:#bbb;text-align:center;line-height:1.8;}
</style></head><body>
  <div class="header">
    <div class="brand">Rayha Store<small>La Maison du Parfum</small></div>
    <div class="meta">
      <div class="ref">${ref}</div>
      Facture — ${orderDate}<br/>${order.userEmail ?? ''}
    </div>
  </div>
  ${addrBlock}
  <p class="section-label">Détail de la commande</p>
  <table>
    <thead><tr><th>Produit</th><th>Qté</th><th>Prix unitaire</th><th>Total</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <table class="totals"><tbody>
    ${discountRow}
    <tr class="grand"><td>Total TTC</td><td>${order.totalAmount.toFixed(2)} €</td></tr>
  </tbody></table>
  <div class="footer">Rayha Store — conciergerie@rayhastore.com<br/>Ce document tient lieu de facture. Merci pour votre confiance.</div>
  <script>window.onload=()=>{window.print();window.onafterprint=()=>window.close();};<\/script>
</body></html>`;

  const win = window.open('', '_blank');
  if (!win) { alert('Autorisez les pop-ups pour télécharger la facture.'); return; }
  win.document.write(html);
  win.document.close();
};

// ── Composant carte commande ──────────────────────────────────────────────────
const OrderCard = ({ order, index }: { order: Order; index: number }) => {
  const [open, setOpen] = useState(false);
  const cfg = statusConfig[order.status] ?? statusConfig.pending;
  const activeStep = cfg.step;
  const cancelled = order.status === 'cancelled';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.6, ease: silkyEase }}
      className="bg-[#0E0E0E] rounded-xl overflow-hidden shadow-xl border border-white/5"
    >
      {/* ── Header cliquable ── */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full px-6 md:px-8 py-5 flex flex-wrap items-center justify-between gap-4 border-b border-white/5 hover:bg-white/[0.02] transition-colors text-left"
      >
        <div className="flex items-center gap-6">
          <div>
            <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] mb-1">Référence</p>
            <p className="text-xs font-mono text-white/70 tracking-tighter">
              {order.reference ?? `#${order.id.slice(0, 8).toUpperCase()}`}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] mb-1">Date</p>
            <p className="text-xs text-white/70">{formatDate(order.timestamp)}</p>
          </div>
          <div>
            <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] mb-1">Total</p>
            <p className="text-xs font-serif text-[#D4AF37]">{order.totalAmount.toFixed(2)} €</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className={`text-[10px] uppercase tracking-[0.2em] px-3 py-1.5 rounded-full border ${cfg.bg} ${cfg.color} font-bold`}>
            {cfg.label}
          </span>
          <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }}>
            <ChevronDown className="w-4 h-4 text-white/30" />
          </motion.div>
        </div>
      </button>

      {/* ── Corps accordéon ── */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="accordion"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: silkyEase }}
            style={{ overflow: 'hidden' }}
          >
            <div className="px-6 md:px-8 py-8 space-y-8">

              {/* Suivi de statut */}
              <div>
                <p className="text-[10px] text-white/30 uppercase tracking-[0.25em] mb-6">Suivi de commande</p>
                {cancelled ? (
                  <div className="flex items-center gap-3 text-sm text-white/40">
                    <X className="w-4 h-4 text-red-400/70" />
                    <span>Cette commande a été annulée.</span>
                  </div>
                ) : (
                  <div className="relative">
                    {/* Ligne de progression */}
                    <div className="absolute top-4 left-4 right-4 h-px bg-white/5" />
                    <div
                      className="absolute top-4 left-4 h-px bg-[#D4AF37]/50 transition-all duration-700"
                      style={{ width: `${Math.min(((activeStep - 1) / (steps.length - 1)) * 100, 100)}%` }}
                    />

                    <div className="relative flex justify-between">
                      {steps.map(step => {
                        const done   = step.key <= activeStep;
                        const active = step.key === activeStep;
                        const tsKey  = stepTimestampKey[step.key];
                        const ts     = tsKey ? (order as unknown as Record<string, number | undefined>)[tsKey as string] : undefined;
                        const fmt    = done && ts ? formatStepTime(ts) : null;
                        return (
                          <div key={step.key} className="flex flex-col items-center gap-1 flex-1">
                            {/* Horodatage au-dessus de l'icône */}
                            <div className="text-center mb-1 min-h-[28px] flex flex-col items-center justify-end">
                              {fmt ? (
                                <>
                                  <p className="text-[10px] font-bold text-[#D4AF37]/90 leading-none">{fmt.hm}</p>
                                  <p className="text-[8px] text-white/30 mt-0.5 leading-none">{fmt.date}</p>
                                </>
                              ) : (
                                <span className="block" />
                              )}
                            </div>

                            {/* Icône d'étape */}
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-300 z-10
                              ${done
                                ? 'bg-[#D4AF37]/10 border-[#D4AF37]/50 text-[#D4AF37]'
                                : 'bg-[#0E0E0E] border-white/10 text-white/20'}`}
                            >
                              {done
                                ? active
                                  ? <div className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
                                  : <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                                : <div className="w-2 h-2 rounded-full bg-white/10" />}
                            </div>

                            {/* Label sous l'icône */}
                            <div className="text-center hidden sm:block mt-1">
                              <p className={`text-[10px] uppercase tracking-[0.15em] font-bold ${done ? 'text-[#D4AF37]' : 'text-white/20'}`}>
                                {step.label}
                              </p>
                              <p className={`text-[8px] mt-0.5 ${done ? 'text-white/40' : 'text-white/15'}`}>
                                {step.sub}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Articles */}
              <div>
                <p className="text-[10px] text-white/30 uppercase tracking-[0.25em] mb-4">Articles</p>
                <div className="space-y-3">
                  {order.items.map((item, j) => (
                    <div key={`${item.productId}-${j}`} className="flex items-center justify-between gap-4">
                      <div className="flex items-baseline gap-3 min-w-0">
                        <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-tighter">{item.quantity}×</span>
                        <span className="text-sm text-white/80 font-serif truncate">{item.productName}</span>
                        {item.volume && (
                          <span className="text-[10px] text-white/30 uppercase tracking-widest">{item.volume}</span>
                        )}
                      </div>
                      <span className="text-xs text-white/50 flex-shrink-0">{(item.price * item.quantity).toFixed(2)} €</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Adresse + promo */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                <div className="space-y-3">
                  {order.promoCode && (
                    <div className="flex items-center gap-2 text-[10px] text-[#D4AF37]/80 uppercase tracking-widest font-bold">
                      <Tag className="w-3 h-3" />
                      Privilège : {order.promoCode}
                    </div>
                  )}
                  {order.shippingAddress && (
                    <div className="flex items-start gap-2 text-[11px] text-white/30 leading-relaxed">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-[#D4AF37]/40" />
                      <span>
                        {order.shippingAddress.address}<br />
                        {order.shippingAddress.postalCode} {order.shippingAddress.city}, {order.shippingAddress.country}
                      </span>
                    </div>
                  )}
                </div>

                {/* Bouton facture */}
                <button
                  onClick={() => downloadInvoice(order)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#D4AF37]/30 text-[#D4AF37] text-[10px] uppercase tracking-[0.15em] font-bold hover:bg-[#D4AF37]/10 transition-colors flex-shrink-0 self-end sm:self-auto"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  Facture PDF
                </button>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ── Page principale ───────────────────────────────────────────────────────────
const MesCommandes = () => {
  const navigate = useNavigate();
  const { user, userId, isLoading } = useAuth();
  const { getOrdersByUserId } = useOrderManagement();

  useEffect(() => {
    if (!isLoading && !user) navigate('/login');
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FCFBF9]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4AF37]" />
      </div>
    );
  }

  if (!user || !userId) return null;

  const userOrders = getOrdersByUserId(userId).sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="min-h-screen flex flex-col bg-[#FCFBF9]">
      <main className="flex-1 py-12 md:py-20 selection:bg-[#D4AF37] selection:text-black">
        <div className="container mx-auto px-5 max-w-4xl">

          <button
            onClick={() => navigate(-1)}
            className="group inline-flex items-center gap-2 text-[#1a1a1a]/40 hover:text-[#1a1a1a] transition-colors mb-12 text-[10px] tracking-[0.2em] uppercase font-bold"
          >
            <ChevronLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
            Retour
          </button>

          <div className="mb-16 border-b border-[#1a1a1a]/5 pb-10">
            <span className="text-[10px] text-[#A68A56] uppercase tracking-[0.4em] mb-3 block font-semibold">
              Espace Personnel
            </span>
            <h1 className="font-serif text-3xl md:text-5xl text-[#1a1a1a] mb-4">
              Historique des commandes
            </h1>
            <p className="text-sm text-[#1a1a1a]/50 font-light">
              {userOrders.length === 0
                ? 'Aucune commande enregistrée à ce jour.'
                : `Récapitulatif de vos ${userOrders.length} acquisition${userOrders.length > 1 ? 's' : ''}.`}
            </p>
          </div>

          {userOrders.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-24 text-center border border-dashed border-[#1a1a1a]/10 rounded-2xl"
            >
              <ShoppingBag className="w-8 h-8 text-[#1a1a1a]/10 mx-auto mb-6" />
              <p className="text-sm text-[#1a1a1a]/40 tracking-wide mb-8">Votre historique est vierge.</p>
              <button
                onClick={() => navigate('/all-products')}
                className="inline-flex items-center gap-3 text-[11px] font-bold tracking-[0.2em] uppercase text-[#1a1a1a] hover:text-[#A68A56] transition-colors"
              >
                Parcourir la collection <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}

          <div className="space-y-4">
            {userOrders.map((order, i) => (
              <OrderCard key={order.id} order={order} index={i} />
            ))}
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MesCommandes;
