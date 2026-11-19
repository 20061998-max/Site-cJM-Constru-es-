import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    message: '',
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      message: error.message || 'Ocorreu um erro inesperado na aplicação.',
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Erro capturado pelo ErrorBoundary:', error, errorInfo);
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white border border-slate-200 rounded-xl p-8 text-center shadow-sm">
            <div className="w-12 h-12 rounded-lg bg-red-50 text-red-700 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" aria-hidden="true" />
            </div>
            <h1 className="font-display text-xl font-bold text-[#0f172a] mb-2">
              Erro ao carregar dados do sistema
            </h1>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              Não foi possível concluir a operação com o banco de dados. Recarregue a página ou tente novamente em instantes.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#0f172a] hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" aria-hidden="true" />
              <span>Recarregar Site</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
