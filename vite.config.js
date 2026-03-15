import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync, readdirSync, existsSync } from 'fs';
import { resolve } from 'path';

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));

// Load site config (dynamic import not available in vite.config, use eval workaround)
const siteConfigPath = resolve('site.config.js');
let siteConfig;
try {
  // Read and evaluate the config file
  const configSource = readFileSync(siteConfigPath, 'utf-8');
  const match = configSource.match(/export\s+default\s+({[\s\S]*});?\s*$/);
  if (match) {
    siteConfig = new Function('return ' + match[1])();
  } else {
    throw new Error('Could not parse site.config.js');
  }
} catch (err) {
  console.error('Failed to load site.config.js:', err.message);
  process.exit(1);
}

// ── Color Utilities ──────────────────────────────────────────────

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16),
  };
}

function lighten(hex, amount) {
  const { r, g, b } = hexToRgb(hex);
  const lr = Math.min(255, Math.round(r + (255 - r) * amount));
  const lg = Math.min(255, Math.round(g + (255 - g) * amount));
  const lb = Math.min(255, Math.round(b + (255 - b) * amount));
  return `#${lr.toString(16).padStart(2, '0')}${lg.toString(16).padStart(2, '0')}${lb.toString(16).padStart(2, '0')}`;
}

function darken(hex, amount) {
  const { r, g, b } = hexToRgb(hex);
  const dr = Math.round(r * (1 - amount));
  const dg = Math.round(g * (1 - amount));
  const db = Math.round(b * (1 - amount));
  return `#${dr.toString(16).padStart(2, '0')}${dg.toString(16).padStart(2, '0')}${db.toString(16).padStart(2, '0')}`;
}

// ── Genre Template Presets ────────────────────────────────────────
const GENRE_PRESETS = {
  rock:       { bg: '#0a0a0a', bgSecondary: '#111111', bgCard: '#111111', text: '#e8e8e8', fontDisplay: "'Anton', sans-serif", fontBody: "'Barlow Condensed', sans-serif", fontImport: 'Anton|Barlow+Condensed:wght@400;600;700' },
  grunge:     { bg: '#1a1611', bgSecondary: '#221d16', bgCard: '#221d16', text: '#c4b89a', fontDisplay: "'Oswald', sans-serif", fontBody: "'Special Elite', monospace", fontImport: 'Oswald:wght@400;700|Special+Elite' },
  pop:        { bg: '#faf8ff', bgSecondary: '#ffffff', bgCard: '#ffffff', text: '#1a1a2e', fontDisplay: "'Outfit', sans-serif", fontBody: "'Outfit', sans-serif", fontImport: 'Outfit:wght@400;600;700;800', light: true },
  jazz:       { bg: '#0b1021', bgSecondary: '#111730', bgCard: '#111730', text: '#d4cfc4', fontDisplay: "'Cormorant Garamond', serif", fontBody: "'Josefin Sans', sans-serif", fontImport: 'Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400|Josefin+Sans:wght@300;400;600' },
  covers:     { bg: '#121218', bgSecondary: '#1a1a22', bgCard: '#1a1a22', text: '#e4e4ec', fontDisplay: "'Syne', sans-serif", fontBody: "'DM Sans', sans-serif", fontImport: 'Syne:wght@700;800|DM+Sans:wght@400;500;700' },
  country:    { bg: '#1c1712', bgSecondary: '#24201a', bgCard: '#24201a', text: '#d4c8b0', fontDisplay: "'Libre Baskerville', serif", fontBody: "'Cabin', sans-serif", fontImport: 'Libre+Baskerville:ital,wght@0,400;0,700;1,400|Cabin:wght@400;600;700' },
  metal:      { bg: '#050505', bgSecondary: '#0c0c0c', bgCard: '#0c0c0c', text: '#c8c8c8', fontDisplay: "'Cinzel', serif", fontBody: "'Rajdhani', sans-serif", fontImport: 'Cinzel:wght@700;900|Rajdhani:wght@400;600;700' },
  electronic: { bg: '#080810', bgSecondary: '#0e0e1a', bgCard: '#0e0e1a', text: '#d0d0e0', fontDisplay: "'Orbitron', sans-serif", fontBody: "'Space Mono', monospace", fontImport: 'Orbitron:wght@500;700;900|Space+Mono:wght@400;700' },
  funk:       { bg: '#1a0e08', bgSecondary: '#241610', bgCard: '#241610', text: '#f0dcc8', fontDisplay: "'Righteous', cursive", fontBody: "'Nunito', sans-serif", fontImport: 'Righteous|Nunito:wght@400;600;700;800' },
  reggae:     { bg: '#0f1a0a', bgSecondary: '#162210', bgCard: '#162210', text: '#d8e4c8', fontDisplay: "'Fredoka', sans-serif", fontBody: "'Lexend', sans-serif", fontImport: 'Fredoka:wght@400;500;600;700|Lexend:wght@300;400;600' },
  classical:  { bg: '#fdfcf9', bgSecondary: '#ffffff', bgCard: '#ffffff', text: '#1a1a1a', fontDisplay: "'EB Garamond', serif", fontBody: "'Lato', sans-serif", fontImport: 'EB+Garamond:ital,wght@0,400;0,600;0,700;1,400|Lato:wght@300;400', light: true },
};

