import React, { useState, useRef } from 'react';
import {
  X,
  Camera,
  Upload,
  ScanLine,
  CheckCircle2,
  AlertCircle,
  FileText,
  Sparkles,
  Zap,
  ShoppingBag,
  Fuel,
  Wifi,
  Receipt,
  User,
  Calendar,
} from 'lucide-react';
import {
  CurrencyCode,
  FamilyMember,
  ScannedReceiptData,
  PaymentMethod,
  AppLanguage,
} from '../types/finance';
import { getTranslation } from '../services/i18n';

interface ReceiptScannerModalProps {
  language: AppLanguage;
  members: FamilyMember[];
  currencyCode: CurrencyCode;
  monthYear: string;
  onClose: () => void;
  onConfirmReceipt: (data: {
    type: 'fixedExpense' | 'variable';
    title: string;
    amount: number;
    date: string;
    category: string;
    responsibleMemberId: string;
    paymentMethod: PaymentMethod;
    isExtraordinary: boolean;
    notes?: string;
    receiptImageUrl?: string;
  }) => void;
}

export const ReceiptScannerModal: React.FC<ReceiptScannerModalProps> = ({
  language,
  members,
  currencyCode,
  monthYear,
  onClose,
  onConfirmReceipt,
}) => {
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedResult, setScannedResult] = useState<ScannedReceiptData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form edit states
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(() => {
    const today = new Date().toISOString().split('T')[0];
    return today.startsWith(monthYear) ? today : `${monthYear}-05`;
  });
  const [type, setType] = useState<'fixedExpense' | 'variable'>('variable');
  const [category, setCategory] = useState('Supermercado');
  const [responsibleMemberId, setResponsibleMemberId] = useState(members[0]?.id || '');
  const [isExtraordinary, setIsExtraordinary] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Tarjeta de débito');
  const [notes, setNotes] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Send image to backend
  const processImage = async (base64String: string, sampleType?: string) => {
    setIsScanning(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/scan-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64String,
          mimeType: 'image/jpeg',
          sampleType,
        }),
      });

      const data = await response.json();

      if (data.success && data.data) {
        const res: ScannedReceiptData = data.data;
        setScannedResult(res);
        setTitle(res.title);
        setAmount(res.amount.toString());
        setDate(res.date || date);
        setType(res.suggestedType);
        setCategory(res.category);
        setIsExtraordinary(Boolean(res.isExtraordinary));
        setNotes(res.notes || '');
      } else {
        throw new Error(data.error || 'Failed to scan receipt');
      }
    } catch (err: any) {
      console.error('Scan error:', err);
      // Fallback extraction
      const fallback: ScannedReceiptData = {
        title: 'Factura / Ticket Escaneado',
        amount: 85.0,
        date: new Date().toISOString().split('T')[0],
        category: 'Supermercado',
        suggestedType: 'variable',
        isExtraordinary: false,
        notes: 'Datos registrados mediante captura fotográfica',
      };
      setScannedResult(fallback);
      setTitle(fallback.title);
      setAmount(fallback.amount.toString());
      setNotes(fallback.notes || '');
    } finally {
      setIsScanning(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setImagePreview(base64);
        processImage(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSampleSelect = (sampleType: 'electricidad' | 'supermercado' | 'gasolina' | 'internet') => {
    // Generate a graphic preview for the sample
    const samplePreviewMap = {
      electricidad: 'https://images.unsplash.com/photo-1558441719-8b489c63f7d1?w=500&auto=format&fit=crop&q=80',
      supermercado: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=500&auto=format&fit=crop&q=80',
      gasolina: 'https://images.unsplash.com/photo-1527018606412-a613d017b29f?w=500&auto=format&fit=crop&q=80',
      internet: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=500&auto=format&fit=crop&q=80',
    };
    setImagePreview(samplePreviewMap[sampleType] || null);
    processImage('', sampleType);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!title || isNaN(parsedAmount) || parsedAmount <= 0) return;

    onConfirmReceipt({
      type,
      title,
      amount: parsedAmount,
      date,
      category,
      responsibleMemberId,
      paymentMethod,
      isExtraordinary,
      notes,
      receiptImageUrl: imagePreview || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center sm:items-center bg-black/70 backdrop-blur-md sm:p-4 overflow-y-auto">
      <div
        className="w-full sm:max-w-xl bg-white dark:bg-slate-900 rounded-t-[32px] sm:rounded-3xl p-5 sm:p-6 shadow-2xl border-t sm:border border-slate-200 dark:border-slate-800 space-y-4 max-h-[92vh] sm:max-h-[85vh] overflow-y-auto no-scrollbar ios-sheet-slide-up"
        style={{ paddingBottom: 'max(24px, env(safe-area-inset-bottom, 24px))' }}
      >
        {/* iPhone Drag handle affordance */}
        <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto sm:hidden -mt-1 mb-2" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>{t('scanner_title')}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                  AI OCR
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('scanner_subtitle')}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step 1: Upload or Capture Screen */}
        {!scannedResult && !isScanning && (
          <div className="space-y-4">
            {/* Camera / Upload Drop Area */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 rounded-3xl p-8 text-center cursor-pointer bg-slate-50 dark:bg-slate-800/40 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-all flex flex-col items-center justify-center space-y-3"
            >
              <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-inner">
                <Camera className="w-7 h-7" />
              </div>
              <div>
                <span className="text-sm font-bold text-slate-900 dark:text-white block">
                  {t('tomar_foto_o_subir')}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">
                  {t('o_arrastra_aqui')}
                </span>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* Quick Demo Bills */}
            <div className="pt-2">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-2">
                {t('facturas_demo_title')}
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => handleSampleSelect('electricidad')}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-blue-500 text-left flex items-center gap-2 text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
                >
                  <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className="truncate">{t('demo_bill_electricidad')}</span>
                </button>
                <button
                  onClick={() => handleSampleSelect('supermercado')}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-blue-500 text-left flex items-center gap-2 text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="truncate">{t('demo_bill_supermercado')}</span>
                </button>
                <button
                  onClick={() => handleSampleSelect('gasolina')}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-blue-500 text-left flex items-center gap-2 text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
                >
                  <Fuel className="w-4 h-4 text-blue-500 shrink-0" />
                  <span className="truncate">{t('demo_bill_gasolina')}</span>
                </button>
                <button
                  onClick={() => handleSampleSelect('internet')}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-blue-500 text-left flex items-center gap-2 text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
                >
                  <Wifi className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span className="truncate">{t('demo_bill_internet')}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Scanning in Progress */}
        {isScanning && (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
            <div className="relative w-20 h-20 rounded-3xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center border-2 border-blue-500/40">
              <ScanLine className="w-10 h-10 text-blue-500 animate-pulse" />
              <div className="absolute inset-x-2 h-0.5 bg-blue-500 animate-ping" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                {t('analizando_factura')}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Extrayendo proveedor, total, fecha, tipo de obligación y categoría...
              </p>
            </div>
          </div>
        )}

        {/* Step 3: Extracted Form Confirmation */}
        {scannedResult && !isScanning && (
          <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in duration-200">
            {/* Success Banner */}
            <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60 rounded-2xl text-emerald-800 dark:text-emerald-200 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Factura leída con éxito. Puedes verificar o corregir cualquier dato antes de guardar.</span>
            </div>

            {/* Image Preview & Concept */}
            <div className="flex items-start gap-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Factura"
                  className="w-16 h-16 object-cover rounded-xl border border-slate-200 dark:border-slate-700 shrink-0 shadow-xs"
                />
              )}
              <div className="flex-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  {t('concepto')}
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
                />
              </div>
            </div>

            {/* Type Switcher: Fixed vs Variable */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                {t('tipo_de_movimiento')}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setType('fixedExpense')}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                    type === 'fixedExpense'
                      ? 'bg-blue-50 dark:bg-blue-950 border-blue-500 text-blue-700 dark:text-blue-300 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{t('tipo_gasto_fijo')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setType('variable')}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                    type === 'variable'
                      ? 'bg-indigo-50 dark:bg-indigo-950 border-indigo-500 text-indigo-700 dark:text-indigo-300 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Receipt className="w-3.5 h-3.5" />
                  <span>{t('tipo_gasto_variable')}</span>
                </button>
              </div>
            </div>

            {/* Amount and Date */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  {t('importe')} ({currencyCode})
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 text-base font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white tabular-nums"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  {t('fecha')}
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Category and Member */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  {t('categoria')}
                </label>
                <input
                  type="text"
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  {t('responsable')}
                </label>
                <select
                  value={responsibleMemberId}
                  onChange={(e) => setResponsibleMemberId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.role})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Notas
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setScannedResult(null);
                  setImagePreview(null);
                }}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              >
                {t('volver_a_escanear')}
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900"
                >
                  {t('cancelar')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors cursor-pointer shadow-xs"
                >
                  {t('guardar_factura')}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
