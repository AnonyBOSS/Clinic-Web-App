import Navbar from "./Navbar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <footer className="border-t bg-white">
        <div className="site-container py-4 text-xs text-slate-500">
          Clinics Booking · All rights reserved.
        </div>
      </footer>
    </div>
  );
}
