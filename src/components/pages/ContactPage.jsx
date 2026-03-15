import { useState } from 'react';
import { useSiteConfig } from '../../context/SiteConfigContext';
import '../../../styles/pages/contact.css';

export default function ContactPage() {
  const config = useSiteConfig();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    type: 'booking',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setError(null);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to send');
      }
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again or email us directly.');
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <h1 className="page-hero__title">Get in Touch</h1>
          <p className="page-hero__subtitle">
            Book us for your event or just say hello
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="contact-grid">
            <div>
              <h2 className="section-title">Send a Message</h2>
              {submitted ? (
                <div style={{ padding: 'var(--space-2xl)', textAlign: 'center' }}>
                  <div style={{ fontSize: 'var(--text-4xl)', marginBottom: 'var(--space-md)' }}>&#9889;</div>
                  <h3 style={{ marginBottom: 'var(--space-md)' }}>Message Sent!</h3>
                  <p>We'll get back to you soon.</p>
                  <button
                    className="btn btn--secondary"
                    style={{ marginTop: 'var(--space-lg)' }}
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({ name: '', email: '', type: 'booking', message: '' });
                    }}
                  >
                    Send Another
                  </button>
                </div>
              ) : (
                <form className="contact-form" onSubmit={handleSubmit}>
                  <div className="contact-field">
                    <label className="contact-field__label" htmlFor="name">Name</label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      className="contact-field__input"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="contact-field">
                    <label className="contact-field__label" htmlFor="email">Email</label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      className="contact-field__input"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="contact-field">
                    <label className="contact-field__label" htmlFor="type">Inquiry Type</label>
                    <select
                      id="type"
                      name="type"
                      className="contact-field__input"
                      value={formData.type}
                      onChange={handleChange}
                    >
                      <option value="booking">Booking Inquiry</option>
                      <option value="corporate">Corporate Event</option>
                      <option value="press">Press / Media</option>
                      <option value="general">General</option>
                    </select>
                  </div>

                  <div className="contact-field">
                    <label className="contact-field__label" htmlFor="message">Message</label>
                    <textarea
                      id="message"
                      name="message"
                      className="contact-field__textarea"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      placeholder="Tell us about your event, venue, date, and any other details..."
                    />
                  </div>

                  {error && (
                    <div className="error-message" style={{ marginBottom: 'var(--space-md)' }}>
                      {error}
                    </div>
                  )}

                  <button type="submit" className="btn btn--primary btn--lg" disabled={sending}>
                    {sending ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              )}
            </div>

            <div className="contact-info">
              <h2 className="section-title">Connect With Us</h2>

              <div className="contact-info__item">
                <div className="contact-info__icon">&#127925;</div>
                <div>
                  <div className="contact-info__label">Based in</div>
                  <div className="contact-info__value">{config.band.location}</div>
                </div>
              </div>

              <div className="contact-info__item">
                <div className="contact-info__icon">&#9993;</div>
                <div>
                  <div className="contact-info__label">Email</div>
                  <div className="contact-info__value">
                    <a href={`mailto:${config.emails.info}`}>{config.emails.info}</a>
                  </div>
                </div>
              </div>

              <div className="contact-info__item">
                <div className="contact-info__icon">&#127908;</div>
                <div>
                  <div className="contact-info__label">We Play</div>
                  <div className="contact-info__value">
                    Bars, Live Houses, Corporate Events, Private Parties, Festivals
                  </div>
                </div>
              </div>

              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-lg)', marginTop: 'var(--space-xl)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Follow Us
              </h3>

              <div className="contact-socials" style={{ flexWrap: 'wrap' }}>
                {(config.social || []).map(s => (
                  <a key={s.platform} href={s.url} target="_blank" rel="noopener noreferrer" className="contact-social">
                    {s.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
