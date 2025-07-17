import { SessionProvider } from 'next-auth/react';
import './globals.css'; // Adjust based on your CSS setup

export const metadata = {
  title: 'Next Ecommerce Shopco',
  description: 'An ecommerce platform built with Next.js',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}