'use client';

import { useState, useEffect, useRef } from 'react';

interface FormattedInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export default function FormattedInput({
  value,
  onChange,
  placeholder = '0',
  className = '',
  disabled = false,
}: FormattedInputProps) {
  const [displayValue, setDisplayValue] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Format angka dengan pemisah ribuan (titik)
  const formatNumber = (num: string): string => {
    // Hapus semua karakter non-digit
    const cleanNum = num.replace(/\D/g, '');
    if (!cleanNum) return '';
    
    // Konversi ke number dan format dengan pemisah ribuan
    const number = parseInt(cleanNum, 10);
    return number.toLocaleString('id-ID');
  };

  // Update display value ketika value prop berubah
  useEffect(() => {
    if (value) {
      setDisplayValue(formatNumber(value));
    } else {
      setDisplayValue('');
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    // Hanya izinkan angka
    const numbersOnly = rawValue.replace(/\D/g, '');
    
    if (numbersOnly === '') {
      setDisplayValue('');
      onChange('');
      return;
    }

    // Format dengan pemisah ribuan
    const formatted = formatNumber(numbersOnly);
    setDisplayValue(formatted);
    
    // Kirim nilai murni (tanpa format) ke parent
    onChange(numbersOnly);
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  return (
    <input
      ref={inputRef}
      type="text"
      inputMode="numeric"
      value={displayValue}
      onChange={handleChange}
      onFocus={handleFocus}
      placeholder={placeholder}
      disabled={disabled}
      className={className}
    />
  );
}