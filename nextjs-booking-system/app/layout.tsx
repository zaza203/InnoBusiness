import './globals.css';
import type { ReactNode } from 'react';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="topbar">
          <div className="shell topbar-inner">
            <div>
              <p className="brand-overline">GIA Group inspired booking platform</p>
              <h1>ReserveHub</h1>
            </div>
            <nav>
              <a href="/">Home</a>
              <a href="/workspace">Workspace</a>
              <a href="/api-docs">Swagger</a>
            </nav>
          </div>
        </div>
        <main className="shell">{children}</main>
      </body>
    </html>
  );
}
