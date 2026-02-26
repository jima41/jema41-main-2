import { useState } from 'react';
import { useOrderManagement, type Order } from '@/store/useAdminStore';
import {
  ShoppingCart, Clock, Truck, CheckCircle2, Package,
  ChevronDown, MapPin, Tag, AlertCircle, User, Mail, Phone,
  Trash2, FileText, Check, X,
} from 'lucide-react';

// ── Configs ───────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<Order['status'], {
  label: string;
  color: string;
  bg: string;
  next: Order['status'] | null;
  nextLabel: string | null;
}> = {
  pending:   { label: 'En attente',   color: 'text-amber-300',   bg: 'bg-amber-900/20 border-amber-700/40',     next: 'confirmed', nextLabel: 'Confirmer' },
  confirmed: { label: 'Confirmée',    color: 'text-blue-300',    bg: 'bg-blue-900/20 border-blue-700/40',       next: 'shipped',   nextLabel: 'Expédier' },
  shipped:   { label: 'Expédiée',     color: 'text-purple-300',  bg: 'bg-purple-900/20 border-purple-700/40',   next: 'delivered', nextLabel: 'Livrer' },
  delivered: { label: 'Livrée',       color: 'text-emerald-300', bg: 'bg-emerald-900/20 border-emerald-700/40', next: null,        nextLabel: null },
  cancelled: { label: 'Annulée',      color: 'text-red-400',     bg: 'bg-red-900/20 border-red-700/40',         next: null,        nextLabel: null },
};

const TABS: { value: string; label: string }[] = [
  { value: 'all',       label: 'Toutes' },
  { value: 'pending',   label: 'En attente' },
  { value: 'confirmed', label: 'Confirmées' },
  { value: 'shipped',   label: 'Expédiées' },
  { value: 'delivered', label: 'Livrées' },
  { value: 'cancelled', label: 'Annulées' },
];

const STATUS_STEPS: { key: Order['status']; label: string }[] = [
  { key: 'pending',   label: 'En attente' },
  { key: 'confirmed', label: 'Confirmée' },
  { key: 'shipped',   label: 'Expédiée' },
  { key: 'delivered', label: 'Livrée' },
];

const STATUS_ORDER = ['pending', 'confirmed', 'shipped', 'delivered'];

const formatDate = (ts: number) =>
  new Date(ts).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n);

// ── Status Stepper ────────────────────────────────────────────────────────────

const getStepTs = (order: Order, key: Order['status']): number | undefined => {
  if (key === 'pending')   return order.pendingAt ?? order.timestamp;
  if (key === 'confirmed') return order.confirmedAt;
  if (key === 'shipped')   return order.shippedAt;
  if (key === 'delivered') return order.deliveredAt;
};

