import './globals.css';
import { Inter } from 'next/font/google';
import Provider from '@/components/Provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'favoris.pro - Les meilleurs sites pour vos paris sportifs',
  description: 'Sélection des meilleurs sites de paris sportifs',
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <Provider>
          {children}
        </Provider>
      </body>
    </html>
  );
}