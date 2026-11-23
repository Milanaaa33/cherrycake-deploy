import "./Loader.css";

// Generic UI component: no translation hook here (it must render without a Redux Provider).
// Callers pass the translated text, e.g. <Loader label={t('ui.loading', 'Loading...')} />.
type LoaderProps = {
  label?: string;
};

export default function Loader({ label = "Loading..." }: LoaderProps) {
  return (
    <div className="cc-loader" role="status" aria-label={label}>
      <span className="cc-spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
