import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import Providers from '@/app/providers';
import Navbar from '@/components/Navbar';
import CartDrawer from '@/components/CartDrawer';
import Footer from '@/components/Footer';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter'
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair'
});

export const metadata: Metadata = {
  title: 'Brew-tiful Coffee | Artisanal Coffee Experience',
  description: 'Premium coffee experiences crafted to perfection. Order online for delivery, pickup, or dine-in.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body>
        <Providers>
          <Navbar />
          {children}
          <Footer />
          <CartDrawer />
        </Providers>
      </body>
    </html>
  );
}
