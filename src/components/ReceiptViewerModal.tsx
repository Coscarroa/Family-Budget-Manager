import React from 'react';
import { X, FileText, Download, Calendar, DollarSign, Tag, User, Receipt, ShieldCheck } from 'lucide-react';
import { CurrencyCode, AppLanguage } from '../types/finance';

interface ReceiptViewerModalProps {
  title: string;
  receiptImageUrl?: string;
  invoiceNumber?: string;
  taxId?: string;
  amount: number;
  date: string;
  category: string;
  currencyCode: CurrencyCode;
  notes?: string;
  language: AppLanguage;
  onClose: () => void;
}

export const ReceiptViewerModal: React.FC<ReceiptViewerModalProps> = ({
  title,
  receiptImageUrl,
  invoiceNumber,
  taxId,
  amount,
  date,
  category,
  currencyCode,
  notes,
  language,
  onClose,
}) => {
  const isPdf = receiptImageUrl?.startsWith('data:application/pdf') || receiptImageUrl?.toLowerCase().includes('.pdf');

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200"
    >
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
              <Receipt className="w-5 h-5 shrink-0" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                {title}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {invoiceNumber ? `Factura Nº: ${invoiceNumber}` : (language === 'en' ? 'Original Document' : 'Comprobante original')}
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

        {/* Document Visualizer */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          <div className="rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center min-h-[220px] max-h-[380px] border border-slate-800 relative">
            {receiptImageUrl ? (
              isPdf ? (
                <div className="p-8 text-center text-white space-y-3">
                  <div className="w-16 h-16 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center mx-auto border border-red-500/40">
                    <FileText className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold">{title}</h4>
                    <span className="text-xs text-slate-400 block mt-1">Documento PDF Adjunto</span>
                  </div>
                  <a
                    href={receiptImageUrl}
                    download={`Factura_${invoiceNumber || 'Documento'}.pdf`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{language === 'en' ? 'Download PDF' : 'Descargar PDF'}</span>
                  </a>
                </div>
              ) : (
                <img
                  src={receiptImageUrl}
                  alt={title}
                  className="max-h-[360px] w-auto object-contain rounded-lg shadow-inner"
                />
              )
            ) : (
              <div className="text-center p-8 text-slate-400 text-xs">
                {language === 'en' ? 'No document image attached' : 'No hay imagen adjunta'}
              </div>
            )}
          </div>

          {/* Details & Fiscal Metadata */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                {language === 'en' ? 'Amount' : 'Importe Total'}
              </span>
              <span className="text-sm font-extrabold text-blue-600 dark:text-blue-400">
                ${amount.toFixed(2)} {currencyCode}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                {language === 'en' ? 'Date' : 'Fecha'}
              </span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {date}
              </span>
            </div>

            {taxId && (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                  {language === 'en' ? 'Fiscal ID' : 'Nº Fiscal (NIF/RFC)'}
                </span>
                <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                  {taxId}
                </span>
              </div>
            )}

            {invoiceNumber && (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                  {language === 'en' ? 'Invoice Number' : 'Nº de Factura'}
                </span>
                <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                  {invoiceNumber}
                </span>
              </div>
            )}
          </div>

          {notes && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300">
              <span className="font-semibold block text-[10px] text-slate-400 uppercase mb-0.5">
                {language === 'en' ? 'Notes' : 'Observaciones'}
              </span>
              {notes}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs hover:opacity-90 transition-opacity"
          >
            {language === 'en' ? 'Close' : 'Cerrar'}
          </button>
        </div>
      </div>
    </div>
  );
};
