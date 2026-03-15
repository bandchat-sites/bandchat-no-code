export default function MerchManager() {
  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-xl)' }}>Merch Manager</h1>

      <div className="card">
        <div className="card__body">
          <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-md)' }}>
            Manage merchandise items displayed on the public merch page.
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
            Merch management will be available once a backend is added. For now, items can be configured directly in the MerchPage component.
          </p>
        </div>
      </div>
    </div>
  );
}
