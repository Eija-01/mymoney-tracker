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

  const [theme, setTheme] = useState('light');

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

      // Ambil setting theme dari localStorage
      const savedTheme = localStorage.getItem('app-theme') || 'light';
      setTheme(savedTheme);
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }

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

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('app-theme', newTheme);
    
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
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

  // Data untuk grafik pie perbandingan pemasukan vs pengeluaran
  const incomeExpenseData = useMemo(() => {
    const data = [];
    
    if (totalIncome > 0) {
      data.push({
        name: 'Pemasukan',
        value: totalIncome,
        type: 'income'
      });
    }
    
    if (totalExpense > 0) {
      data.push({
        name: 'Pengeluaran',
        value: totalExpense,
        type: 'expense'
      });
    }
    
    return data;
  }, [totalIncome, totalExpense]);

  const COLORS = {
    income: '#10b981', // Hijau untuk pemasukan
    expense: '#ef4444', // Merah untuk pengeluaran
  };

  // Custom label untuk pie chart dengan pengecekan undefined
  const renderCustomLabel = ({ name, percent }: { name?: string; percent?: number }) => {
    if (!name || !percent) return '';
    // Tampilkan hanya persentase tanpa nama untuk menghindari teks berimpitan
    return `${(percent * 100).toFixed(1)}%`;
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Memuat data...
      </div>
    );
  }

  return (
    <>
      {/* CSS untuk menghilangkan outline pada semua elemen interaktif */}
      <style jsx global>{`
        *:focus {
          outline: none !important;
        }
        *:focus-visible {
          outline: none !important;
        }
        button:focus {
          outline: none !important;
        }
        button:focus-visible {
          outline: none !important;
        }
        a:focus {
          outline: none !important;
        }
        a:focus-visible {
          outline: none !important;
        }
        select:focus {
          outline: none !important;
        }
        select:focus-visible {
          outline: none !important;
        }
        /* Untuk recharts */
        .recharts-wrapper:focus {
          outline: none !important;
        }
        .recharts-tooltip-wrapper:focus {
          outline: none !important;
        }
      `}</style>
      
      <main className="min-h-screen p-6 font-sans">
        <div className="mx-auto max-w-xl">

          <header className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Ringkasan</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Pencatatan Keuangan Anda</p>
            </div>
            <div className="flex gap-3">
              {/* Tombol Toggle Tema Gelap/Terang */}
              <button
                onClick={toggleTheme}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 border border-gray-200 shadow-sm transition hover:bg-gray-100 dark:bg-[#111111] dark:border-[#222222] dark:hover:bg-[#1a1a1a] focus:outline-none focus:ring-0"
                title={theme === 'light' ? 'Mode Gelap' : 'Mode Terang'}
              >
                {theme === 'light' ? (
                  <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                )}
              </button>
              <button
                onClick={handleLogout}
                className="rounded-full bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100 dark:bg-[#111111] dark:border dark:border-[#222222] dark:text-red-500 dark:hover:bg-[#1a1a1a] focus:outline-none focus:ring-0"
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
                  className="cursor-pointer rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium outline-none transition hover:border-gray-300 focus:ring-1 focus:ring-blue-500 dark:border-[#333333] dark:bg-black dark:text-gray-200 dark:hover:border-[#444444] focus:outline-none"
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
            <h3 className="text-center mb-4 text-sm font-semibold text-gray-900 dark:text-white">Perbandingan Pemasukan vs Pengeluaran</h3>
            {incomeExpenseData.length > 0 ? (
              <>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={incomeExpenseData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                        label={renderCustomLabel}
                        labelLine={false}
                      >
                        {incomeExpenseData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.type === 'income' ? COLORS.income : COLORS.expense}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: any) => formatRupiah(Number(value) || 0)}
                        contentStyle={{ 
                          borderRadius: '12px', 
                          border: 'none', 
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', 
                          backgroundColor: theme === 'dark' ? '#1f2937' : '#fff', 
                          color: theme === 'dark' ? '#fff' : '#000' 
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* Legend untuk menggantikan label yang dihapus */}
                <div className="flex justify-center gap-8 mt-2">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-green-500"></span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">Pemasukan</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500"></span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">Pengeluaran</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex h-48 items-center justify-center rounded-2xl bg-gray-50 dark:bg-black">
                <p className="text-sm text-gray-400">Belum ada data transaksi di periode ini.</p>
              </div>
            )}
          </section>

          <section className="mb-8 grid grid-cols-2 gap-4">
            <Link
              href="/transaction"
              className="flex flex-row items-center justify-center rounded-2xl bg-blue-600 p-4 text-white shadow-sm transition hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 focus:outline-none focus:ring-0"
            >
              <span className="mb-2 text-2xl">📝</span>
              <span className="text-sm font-medium">Input Transaksi</span>
            </Link>
            <Link
              href="/category"
              className="flex flex-row items-center justify-center rounded-2xl bg-gray-50 border border-gray-100 p-4 text-gray-700 shadow-sm transition hover:bg-gray-100 dark:bg-[#111111] dark:border-[#222222] dark:text-gray-300 dark:hover:bg-[#1a1a1a] focus:outline-none focus:ring-0"
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
                        className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 opacity-0 transition-all hover:bg-red-50 hover:text-red-500 group-hover:opacity-100 dark:hover:bg-red-950/30 dark:hover:text-red-400 focus:outline-none focus:ring-0"
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
      </main>
    </>
  );
}