'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Category {
  id: string;
  name: string;
  type: 'pemasukan' | 'pengeluaran';
}

interface Transaction {
  id: string;
  type: 'pemasukan' | 'pengeluaran';
  categoryId: string;
  amount: number;
  note: string;
  date: string;
}

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [balance, setBalance] = useState(0);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [theme, setTheme] = useState('light');
  const [font, setFont] = useState('sans');

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }

    const savedTransactions = localStorage.getItem('transactions');
    const savedCategories = localStorage.getItem('categories');

    let parsedTransactions: Transaction[] = [];
    let parsedCategories: Category[] = [];

    if (savedTransactions) {
      parsedTransactions = JSON.parse(savedTransactions);
      setTransactions(parsedTransactions);
    }
    if (savedCategories) {
      parsedCategories = JSON.parse(savedCategories);
      setCategories(parsedCategories);
    }

    let income = 0;
    let expense = 0;

    parsedTransactions.forEach((trx) => {
      if (trx.type === 'pemasukan') {
        income += trx.amount;
      } else {
        expense += trx.amount;
      }
    });

    setTotalIncome(income);
    setTotalExpense(expense);
    setBalance(income - expense);

    const savedTheme = localStorage.getItem('app-theme') || 'light';
    const savedFont = localStorage.getItem('app-font') || 'sans';
    setTheme(savedTheme);
    setFont(savedFont);

    setIsLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    router.push('/login');
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('app-theme', theme);
    localStorage.setItem('app-font', font);

    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    document.documentElement.className = `font-${font} ${theme === 'dark' ? 'dark' : ''}`;
    setIsSettingsOpen(false);
  };

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(angka);
  };

  const getCategoryName = (id: string) => {
    const category = categories.find((c) => c.id === id);
    return category ? category.name : 'Kategori Terhapus';
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Memuat data...
      </div>
    );
  }

  return (
    <main className="min-h-screen p-6 font-sans">
      <div className="mx-auto max-w-xl">
        
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Ringkasan</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Pencatatan Keuangan Anda</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 border border-gray-200 shadow-sm transition hover:bg-gray-100 dark:bg-[#111111] dark:border-[#222222] dark:hover:bg-[#1a1a1a]"
              title="Pengaturan"
            >
              ⚙️
            </button>
            <button 
              onClick={handleLogout}
              className="rounded-full bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100 dark:bg-[#111111] dark:border dark:border-[#222222] dark:text-red-500 dark:hover:bg-[#1a1a1a]"
            >
              Keluar
            </button>
          </div>
        </header>

        <section className="mb-8 rounded-3xl bg-gray-50 border border-gray-100 p-6 shadow-sm dark:bg-[#111111] dark:border-[#222222]">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Saldo</p>
          <h2 className="mt-2 text-4xl font-bold tracking-tight">
            {formatRupiah(balance)}
          </h2>
          
          <div className="mt-6 flex gap-4 border-t border-gray-200 pt-6 dark:border-[#222222]">
            <div className="flex-1">
              <p className="text-xs text-gray-500 dark:text-gray-400">Pemasukan</p>
              <p className="mt-1 font-semibold text-green-600 dark:text-green-500">{formatRupiah(totalIncome)}</p>
            </div>
            <div className="h-10 w-px bg-gray-200 dark:bg-[#222222]"></div>
            <div className="flex-1">
              <p className="text-xs text-gray-500 dark:text-gray-400">Pengeluaran</p>
              <p className="mt-1 font-semibold text-red-600 dark:text-red-500">{formatRupiah(totalExpense)}</p>
            </div>
          </div>
        </section>

        <section className="mb-8 grid grid-cols-2 gap-4">
          <Link 
            href="/transaction" 
            className="flex flex-col items-center justify-center rounded-2xl bg-blue-600 p-4 text-white shadow-sm transition hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
          >
            <span className="mb-2 text-2xl">📝</span>
            <span className="text-sm font-medium">Input Transaksi</span>
          </Link>
          <Link 
            href="/category" 
            className="flex flex-col items-center justify-center rounded-2xl bg-gray-50 border border-gray-100 p-4 text-gray-700 shadow-sm transition hover:bg-gray-100 dark:bg-[#111111] dark:border-[#222222] dark:text-gray-300 dark:hover:bg-[#1a1a1a]"
          >
            <span className="mb-2 text-2xl">📂</span>
            <span className="text-sm font-medium">Buat Kategori</span>
          </Link>
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Transaksi Terakhir</h3>
          </div>
          
          <div className="flex flex-col gap-3">
            {transactions.length === 0 ? (
              <div className="rounded-2xl bg-gray-50 border border-gray-100 p-6 text-center shadow-sm dark:bg-[#111111] dark:border-[#222222]">
                <p className="text-sm text-gray-400 dark:text-gray-500">Belum ada data transaksi.</p>
              </div>
            ) : (
              transactions.slice(0, 5).map((trx) => (
                <div key={trx.id} className="flex items-center justify-between rounded-2xl bg-gray-50 border border-gray-100 p-4 shadow-sm dark:bg-[#111111] dark:border-[#222222]">
                  <div>
                    <p className="font-medium text-gray-800 dark:text-gray-200">{getCategoryName(trx.categoryId)}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{trx.date} {trx.note ? `• ${trx.note}` : ''}</p>
                  </div>
                  <div className={`font-semibold ${trx.type === 'pemasukan' ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`}>
                    {trx.type === 'pemasukan' ? '+' : '-'}{formatRupiah(trx.amount)}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

      </div>

      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl dark:bg-[#111111] dark:border dark:border-[#222222]">
            
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Pengaturan</h2>
              <button 
                onClick={() => setIsSettingsOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-[#222222] dark:text-gray-400 dark:hover:bg-[#333333]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSettings} className="flex flex-col gap-6">
              <div>
                <label className="mb-3 block text-sm font-medium text-gray-700 dark:text-gray-300">Tema Aplikasi</label>
                <div className="flex gap-4">
                  <label className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-50 p-3 transition has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50 dark:border-[#333333] dark:bg-black dark:has-[:checked]:border-blue-600 dark:has-[:checked]:bg-blue-900/20">
                    <input
                      type="radio"
                      name="theme"
                      value="light"
                      checked={theme === 'light'}
                      onChange={() => setTheme('light')}
                      className="hidden"
                    />
                    <span className={`text-sm font-medium ${theme === 'light' ? 'text-blue-700 dark:text-blue-500' : 'text-gray-500 dark:text-gray-400'}`}>
                      Terang
                    </span>
                  </label>

                  <label className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-50 p-3 transition has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50 dark:border-[#333333] dark:bg-black dark:has-[:checked]:border-blue-600 dark:has-[:checked]:bg-blue-900/20">
                    <input
                      type="radio"
                      name="theme"
                      value="dark"
                      checked={theme === 'dark'}
                      onChange={() => setTheme('dark')}
                      className="hidden"
                    />
                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-blue-700 dark:text-blue-500' : 'text-gray-500 dark:text-gray-400'}`}>
                      Gelap
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label className="mb-3 block text-sm font-medium text-gray-700 dark:text-gray-300">Gaya Font</label>
                <select
                  value={font}
                  onChange={(e) => setFont(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-[#333333] dark:bg-black dark:text-gray-100"
                >
                  <option value="sans">Modern (Sans-serif)</option>
                  <option value="serif">Klasik (Serif)</option>
                  <option value="mono">Mesin Ketik (Monospace)</option>
                </select>
              </div>

              <button
                type="submit"
                className="mt-4 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-blue-700 active:scale-[0.98]"
              >
                Simpan Pengaturan
              </button>
            </form>
          </div>
        </div>
      )}

    </main>
  );
}