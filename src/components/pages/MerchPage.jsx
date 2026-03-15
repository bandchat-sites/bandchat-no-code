import '../../../styles/pages/merch.css';

// Static merch items (can be moved to a JSON data file later)
const MERCH_ITEMS = [
  // Placeholder items - replace with real merch when available
];

export default function MerchPage() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <h1 className="page-hero__title">Merch</h1>
          <p className="page-hero__subtitle">
            Rep the band
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {MERCH_ITEMS.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-4xl)', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: 'var(--text-5xl)', marginBottom: 'var(--space-lg)', opacity: 0.3 }}>&#128085;</div>
              <h3 style={{ marginBottom: 'var(--space-md)', color: 'var(--text-secondary)' }}>Merch Coming Soon</h3>
              <p>We're working on something cool. Follow us on social media for the announcement.</p>
            </div>
          ) : (
            <div className="merch-grid stagger-children">
              {MERCH_ITEMS.map((item, i) => (
                <div key={i} className="merch-card">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="merch-card__image" loading="lazy" />
                  ) : (
                    <div className="merch-card__placeholder">&#128085;</div>
                  )}
                  <div className="merch-card__body">
                    <h3 className="merch-card__name">{item.name}</h3>
                    {item.description && (
                      <p className="merch-card__description">{item.description}</p>
                    )}
                    <div className="merch-card__footer">
                      {item.price && <span className="merch-card__price">{item.price}</span>}
                      {item.url && (
                        <a href={item.url} target="_blank" rel="noopener noreferrer" className="btn btn--amber btn--sm">
                          Buy Now
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
