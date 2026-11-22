import Button from './Button';

type ErrorStateProps = {
  title?: string;
  message: string;
  onRetry?: () => void;
};

export default function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="cc-state cc-state--error" role="alert">
      <div className="cc-state-icon" aria-hidden="true">
        !
      </div>
      <h3>{title}</h3>
      <p>{message}</p>

      {onRetry && <Button onClick={onRetry}>Try Again</Button>}
    </div>
  );
}
