const RouteLoader = () => {
  return (
    <div className="route-loader" role="status" aria-live="polite">
      <div className="route-loader__spinner" aria-hidden="true" />
      <p className="route-loader__text">Loading…</p>
    </div>
  );
};

export default RouteLoader;