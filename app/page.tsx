'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  // Cek status login (hardcode sesuai alur sebelumnya)
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      router.push('/login');
    } else {
      setIsLoading(false);
    }
  }, [router]);

  // Fungsi Logout
  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 text-gray-400">
        Memuat data...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6 font-sans text-gray-800">
      <div className="mx-auto max-w-xl">
        
        {/* Header Bagian Atas */}
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Ringkasan</h1>
            <p className="text-sm text-gray-500">Pencatatan Keuangan Anda</p>
          </div>
          <div className="flex gap-3">
            <Link 
              href="/settings" 
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm transition hover:bg-gray-100"
              title="Pengaturan"
            >
              ⚙️
            </Link>
            <button 
              onClick={handleLogout}
              className="rounded-full bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100"
            >
              Keluar
            </button>
          </div>
        </header>

        {/* Kartu Saldo Utama */}
        <section className="mb-8 rounded-3xl bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Total Saldo</p>
          <h2 className="mt-2 text-4xl font-bold tracking-tight text-gray-900">Rp 0</h2>
          
          <div className="mt-6 flex gap-4 border-t border-gray-100 pt-6">
            <div className="flex-1">
              <p className="text-xs text-gray-500">Pemasukan</p>
              <p className="mt-1 font-semibold text-green-600">Rp 0</p>
            </div>
            <div className="h-10 w-px bg-gray-100"></div>
            <div className="flex-1">
              <p className="text-xs text-gray-500">Pengeluaran</p>
              <p className="mt-1 font-semibold text-red-600">Rp 0</p>
            </div>
          </div>
        </section>

        {/* Menu Navigasi Cepat */}
        <section className="mb-8 grid grid-cols-2 gap-4">
          <Link 
            href="/transaction" 
            className="flex flex-col items-center justify-center rounded-2xl bg-blue-600 p-4 text-white shadow-sm transition hover:bg-blue-700"
          >
            <span className="mb-2 text-2xl">📝</span>
            <span className="text-sm font-medium">Input Transaksi</span>
          </Link>
          <Link 
            href="/category" 
            className="flex flex-col items-center justify-center rounded-2xl bg-white p-4 text-gray-700 shadow-sm transition hover:bg-gray-50"
          >
            <span className="mb-2 text-2xl">📂</span>
            <span className="text-sm font-medium">Buat Kategori</span>
          </Link>
        </section>

        {/* Daftar Transaksi Terakhir (Placeholder) */}
        <section>
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Transaksi Terakhir</h3>
          <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
            <p className="text-sm text-gray-400">Belum ada data transaksi.</p>
          </div>
        </section>

      </div>
    </main>
  );
}