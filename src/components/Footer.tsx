import React from "react";

// Declare the global constant injected by Vite define
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const __APP_VERSION__: string;

export default function Footer() {
  const version = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '0.0.0';
  return (
    <footer className="mt-12 py-6 border-t border-slate-700 text-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-4 w-1.5 rounded-full" style={{ background: '#FFB300' }} />
          <span className="font-semibold">RocketMobster Software</span>
          <span className="opacity-70">v{version}</span>
        </div>
        <a
          href="https://github.com/RocketMobster/warpcorereports"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-slate-700 bg-slate-800 hover:bg-slate-700 transition-colors"
          title="Open GitHub repository"
          aria-label="Open GitHub repository"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 .5C5.648.5.5 5.648.5 12A11.5 11.5 0 0 0 8.35 23.3c.6.111.82-.261.82-.58 0-.287-.01-1.049-.016-2.06-3.338.726-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.757-1.333-1.757-1.09-.745.082-.73.082-.73 1.205.085 1.84 1.237 1.84 1.237 1.071 1.835 2.81 1.305 3.493.998.108-.776.42-1.305.763-1.606-2.665-.304-5.466-1.333-5.466-5.93 0-1.31.469-2.381 1.237-3.221-.124-.304-.536-1.527.117-3.183 0 0 1.008-.322 3.3 1.23a11.47 11.47 0 0 1 3.003-.403c1.019.005 2.046.138 3.003.403 2.29-1.552 3.297-1.23 3.297-1.23.654 1.656.242 2.879.118 3.183.77.84 1.236 1.911 1.236 3.221 0 4.61-2.804 5.624-5.476 5.922.432.372.816 1.103.816 2.222 0 1.604-.015 2.896-.015 3.289 0 .321.219.697.827.579A11.5 11.5 0 0 0 23.5 12C23.5 5.648 18.352.5 12 .5Z"/>
          </svg>
          <span>GitHub</span>
        </a>
      </div>
    </footer>
  );
}
