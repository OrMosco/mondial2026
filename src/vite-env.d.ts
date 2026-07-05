/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WC_LEAGUE_ID?: string;
  readonly VITE_WC_SEASON?: string;
  readonly VITE_POLL_MS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