function generateThemeCSS(config) {
  const primary = config.theme?.primaryAccent || '#ff2d78';
  const secondary = config.theme?.secondaryAccent || '#00c2ff';
  const { r, g, b } = hexToRgb(primary);
  const { r: sr, g: sg, b: sb } = hexToRgb(secondary);
  const template = config.template || config.theme?.template || 'covers';
  const preset = GENRE_PRESETS[template] || GENRE_PRESETS.covers;

  const fontLink = preset.fontImport
    ? `<link href="https://fonts.googleapis.com/css2?family=${preset.fontImport}&display=swap" rel="stylesheet">`
    : '';

  return `
    ${fontLink}
    <style>
      :root {
        --color-red: ${primary};
        --color-red-light: ${lighten(primary, 0.2)};
        --color-red-dark: ${darken(primary, 0.2)};
        --color-red-glow: rgba(${r}, ${g}, ${b}, 0.3);
        --color-amber: ${secondary};
        --color-amber-light: ${lighten(secondary, 0.2)};
        --color-amber-dark: ${darken(secondary, 0.2)};
        --color-amber-glow: rgba(${sr}, ${sg}, ${sb}, 0.3);
        /* Genre template overrides */
        --bg-primary: ${preset.bg};
        --bg-secondary: ${preset.bgSecondary};
        --bg-card: ${preset.bgCard};
        --bg-elevated: ${preset.bgSecondary};
        --bg-card-hover: ${lighten(preset.bgCard, 0.05)};
        --text-primary: ${preset.text};
        --text-secondary: ${preset.light ? 'rgba(26, 26, 26, 0.6)' : `rgba(${hexToRgb(preset.text).r}, ${hexToRgb(preset.text).g}, ${hexToRgb(preset.text).b}, 0.7)`};
        --text-muted: ${preset.light ? 'rgba(26, 26, 26, 0.4)' : `rgba(${hexToRgb(preset.text).r}, ${hexToRgb(preset.text).g}, ${hexToRgb(preset.text).b}, 0.5)`};
        --font-heading: ${preset.fontDisplay};
        --font-body: ${preset.fontBody};
      }
      body { background: var(--bg-primary); color: var(--text-primary); font-family: var(--font-body); }
      h1, h2, h3, .hero__title, .page-hero__title { font-family: var(--font-heading); }
    </style>`;
}

// ── Virtual Module: site-config ──────────────────────────────────

function siteConfigPlugin(config) {
  const virtualId = 'virtual:site-config';
  const resolvedId = '\0' + virtualId;

  return {
    name: 'site-config',
    resolveId(id) {
      if (id === virtualId) return resolvedId;
    },
    load(id) {
      if (id === resolvedId) {
        return `export default ${JSON.stringify(config)}`;
      }
    },
  };
}

// ── HTML Transform: inject meta tags + theme ─────────────────────

function htmlTransformPlugin(config) {
  return {
    name: 'html-transform',
    transformIndexHtml(html) {
      const heroPreload = config.images?.heroImages?.[0]
        ? `<link rel="preload" as="image" href="${config.images.heroImages[0]}" />`
        : '';
      const seoTitle = config.seo?.title || config.band?.name || 'Band Website';
      const seoDesc = config.seo?.description || config.band?.description || '';
      const ogImage = config.images?.ogImage || '';
      const domain = config.domain || '';
      const bandName = config.band?.name || config.bandName || 'Band';

      return html
        .replace('__SITE_TITLE__', seoTitle)
        .replace('__SITE_DESCRIPTION__', seoDesc)
        .replace('__SITE_OG_TITLE__', seoTitle)
        .replace('__SITE_OG_DESCRIPTION__', seoDesc)
        .replace('__SITE_OG_IMAGE__', ogImage)
        .replace('__SITE_OG_URL__', domain ? `https://${domain}` : '')
        .replace('__SITE_OG_SITE_NAME__', bandName)
        .replace('__SITE_TWITTER_TITLE__', seoTitle)
        .replace('__SITE_TWITTER_DESCRIPTION__', seoDesc)
        .replace('__SITE_TWITTER_IMAGE__', ogImage)
        .replace('<!-- HERO_PRELOAD -->', heroPreload)
        .replace('<!-- THEME_CSS -->', generateThemeCSS(config));
    },
  };
}

// ── Local Media Plugin ───────────────────────────────────────────

function localMediaPlugin() {
  const mediaDir = resolve('public/images/media');
  const virtualId = 'virtual:local-media';
  const resolvedId = '\0' + virtualId;

  function getImages() {
    if (!existsSync(mediaDir)) return [];
    return readdirSync(mediaDir)
      .filter(f => /\.(jpe?g|png|webp|gif|avif)$/i.test(f))
      .sort()
      .map(f => `/images/media/${f}`);
  }

  return {
    name: 'local-media',
    resolveId(id) {
      if (id === virtualId) return resolvedId;
    },
    load(id) {
      if (id === resolvedId) {
        return `export default ${JSON.stringify(getImages())}`;
      }
    },
    configureServer(server) {
      server.watcher.add(mediaDir);
      server.watcher.on('all', (event, filePath) => {
        if (filePath.replace(/\\/g, '/').includes('public/images/media')) {
          const mod = server.moduleGraph.getModuleById(resolvedId);
          if (mod) {
            server.moduleGraph.invalidateModule(mod);
            server.ws.send({ type: 'full-reload' });
          }
        }
      });
    },
  };
}

// ── Vite Config ──────────────────────────────────────────────────

export default defineConfig({
  plugins: [
    react(),
    siteConfigPlugin(siteConfig),
    htmlTransformPlugin(siteConfig),
    localMediaPlugin(),
  ],
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
});
