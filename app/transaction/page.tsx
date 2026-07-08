'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabaseClient';

// Mendefinisikan tipe data
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

export default function TransactionPage() {
    const router = useRouter();
    const [categories, setCategories] = useState<Category[]>([]);

    // State untuk form
    const [type, setType] = useState<'pemasukan' | 'pengeluaran'>('pemasukan');
    const [categoryId, setCategoryId] = useState('');
    const [amount, setAmount] = useState('');
    const [note, setNote] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    // Mengambil kategori saat halaman dimuat
    useEffect(() => {
        const fetchCategories = async () => {
            const { data, error } = await supabase
                .from('categories')
                .select('*');

            if (data) {
                setCategories(data as Category[]);
            }
            if (error) {
                console.error('Gagal ambil kategori:', error);
            }
        };

        fetchCategories();
    }, []);

    // Otomatis memilih kategori pertama yang tersedia saat tipe (pemasukan/pengeluaran) diubah
    useEffect(() => {
        const filtered = categories.filter(c => c.type === type);
        if (filtered.length > 0) {
            setCategoryId(filtered[0].id);
        } else {
            setCategoryId('');
        }
    }, [type, categories]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Masukkan ke Supabase
        const { error } = await supabase
            .from('transactions')
            .insert([
                {
                    type,
                    category_id: categoryId, // <--- PASTIKAN ini sesuai dengan nama kolom di Supabase
                    amount: parseFloat(amount),
                    note,
                    date,
                },
            ]);

        if (error) {
            alert('Gagal menyimpan: ' + error.message);
        } else {
            router.push('/'); // Kembali ke dashboard
        }

        const newTransaction: Transaction = {
            id: Date.now().toString(),
            type,
            categoryId,
            amount: parseFloat(amount),
            note,
            date,
        };

        // Mengambil transaksi lama, menambah yang baru, lalu simpan kembali
        const savedTransactions = localStorage.getItem('transactions');
        const existingTransactions = savedTransactions ? JSON.parse(savedTransactions) : [];
        const updatedTransactions = [newTransaction, ...existingTransactions]; // Data baru di atas

        localStorage.setItem('transactions', JSON.stringify(updatedTransactions));

        // Kembali ke dashboard setelah berhasil menyimpan
        router.push('/');
    };

    // Memfilter kategori untuk dropdown sesuai tipe yang dipilih
    const filteredCategories = categories.filter(c => c.type === type);

    return (
        <main className="min-h-screen bg-gray-50 p-6 font-sans text-gray-800">
            <div className="mx-auto max-w-xl">

                <header className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Input Transaksi</h1>
                        <p className="text-sm text-gray-500">Catat arus kas Anda</p>
                    </div>
                    <Link
                        href="/"
                        className="flex items-center justify-center rounded-full bg-white px-4 py-2 text-sm font-medium text-gray-600 shadow-sm transition hover:bg-gray-100"
                    >
                        ← Kembali
                    </Link>
                </header>

                <section className="rounded-3xl bg-white p-6 shadow-sm">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">

                        {/* Pilihan Jenis Transaksi */}
                        <div className="flex gap-4">
                            <label className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-50 p-3 transition has-:checked:border-green-500 has-:checked:bg-green-50">
                                <input
                                    type="radio"
                                    name="type"
                                    value="pemasukan"
                                    checked={type === 'pemasukan'}
                                    onChange={() => setType('pemasukan')}
                                    className="hidden"
                                />
                                <span className={`text-sm font-medium ${type === 'pemasukan' ? 'text-green-700' : 'text-gray-500'}`}>
                                    Pemasukan
                                </span>
                            </label>

                            <label className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-50 p-3 transition has-checked:border-red-500 has-checked:bg-red-50">
                                <input
                                    type="radio"
                                    name="type"
                                    value="pengeluaran"
                                    checked={type === 'pengeluaran'}
                                    onChange={() => setType('pengeluaran')}
                                    className="hidden"
                                />
                                <span className={`text-sm font-medium ${type === 'pengeluaran' ? 'text-red-700' : 'text-gray-500'}`}>
                                    Pengeluaran
                                </span>
                            </label>
                        </div>

                        {/* Nominal */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">Nominal (Rp)</label>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-lg font-semibold outline-none transition focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500"
                                placeholder="0"
                                min="1"
                                required
                            />
                        </div>

                        {/* Kategori */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">Kategori</label>
                            {filteredCategories.length === 0 ? (
                                <p className="text-sm text-red-500">Belum ada kategori untuk tipe ini. Silakan buat kategori dulu.</p>
                            ) : (
                                <select
                                    value={categoryId}
                                    onChange={(e) => setCategoryId(e.target.value)}
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500"
                                    required
                                >
                                    <option value="" disabled>Pilih Kategori...</option>
                                    {filteredCategories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            )}
                        </div>

                        {/* Tanggal */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">Tanggal</label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500"
                                required
                            />
                        </div>

                        {/* Catatan (Opsional) */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">Catatan Tambahan</label>
                            <input
                                type="text"
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500"
                                placeholder="Opsional..."
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={filteredCategories.length === 0}
                            className="mt-4 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-blue-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-gray-300"
                        >
                            Simpan Transaksi
                        </button>
                    </form>
                </section>

            </div>
        </main>
    );
}