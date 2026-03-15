/**
 * Site configuration accessor.
 * All components should import config from here.
 *
 * Usage:
 *   import { siteConfig } from '../../config';
 *   const name = siteConfig.band.name;
 */

import config from 'virtual:site-config';

export const siteConfig = config;
export default config;
