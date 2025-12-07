import type { Metadata } from 'next';
import './globals.css';
import Layout from '../components/Layout';

export const metadata: Metadata = {
  title: 'Clinics Booking System',
  description: 'Book appointments with doctors at your favorite clinics',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}
