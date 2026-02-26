import { Component, ReactNode } from 'react';
import OlfactoryNotesManager from '@/components/admin/OlfactoryNotesManager';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class OlfactoryNotesErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: any) {
    console.error('OlfactoryNotesManager render error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8">
          <h2 className="text-2xl font-bold text-red-400 mb-4">Erreur - Notes Olfactives</h2>
          <p className="text-admin-text-secondary mb-4">
            Une erreur est survenue lors du chargement du gestionnaire de notes olfactives.
          </p>
          <details className="bg-red-900/20 p-4 rounded-xl border border-red-700/40">
            <summary className="cursor-pointer font-medium text-red-400 text-sm">Détails</summary>
            <pre className="mt-3 text-xs text-red-300 overflow-auto whitespace-pre-wrap">
              {this.state.error?.message}
            </pre>
          </details>
          <button
            className="mt-4 px-4 py-2 rounded-xl bg-admin-gold/10 border border-admin-gold/30 text-admin-gold text-sm"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Réessayer
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

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
      <OlfactoryNotesErrorBoundary>
        <OlfactoryNotesManager />
      </OlfactoryNotesErrorBoundary>
    </div>
  );
};

export default AdminOlfactoryNotes;
