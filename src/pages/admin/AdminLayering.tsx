import { Component, ReactNode } from 'react';
import LayeringManager from '@/components/admin/LayeringManager';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class LayeringErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: any) {
    console.error('LayeringManager render error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8">
          <h2 className="text-2xl font-bold text-red-400 mb-4">Erreur - L'Art de Combiner</h2>
          <p className="text-admin-text-secondary mb-4">
            Une erreur est survenue lors du chargement du gestionnaire.
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

const AdminLayering = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-admin-text-primary font-montserrat tracking-tighter">
          L'Art de Combiner
        </h1>
        <p className="text-admin-text-secondary mt-1">
          Configurez les accords olfactifs signature affichés sur la page publique.
        </p>
      </div>
      <LayeringErrorBoundary>
        <LayeringManager />
      </LayeringErrorBoundary>
    </div>
  );
};

export default AdminLayering;
