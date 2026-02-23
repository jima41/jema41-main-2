import AbandonedInsights from '@/components/admin/AbandonedInsights';
import React from 'react';

const AdminAbandonedInsights = () => {
  try {
    return <AbandonedInsights />;
  } catch (error) {
    console.error('AdminAbandonedInsights Error:', error);
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold text-red-500 mb-4">Erreur</h1>
        <p className="text-red-400 mb-4">Une erreur est survenue lors du chargement des Insights.</p>
        <details className="bg-red-900/20 p-4 rounded border border-red-700">
          <summary className="cursor-pointer font-medium text-red-400">Détails de l'erreur</summary>
          <pre className="mt-4 text-sm text-red-300 overflow-auto">
            {error instanceof Error ? error.message : String(error)}
          </pre>
        </details>
      </div>
    );
  }
};

export default AdminAbandonedInsights;
