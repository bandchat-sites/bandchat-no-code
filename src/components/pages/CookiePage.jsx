import { useSiteConfig } from '../../context/SiteConfigContext';

export default function CookiePage() {
  const config = useSiteConfig();
  return (
    <div className="section">
      <div className="container" style={{ maxWidth: '800px' }}>
        <div className="page-hero">
          <h1 className="page-hero__title">Cookie Policy</h1>
          <p className="page-hero__subtitle">Last updated: February 2026</p>
        </div>

        <div style={{ lineHeight: 1.8, color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', margin: 'var(--space-xl) 0 var(--space-md)' }}>1. What Are Cookies</h2>
          <p>
            Cookies are small text files stored on your device when you visit a website. They help the site
            remember your preferences and understand how you interact with the content.
          </p>

          <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', margin: 'var(--space-xl) 0 var(--space-md)' }}>2. Cookies We Use</h2>

          <h3 style={{ color: 'var(--text-primary)', margin: 'var(--space-lg) 0 var(--space-sm)' }}>Essential Cookies</h3>
          <p>
            These cookies are required for the website to function properly. They enable basic features
            like page navigation and access to secure areas of the site.
          </p>
          <table style={{ width: '100%', borderCollapse: 'collapse', margin: 'var(--space-md) 0' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                <th style={{ padding: 'var(--space-sm)', color: 'var(--text-muted)' }}>Cookie</th>
                <th style={{ padding: 'var(--space-sm)', color: 'var(--text-muted)' }}>Purpose</th>
                <th style={{ padding: 'var(--space-sm)', color: 'var(--text-muted)' }}>Duration</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: 'var(--space-sm)' }}><code>admin_token</code></td>
                <td style={{ padding: 'var(--space-sm)' }}>Admin authentication session (stored in localStorage)</td>
                <td style={{ padding: 'var(--space-sm)' }}>Until logout</td>
              </tr>
            </tbody>
          </table>

          <h3 style={{ color: 'var(--text-primary)', margin: 'var(--space-lg) 0 var(--space-sm)' }}>Analytics Cookies</h3>
          <p>
            We may use analytics cookies to understand how visitors interact with our website.
            This helps us improve the user experience. All analytics data is anonymized.
          </p>

          <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', margin: 'var(--space-xl) 0 var(--space-md)' }}>3. Third-Party Cookies</h2>
          <p>
            Our website may include embedded content from third-party services (such as YouTube for video embeds
            or Google Fonts for typography). These services may set their own cookies. We do not control
            third-party cookies and recommend reviewing their respective privacy policies.
          </p>

          <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', margin: 'var(--space-xl) 0 var(--space-md)' }}>4. Managing Cookies</h2>
          <p>
            You can control and delete cookies through your browser settings. Please note that disabling
            certain cookies may affect the functionality of this website.
          </p>
          <p style={{ marginTop: 'var(--space-md)' }}>
            Most browsers allow you to:
          </p>
          <ul style={{ paddingLeft: 'var(--space-lg)', margin: 'var(--space-md) 0', listStyle: 'disc' }}>
            <li>View what cookies are stored and delete them individually</li>
            <li>Block third-party cookies</li>
            <li>Block cookies from specific sites</li>
            <li>Block all cookies from being set</li>
            <li>Delete all cookies when you close your browser</li>
          </ul>

          <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', margin: 'var(--space-xl) 0 var(--space-md)' }}>5. Contact</h2>
          <p>
            If you have questions about our use of cookies, please contact us at{' '}
            <a href={`mailto:${config.emails.privacy}`} style={{ color: 'var(--color-red)' }}>{config.emails.privacy}</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
