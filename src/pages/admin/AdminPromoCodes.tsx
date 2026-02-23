import PromoCodesManager from '@/components/admin/PromoCodesManager';

const AdminPromoCodes = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-admin-text-primary font-montserrat tracking-tighter">
          Codes Promo
        </h1>
        <p className="text-admin-text-secondary mt-2">
          Créez, gérez et suivez l'utilisation de vos codes promo
        </p>
      </div>

      <PromoCodesManager />
    </div>
  );
};

export default AdminPromoCodes;
