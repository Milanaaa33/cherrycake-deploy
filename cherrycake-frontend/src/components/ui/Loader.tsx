import './Loader.css';
export default function Loader() {
  return (
    <div className="cc-loader" role="status" aria-label="Loading">
      <span className="cc-spinner" aria-hidden="true" />
      <span>Loading...</span>
    </div>
  );
}
