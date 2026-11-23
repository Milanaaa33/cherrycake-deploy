import Button from './Button';

// Generic UI component: no translation hook here (it must render without a Redux Provider).
// Callers pass translated texts via props, e.g. title={t('ui.errorTitle', 'Something went wrong')}
// and retryLabel={t('ui.retry', 'Try Again')}.
type ErrorStateProps = {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
};

export default function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
  retryLabel = 'Try Again',
}: ErrorStateProps) {
  return (
    <div className="cc-state cc-state--error" role="alert">
      <div className="cc-state-icon" aria-hidden="true">
        !
      </div>
      <h3>{title}</h3>
      <p>{message}</p>

      {onRetry && <Button onClick={onRetry}>{retryLabel}</Button>}
    </div>
  );
}
