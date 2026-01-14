import { Amatic_SC, Patrick_Hand } from 'next/font/google';
import "./globals.css";

// Configurazione Amatic SC per i titoli
const amatic = Amatic_SC({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-amatic',
});

// Configurazione Patrick Hand per il corpo del testo
const patrick = Patrick_Hand({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-patrick',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className={`${amatic.variable} ${patrick.variable}`}>
      <body className="font-patrick antialiased">
        {children}
      </body>
    </html>
  );
}