const StatusStepper = ({ order }: { order: Order }) => {
  const isCancelled = order.status === 'cancelled';
  const currentIdx  = isCancelled ? -1 : STATUS_ORDER.indexOf(order.status);

  if (isCancelled) {
    return (
      <div>
        <p className="text-[10px] uppercase tracking-[0.2em] text-admin-text-secondary/60 mb-3">Progression</p>
        <div className="flex items-center gap-2 text-red-400 text-xs">
          <X className="w-4 h-4" />
          <span>Commande annulée</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.2em] text-admin-text-secondary/60 mb-4">Progression</p>
      <div className="flex items-start">
        {STATUS_STEPS.map((step, idx) => {
          const done    = idx < currentIdx;
          const current = idx === currentIdx;
          const ts      = getStepTs(order, step.key);
          const isLast  = idx === STATUS_STEPS.length - 1;

          return (
            <div key={step.key} className="flex items-start flex-1">
              <div className="flex flex-col items-center w-full">
                {/* Cercle */}
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all
                  ${done    ? 'border-emerald-500 bg-emerald-500'
                  : current ? 'border-admin-gold bg-admin-gold'
                  :           'border-admin-border bg-transparent'}`}
                >
                  {done    && <Check className="w-3 h-3 text-white" />}
                  {current && <div className="w-2 h-2 rounded-full bg-admin-bg" />}
                </div>

                {/* Label */}
                <p className={`text-[9px] uppercase tracking-widest mt-2 text-center font-semibold leading-tight
                  ${done    ? 'text-emerald-400'
                  : current ? 'text-admin-gold'
                  :           'text-admin-text-secondary/30'}`}
                >
                  {step.label}
                </p>

                {/* Date */}
                {ts && (
                  <p className="text-[9px] text-admin-text-secondary/40 mt-0.5 text-center">
                    {formatDate(ts)}
                  </p>
                )}
              </div>

              {/* Ligne de connexion */}
              {!isLast && (
                <div className={`h-[2px] flex-1 mt-3 transition-colors
                  ${idx < currentIdx ? 'bg-emerald-500' : 'bg-admin-border'}`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── Génération de facture PDF (impression navigateur) ─────────────────────────

const printInvoice = (order: Order) => {
  const clientName = order.shippingAddress?.firstName
    ? `${order.shippingAddress.firstName} ${order.shippingAddress.lastName || ''}`.trim()
    : (order.userName || 'Client');

  const ref  = order.reference ?? `#${order.id.slice(0, 8).toUpperCase()}`;
  const date = new Date(order.timestamp).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric',
  });

  const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #e5e7eb;font-size:13px;">
        ${item.productName}${item.volume ? ` <span style="color:#6b7280;font-size:11px;">(${item.volume})</span>` : ''}
      </td>
      <td style="padding:10px 0;border-bottom:1px solid #e5e7eb;text-align:center;font-size:13px;">${item.quantity}</td>
      <td style="padding:10px 0;border-bottom:1px solid #e5e7eb;text-align:right;font-size:13px;">${item.price.toFixed(2)} €</td>
      <td style="padding:10px 0;border-bottom:1px solid #e5e7eb;text-align:right;font-size:13px;font-weight:600;">${(item.price * item.quantity).toFixed(2)} €</td>
    </tr>
  `).join('');

  const addrHtml = order.shippingAddress
    ? `${order.shippingAddress.address}<br>${order.shippingAddress.postalCode} ${order.shippingAddress.city}<br>${order.shippingAddress.country}`
    : '—';

  const promoHtml = order.promoCode
    ? `<tr><td style="padding:6px 0;color:#6b7280;font-size:12px;">Code promo <strong>${order.promoCode}</strong>${order.promoDiscount ? ` (-${order.promoDiscount}%)` : ''}</td><td colspan="3" style="text-align:right;padding:6px 0;color:#059669;font-size:12px;">Appliqué</td></tr>`
    : '';

  const emailLine = order.shippingAddress?.email || order.userEmail
    ? `<p style="font-size:12px;color:#6b7280;margin-top:4px;">${order.shippingAddress?.email || order.userEmail}</p>`
    : '';
  const phoneLine = order.shippingAddress?.phone
    ? `<p style="font-size:12px;color:#6b7280;margin-top:2px;">${order.shippingAddress.phone}</p>`
    : '';

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>Facture ${ref}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:Georgia,serif; color:#1f2937; background:#fff; padding:48px; }
  .hdr { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:40px; padding-bottom:24px; border-bottom:3px solid #D4AF37; }
  .brand { font-size:30px; font-weight:700; letter-spacing:.12em; color:#111; }
  .brand-sub { font-size:10px; letter-spacing:.3em; color:#9ca3af; margin-top:4px; text-transform:uppercase; font-family:Arial,sans-serif; }
  .inv-meta { text-align:right; }
  .inv-title { font-size:22px; font-weight:700; color:#D4AF37; letter-spacing:.05em; }
  .inv-info { font-size:12px; color:#6b7280; margin-top:5px; }
  .cols { display:flex; justify-content:space-between; gap:24px; margin-bottom:40px; }
  .col-title { font-size:9px; text-transform:uppercase; letter-spacing:.2em; color:#9ca3af; margin-bottom:10px; font-family:Arial,sans-serif; }
  table { width:100%; border-collapse:collapse; }
  .items th { font-size:9px; text-transform:uppercase; letter-spacing:.15em; color:#9ca3af; padding:8px 0; border-bottom:2px solid #e5e7eb; text-align:left; font-family:Arial,sans-serif; }
  .items th.c { text-align:center; }
  .items th.r { text-align:right; }
  .totals { width:300px; margin-left:auto; margin-top:24px; }
  .totals td { padding:5px 0; font-size:13px; }
  .grand td { padding:14px 0; font-size:16px; font-weight:700; border-top:2px solid #D4AF37; color:#D4AF37; }
  .grand td.r { text-align:right; }
  .footer { margin-top:60px; padding-top:20px; border-top:1px solid #e5e7eb; font-size:10px; color:#9ca3af; text-align:center; font-family:Arial,sans-serif; }
  @media print { body { padding:20px; } }
</style>
</head>
<body>
  <div class="hdr">
    <div>
      <div class="brand">RAYHA</div>
      <div class="brand-sub">Parfums de Luxe</div>
    </div>
    <div class="inv-meta">
      <div class="inv-title">FACTURE</div>
      <div class="inv-info">Réf. ${ref}</div>
      <div class="inv-info">Date : ${date}</div>
    </div>
  </div>

  <div class="cols">
    <div>
      <p class="col-title">Client</p>
      <p style="font-size:14px;font-weight:600;">${clientName}</p>
      ${emailLine}
      ${phoneLine}
    </div>
    <div style="text-align:right;">
      <p class="col-title">Adresse de livraison</p>
      <p style="font-size:13px;color:#374151;line-height:1.7;">${addrHtml}</p>
    </div>
  </div>

  <table class="items">
    <thead>
      <tr>
        <th>Produit</th>
        <th class="c">Qté</th>
        <th class="r">Prix unit.</th>
        <th class="r">Sous-total</th>
      </tr>
    </thead>
    <tbody>
      ${itemsHtml}
    </tbody>
  </table>

  <table class="totals">
    <tbody>
      ${promoHtml}
      <tr class="grand">
        <td>Total TTC</td>
        <td class="r">${order.totalAmount.toFixed(2)} €</td>
      </tr>
    </tbody>
  </table>

  <div class="footer">
    <p>Rayha — Parfums de Luxe &nbsp;·&nbsp; Merci pour votre confiance.</p>
    <p style="margin-top:4px;">Ce document est une facture officielle.</p>
  </div>

  <script>window.onload = () => window.print();</script>
</body>
</html>`;

  const w = window.open('', '_blank', 'width=820,height=1050');
  if (w) { w.document.write(html); w.document.close(); }
};

// ── Ligne de commande avec accordéon ─────────────────────────────────────────

const OrderRow = ({
  order,
  onStatusChange,
  onDelete,
}: {
  order: Order;
  onStatusChange: (id: string, status: Order['status']) => void;
  onDelete: (id: string) => void;
}) => {
  const [open, setOpen]       = useState(false);
  const [confirmDel, setConf] = useState(false);
  const cfg = STATUS_CONFIG[order.status];

  return (
    <div className="border border-admin-border rounded-lg overflow-hidden hover:border-admin-gold/30 transition-colors">
      {/* Ligne principale cliquable */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full glass-panel p-4 bg-admin-card/50 hover:bg-admin-card/70 transition-colors text-left"
      >
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 items-center">
          {/* Référence + client */}
          <div className="col-span-2 md:col-span-2 min-w-0">
            <p className="font-medium text-admin-text-primary text-sm truncate">
              {order.reference ?? `#${order.id.slice(0, 8).toUpperCase()}`}
            </p>
            <p className="text-xs text-admin-text-secondary truncate mt-0.5">
              {order.userName ?? 'Client invité'} · {order.userEmail ?? '—'}
            </p>
          </div>

          {/* Articles */}
          <div className="text-center hidden md:block">
            <p className="font-medium text-admin-text-primary">{order.items.length}</p>
            <p className="text-xs text-admin-text-secondary">article{order.items.length > 1 ? 's' : ''}</p>
          </div>

          {/* Montant + date */}
          <div className="text-right md:text-center">
            <p className="font-bold text-admin-gold">{formatCurrency(order.totalAmount)}</p>
            <p className="text-xs text-admin-text-secondary">{formatDate(order.timestamp)}</p>
          </div>

          {/* Statut */}
          <div className="flex justify-center">
            <span className={`text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full border ${cfg.bg} ${cfg.color}`}>
              {cfg.label}
            </span>
          </div>

          {/* Chevron */}
          <div className="flex justify-end">
            <ChevronDown
              className={`w-4 h-4 text-admin-text-secondary/50 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
            />
          </div>
        </div>
      </button>

      {/* Accordéon */}
      {open && (
        <div className="border-t border-admin-border bg-admin-bg/40 p-5 space-y-6">

          {/* ── Stepper ── */}
          <StatusStepper order={order} />

          {/* ── Articles ── */}
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-admin-text-secondary/60 mb-3">Articles</p>
            <div className="space-y-2">
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between items-center text-sm bg-admin-card/30 rounded px-3 py-2">
                  <div>
                    <span className="text-admin-text-primary">{item.productName}</span>
                    {item.volume && <span className="text-xs text-admin-text-secondary ml-2">{item.volume}</span>}
                    <span className="text-xs text-admin-text-secondary ml-2">× {item.quantity}</span>
                  </div>
                  <span className="font-medium text-admin-gold">{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Infos client + adresse + promo ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Coordonnées */}
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-[0.2em] text-admin-text-secondary/60 mb-3">Coordonnées client</p>
              {(order.shippingAddress?.firstName || order.shippingAddress?.lastName || order.userName) && (
                <div className="flex items-center gap-2 text-xs text-admin-text-secondary">
                  <User className="w-3.5 h-3.5 text-admin-gold/60 flex-shrink-0" />
                  <span className="font-medium text-admin-text-primary">
                    {order.shippingAddress?.firstName || order.shippingAddress?.lastName
                      ? `${order.shippingAddress.firstName || ''} ${order.shippingAddress.lastName || ''}`.trim()
                      : order.userName}
                  </span>
                </div>
              )}
              {(order.shippingAddress?.email || order.userEmail) && (
                <div className="flex items-center gap-2 text-xs text-admin-text-secondary">
                  <Mail className="w-3.5 h-3.5 text-admin-gold/60 flex-shrink-0" />
                  <span>{order.shippingAddress?.email || order.userEmail}</span>
                </div>
              )}
              {order.shippingAddress?.phone && (
                <div className="flex items-center gap-2 text-xs text-admin-text-secondary">
                  <Phone className="w-3.5 h-3.5 text-admin-gold/60 flex-shrink-0" />
                  <span>{order.shippingAddress.phone}</span>
                </div>
              )}
            </div>

            {/* Adresse de livraison */}
            {order.shippingAddress && (
              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-[0.2em] text-admin-text-secondary/60 mb-3">Adresse de livraison</p>
                <div className="flex items-start gap-2 text-xs text-admin-text-secondary">
                  <MapPin className="w-3.5 h-3.5 text-admin-gold/60 flex-shrink-0 mt-0.5" />
                  <span className="leading-relaxed">
                    {order.shippingAddress.address}<br />
                    {order.shippingAddress.postalCode} {order.shippingAddress.city}<br />
                    {order.shippingAddress.country}
                  </span>
                </div>
              </div>
            )}

            {/* Code promo */}
            {order.promoCode && (
              <div className="md:col-span-2 flex items-center gap-2 text-xs text-emerald-400">
                <Tag className="w-3.5 h-3.5" />
                <span className="uppercase tracking-widest font-semibold">{order.promoCode}</span>
                {order.promoDiscount && <span>(-{order.promoDiscount}%)</span>}
              </div>
            )}
          </div>

          {/* ── Actions ── */}
          <div className="flex flex-wrap items-start justify-between gap-4">
            {/* Changer le statut */}
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-admin-text-secondary/60 mb-3">Changer le statut</p>
              <div className="flex flex-wrap gap-2">
                {cfg.next && (
                  <button
                    onClick={() => onStatusChange(order.id, cfg.next!)}
                    className="px-4 py-2 rounded-lg bg-admin-gold text-admin-bg text-xs font-bold uppercase tracking-widest hover:bg-admin-gold/80 transition-colors"
                  >
                    {cfg.nextLabel}
                  </button>
                )}
                {order.status !== 'cancelled' && order.status !== 'delivered' && (
                  <button
                    onClick={() => onStatusChange(order.id, 'cancelled')}
                    className="px-4 py-2 rounded-lg border border-red-700/40 text-red-400 text-xs font-bold uppercase tracking-widest hover:bg-red-900/20 transition-colors"
                  >
                    Annuler
                  </button>
                )}
                {order.status === 'cancelled' && (
                  <button
                    onClick={() => onStatusChange(order.id, 'pending')}
                    className="px-4 py-2 rounded-lg border border-admin-border text-admin-text-secondary text-xs font-bold uppercase tracking-widest hover:bg-admin-card transition-colors"
                  >
                    Réactiver
                  </button>
                )}
              </div>
            </div>

            {/* Facture + Supprimer */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => printInvoice(order)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-admin-border text-admin-text-secondary text-xs font-medium transition-all"
              >
                <FileText className="w-3.5 h-3.5" />
                Facture PDF
              </button>

              {!confirmDel ? (
                <button
                  onClick={() => setConf(true)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-medium transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Supprimer
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-red-400 font-medium">Supprimer définitivement ?</span>
                  <button
                    onClick={() => { onDelete(order.id); setConf(false); }}
                    className="px-3 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-bold transition-all"
                  >
                    Confirmer
                  </button>
                  <button
                    onClick={() => setConf(false)}
                    className="px-3 py-2 rounded-xl border border-admin-border text-admin-text-secondary text-xs transition-all hover:bg-admin-card"
                  >
                    Annuler
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

// ── Page principale ───────────────────────────────────────────────────────────

const AdminOrders = () => {
  const { orders, updateOrderStatus, deleteOrder } = useOrderManagement();
  const [activeTab,   setActiveTab]   = useState('all');
  const [showCleanup, setShowCleanup] = useState(false);

  const filtered = orders
    .filter(o => activeTab === 'all' || o.status === activeTab)
    .sort((a, b) => b.timestamp - a.timestamp);

  // Stats
  const total     = orders.length;
  const pending   = orders.filter(o => o.status === 'pending').length;
  const shipped   = orders.filter(o => o.status === 'shipped').length;
  const delivered = orders.filter(o => o.status === 'delivered').length;
  const revenue   = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((s, o) => s + o.totalAmount, 0);

  // Nettoyer : garder uniquement la commande la plus récente
  const handleCleanup = () => {
    if (orders.length <= 1) { setShowCleanup(false); return; }
    const sorted   = [...orders].sort((a, b) => b.timestamp - a.timestamp);
    const toDelete = sorted.slice(1);
    toDelete.forEach(o => deleteOrder(o.id));
    setShowCleanup(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-admin-text-primary font-montserrat tracking-tighter">
            Gestion des Commandes
          </h1>
          <p className="text-admin-text-secondary mt-1">
            {total} commande{total > 1 ? 's' : ''} enregistrée{total > 1 ? 's' : ''}
          </p>
        </div>

        {/* Bouton nettoyage */}
        {orders.length > 1 && (
          <div>
            {!showCleanup ? (
              <button
                onClick={() => setShowCleanup(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-medium transition-all whitespace-nowrap"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Nettoyer l'historique
              </button>
            ) : (
              <div className="flex flex-col gap-2 p-3 rounded-xl border border-red-500/40 bg-red-900/20">
                <p className="text-xs text-red-300 font-medium">
                  Supprimer toutes les commandes sauf la dernière ?
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleCleanup}
                    className="px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-bold transition-all"
                  >
                    Confirmer
                  </button>
                  <button
                    onClick={() => setShowCleanup(false)}
                    className="px-3 py-1.5 rounded-lg border border-admin-border text-admin-text-secondary text-xs transition-all hover:bg-admin-card"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total',      value: total,                              color: 'text-admin-gold',  icon: ShoppingCart },
          { label: 'En attente', value: pending,                            color: 'text-amber-400',   icon: Clock },
          { label: 'Expédiées',  value: shipped,                            color: 'text-blue-400',    icon: Truck },
          { label: 'Livrées',    value: delivered,                          color: 'text-emerald-400', icon: CheckCircle2 },
          { label: 'Revenus',    value: `${(revenue / 1000).toFixed(1)}k€`, color: 'text-admin-gold',  icon: Package },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="glass-panel border border-admin-border rounded-xl p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-admin-text-secondary/60 mb-2">{label}</p>
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
              </div>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Onglets */}
      <div className="flex flex-wrap gap-1 p-1 glass-panel border border-admin-border rounded-lg">
        {TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-4 py-2 rounded-md text-xs font-semibold uppercase tracking-widest transition-colors ${
              activeTab === tab.value
                ? 'bg-admin-card text-admin-gold'
                : 'text-admin-text-secondary hover:text-admin-text-primary'
            }`}
          >
            {tab.label}
            {tab.value !== 'all' && (
              <span className="ml-1.5 opacity-60">
                ({orders.filter(o => o.status === tab.value).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Liste */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-16 glass-panel border border-admin-border rounded-xl">
            <AlertCircle className="w-10 h-10 text-admin-text-secondary/20 mx-auto mb-4" />
            <p className="text-admin-text-secondary text-sm">Aucune commande dans cette catégorie.</p>
          </div>
        ) : (
          filtered.map(order => (
            <OrderRow
              key={order.id}
              order={order}
              onStatusChange={updateOrderStatus}
              onDelete={deleteOrder}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
