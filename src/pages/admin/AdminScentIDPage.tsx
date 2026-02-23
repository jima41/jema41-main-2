import AdminScentID from '@/components/admin/AdminScentID';

const AdminScentIDPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-admin-text-primary font-montserrat tracking-tighter">
          Scent ID Analytics
        </h1>
        <p className="text-admin-text-secondary mt-2">
          Analyse des profils olfactifs et recommandations personnalisées
        </p>
      </div>

      <AdminScentID />
    </div>
  );
};

export default AdminScentIDPage;