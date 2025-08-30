import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
      <div className="bg-red-500/20 backdrop-blur-md rounded-full p-4 mb-4">
        <AlertCircle className="h-12 w-12 text-red-300" />
      </div>
      
      <h3 className="text-xl font-semibold text-red-500 mb-2">Something went wrong</h3>
      <p className="text-white/70 mb-6 max-w-md">{message}</p>
      
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-2xl transition-all duration-200 hover:scale-105"
        >
          <RefreshCw className="h-5 w-5" />
          Try Again
        </button>
      )}
    </div>
  );
}