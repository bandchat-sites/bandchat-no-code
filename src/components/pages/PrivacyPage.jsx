import { useSiteConfig } from '../../context/SiteConfigContext';

export default function PrivacyPage() {
  const config = useSiteConfig();
  return (
    <div className="section">
      <div className="container" style={{ maxWidth: '800px' }}>
        <div className="page-hero">
          <h1 className="page-hero__title">Privacy Policy</h1>
          <p className="page-hero__subtitle">Last updated: February 2026</p>
        </div>

        <div style={{ lineHeight: 1.8, color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', margin: 'var(--space-xl) 0 var(--space-md)' }}>1. Introduction</h2>
          <p>
            {config.band.name} ("we", "us", "our") respects your privacy and is committed to protecting your personal data.
            This privacy policy explains how we collect, use, and safeguard your information when you visit our website
            at {config.domain}.
          </p>

          <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', margin: 'var(--space-xl) 0 var(--space-md)' }}>2. Information We Collect</h2>
          <p>We may collect the following types of information:</p>
          <ul style={{ paddingLeft: 'var(--space-lg)', margin: 'var(--space-md) 0', listStyle: 'disc' }}>
            <li><strong>Contact form submissions:</strong> Name, email address, and message content when you reach out to us.</li>
            <li><strong>Guest list signups:</strong> Name, email address, and party size when you sign up for a gig guest list.</li>
            <li><strong>Usage data:</strong> Anonymous analytics data such as page views, browser type, and general location (country/city level).</li>
          </ul>

          <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', margin: 'var(--space-xl) 0 var(--space-md)' }}>3. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul style={{ paddingLeft: 'var(--space-lg)', margin: 'var(--space-md) 0', listStyle: 'disc' }}>
            <li>Respond to your inquiries and booking requests</li>
            <li>Manage guest list entries for upcoming gigs</li>
            <li>Improve our website and user experience</li>
            <li>Send you information about upcoming shows (only if you opt in)</li>
          </ul>

          <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', margin: 'var(--space-xl) 0 var(--space-md)' }}>4. Data Sharing</h2>
          <p>
            We do not sell, trade, or otherwise transfer your personal information to third parties.
            We may share data with trusted service providers who assist in operating our website,
            provided they agree to keep your information confidential.
          </p>

          <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', margin: 'var(--space-xl) 0 var(--space-md)' }}>5. Data Retention</h2>
          <p>
            We retain your personal data only for as long as necessary to fulfill the purposes for which it was collected.
            Contact form data is retained for up to 12 months. Guest list data is retained for up to 3 months after the event.
          </p>

          <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', margin: 'var(--space-xl) 0 var(--space-md)' }}>6. Your Rights</h2>
          <p>You have the right to:</p>
          <ul style={{ paddingLeft: 'var(--space-lg)', margin: 'var(--space-md) 0', listStyle: 'disc' }}>
            <li>Access the personal data we hold about you</li>
            <li>Request correction or deletion of your data</li>
            <li>Withdraw consent for data processing at any time</li>
            <li>Lodge a complaint with a data protection authority</li>
          </ul>

          <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', margin: 'var(--space-xl) 0 var(--space-md)' }}>7. Contact</h2>
          <p>
            For any privacy-related questions or requests, please contact us at{' '}
            <a href={`mailto:${config.emails.privacy}`} style={{ color: 'var(--color-red)' }}>{config.emails.privacy}</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
