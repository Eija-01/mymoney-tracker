'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { supabase } from './lib/supabaseClient';

interface Category {
  id: string;
  name: string;
  type: 'pemasukan' | 'pengeluaran';
}

interface Transaction {
  id: string;
  type: 'pemasukan' | 'pengeluaran';
  category_id: string;
  amount: number;
  note: string;
  date: string;
}

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedMonth, setSelectedMonth] = useState('all');

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [theme, setTheme] = useState('light');
  const [font, setFont] = useState('sans');

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      // Ambil data kategori DAN transaksi dari Supabase secara paralel
      const [trxRes, catRes] = await Promise.all([
        supabase.from('transactions').select('*'),
        supabase.from('categories').select('*')
      ]);

      if (trxRes.data) setTransactions(trxRes.data as Transaction[]);
      if (catRes.data) setCategories(catRes.data as Category[]);

      // Ambil setting UI dari localStorage
      setTheme(localStorage.getItem('app-theme') || 'light');
      setFont(localStorage.getItem('app-font') || 'sans');

      setIsLoading(false);
    };

    fetchData();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    router.push('/login');
  };

  const handleDeleteTransaction = async (id: string) => {
    const confirmDelete = window.confirm('Apakah Anda yakin ingin menghapus transaksi ini?');
    if (!confirmDelete) return;

    // Hapus dari Supabase (Cloud)
    const { error } = await supabase.from('transactions').delete().eq('id', id);

    if (!error) {
      // Hapus dari tampilan aplikasi
      setTransactions(transactions.filter((trx) => trx.id !== id));
    } else {
      alert('Gagal menghapus data.');
    }
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
    // Cek di konsol untuk debugging (buka F12 di browser)
    console.log("Mencari ID:", id, "dalam kategori:", categories);

    const category = categories.find((c) => c.id === id);
    return category ? category.name : 'Kategori Tidak Ditemukan';
  };

  const availableMonths = useMemo(() => {
    const months = new Set(transactions.map((t) => t.date.substring(0, 7)));
    return Array.from(months).sort().reverse();
  }, [transactions]);

  const formatMonthLabel = (yyyyMm: string) => {
    if (yyyyMm === 'all') return 'Semua Waktu';
    const [year, month] = yyyyMm.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(date);
  };

  const displayedTransactions = useMemo(() => {
    if (selectedMonth === 'all') return transactions;
    return transactions.filter((t) => t.date.startsWith(selectedMonth));
  }, [transactions, selectedMonth]);

  const totalIncome = displayedTransactions
    .filter((t) => t.type === 'pemasukan')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = displayedTransactions
    .filter((t) => t.type === 'pengeluaran')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  const expenseData = displayedTransactions
    .filter((trx) => trx.type === 'pengeluaran')
    .reduce((acc: { name: string; value: number }[], trx) => {
      const categoryName = getCategoryName(trx.category_id); 
      
      const existing = acc.find((item) => item.name === categoryName);
      if (existing) {
        existing.value += trx.amount;
      } else {
        acc.push({ name: categoryName, value: trx.amount });
      }
      return acc;
    }, []);

  const COLORS = [
    '#3b82f6', // Biru
    '#10b981', // Hijau
    '#f59e0b', // Oranye
    '#ef4444', // Merah
    '#8b5cf6', // Ungu
    '#ec4899', // Pink
    '#6366f1', // Indigo
  ];
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
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Saldo</p>

            {availableMonths.length > 0 && (
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="cursor-pointer rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium outline-none transition hover:border-gray-300 focus:ring-1 focus:ring-blue-500 dark:border-[#333333] dark:bg-black dark:text-gray-200 dark:hover:border-[#444444]"
              >
                <option value="all">Semua Waktu</option>
                {availableMonths.map((month) => (
                  <option key={month} value={month}>
                    {formatMonthLabel(month)}
                  </option>
                ))}
              </select>
            )}
          </div>

          <h2 className="text-4xl font-bold tracking-tight">
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

        <section className="mb-8 rounded-3xl bg-white border border-gray-100 p-6 shadow-sm dark:bg-[#111111] dark:border-[#222222]">
          <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">Proporsi Pengeluaran</h3>
          {expenseData.length > 0 ? (
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {expenseData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  {/* Perbaikan tipe data di bawah ini menggunakan 'any' */}
                  <Tooltip
                    formatter={(value: any) => formatRupiah(Number(value) || 0)}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: theme === 'dark' ? '#222' : '#fff', color: theme === 'dark' ? '#fff' : '#000' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-48 items-center justify-center rounded-2xl bg-gray-50 dark:bg-black">
              <p className="text-sm text-gray-400">Belum ada data pengeluaran di periode ini.</p>
            </div>
          )}
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
            {displayedTransactions.length === 0 ? (
              <div className="rounded-2xl bg-gray-50 border border-gray-100 p-6 text-center shadow-sm dark:bg-[#111111] dark:border-[#222222]">
                <p className="text-sm text-gray-400 dark:text-gray-500">Belum ada data transaksi di periode ini.</p>
              </div>
            ) : (
              displayedTransactions.slice(0, 10).map((trx) => (
                <div key={trx.id} className="group flex items-center justify-between rounded-2xl bg-gray-50 border border-gray-100 p-4 shadow-sm transition-all hover:border-gray-200 dark:bg-[#111111] dark:border-[#222222] dark:hover:border-[#333333]">
                  <div>
                    <p className="font-medium text-gray-800 dark:text-gray-200">{getCategoryName(trx.category_id)}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{trx.date} {trx.note ? `• ${trx.note}` : ''}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`font-semibold ${trx.type === 'pemasukan' ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`}>
                      {trx.type === 'pemasukan' ? '+' : '-'}{formatRupiah(trx.amount)}
                    </span>
                    <button
                      onClick={() => handleDeleteTransaction(trx.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 opacity-0 transition-all hover:bg-red-50 hover:text-red-500 group-hover:opacity-100 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                      title="Hapus Transaksi"
                    >
                      ✕
                    </button>
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
                  {/* Perbaikan class Tailwind v4 di bawah ini */}
                  <label className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-50 p-3 transition has-checked:border-blue-500 has-checked:bg-blue-50 dark:border-[#333333] dark:bg-black dark:has-checked:border-blue-600 dark:has-checked:bg-blue-900/20">
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

                  {/* Perbaikan class Tailwind v4 di bawah ini */}
                  <label className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-50 p-3 transition has-checked:border-blue-500 has-checked:bg-blue-50 dark:border-[#333333] dark:bg-black dark:has-checked:border-blue-600 dark:has-checked:bg-blue-900/20">
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