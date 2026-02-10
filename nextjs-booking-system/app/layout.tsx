import './globals.css';
import type { ReactNode } from 'react';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="header">
          <div className="container" style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <h2>GIA Booking Platform</h2>
            <a href="/api-docs" style={{color:'white'}}>Swagger</a>
          </div>
        </header>
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
