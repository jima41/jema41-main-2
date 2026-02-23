import OlfactoryNotesManager from '@/components/admin/OlfactoryNotesManager';

const AdminOlfactoryNotes = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-admin-text-primary font-montserrat tracking-tighter">
          Notes Olfactives
        </h1>
        <p className="text-admin-text-secondary mt-1">
          Gérez la bibliothèque de notes pour la composition des parfums
        </p>
      </div>
      <OlfactoryNotesManager />
    </div>
  );
};

export default AdminOlfactoryNotes;
