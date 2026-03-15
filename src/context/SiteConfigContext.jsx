import { createContext, useContext } from 'react';
import config from '../config';

const SiteConfigContext = createContext(config);

export function SiteConfigProvider({ children }) {
  return (
    <SiteConfigContext.Provider value={config}>
      {children}
    </SiteConfigContext.Provider>
  );
}

export function useSiteConfig() {
  return useContext(SiteConfigContext);
}
