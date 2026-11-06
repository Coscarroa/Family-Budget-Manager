import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Camera,
  Upload,
  RotateCw,
  ZoomIn,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  FileText,
  Sparkles,
  Zap,
  ShoppingBag,
  Fuel,
  Wifi,
  Receipt,
  Calendar,
  Check,
  RefreshCw,
  Eye,
  ArrowRight,
  ShieldCheck,
  Smartphone,
  Sliders,
} from 'lucide-react';
import {
  CurrencyCode,
  FamilyMember,
  ScannedReceiptData,
  PaymentMethod,
  AppLanguage,
  FixedExpense,
  VariableExpense,
} from '../types/finance';
import { getTranslation } from '../services/i18n';

interface ReceiptScannerModalProps {
  language: AppLanguage;
  members: FamilyMember[];
  currencyCode: CurrencyCode;
  monthYear: string;
  fixedExpenses?: FixedExpense[];
  variableExpenses?: VariableExpense[];
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
    taxId?: string;
    invoiceNumber?: string;
    dueDate?: string;
    subtotal?: number;
    tax?: number;
    currency?: string;
  }) => void;
  onViewExpense?: (type: 'fixedExpense' | 'variable') => void;
}

type ScannerStep = 'choose' | 'camera' | 'review' | 'scanning' | 'form' | 'saved';

export const ReceiptScannerModal: React.FC<ReceiptScannerModalProps> = ({
  language,
  members,
  currencyCode,
  monthYear,
  fixedExpenses = [],
  variableExpenses = [],
  onClose,
  onConfirmReceipt,
  onViewExpense,
}) => {
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);

  // Flow State
  const [step, setStep] = useState<ScannerStep>('choose');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [isPdf, setIsPdf] = useState(false);
  const [rotation, setRotation] = useState<number>(0);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [highContrast, setHighContrast] = useState<boolean>(false);

  // Errors & Warnings
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [flaggedFields, setFlaggedFields] = useState<string[]>([]);
  const [isDuplicateAcknowledged, setIsDuplicateAcknowledged] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [taxId, setTaxId] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [date, setDate] = useState(() => {
    const today = new Date().toISOString().split('T')[0];
    return today.startsWith(monthYear) ? today : `${monthYear}-05`;
  });
  const [dueDate, setDueDate] = useState('');
  const [receiptCurrency, setReceiptCurrency] = useState(currencyCode);
  const [subtotal, setSubtotal] = useState('');
  const [tax, setTax] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'fixedExpense' | 'variable'>('variable');
  const [category, setCategory] = useState('Supermercado');
  const [responsibleMemberId, setResponsibleMemberId] = useState(members[0]?.id || '');
  const [isExtraordinary, setIsExtraordinary] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Tarjeta de débito');
  const [notes, setNotes] = useState('');

  // Saved confirmation summary
  const [savedData, setSavedData] = useState<{
    title: string;
    amount: number;
    type: 'fixedExpense' | 'variable';
    invoiceNumber?: string;
  } | null>(null);

  // Refs for media & inputs
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mobileCameraInputRef = useRef<HTMLInputElement>(null);

  // Cleanup active camera on unmount or step switch
  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

  const stopCameraStream = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
  };

  // --- Step 1: Camera activation ---
  const handleStartCamera = async () => {
    setCameraError(null);
    setUploadError(null);
    setStep('camera');

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('La cámara no está disponible en este navegador o entorno.');
      }

      // Request rear camera by default on phones
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch((e) => console.warn('Video play error:', e));
      }
    } catch (err: any) {
      console.warn('Camera access denied or failed:', err);
      let msg = 'No se pudo acceder a la cámara.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        msg = 'Permiso denegado. Para tomar la foto, permite el acceso a la cámara en los ajustes de tu navegador o utiliza "Subir archivo".';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        msg = 'No se encontró ninguna cámara disponible en tu dispositivo.';
      }
      setCameraError(msg);
    }
  };

  // Snap photo from live video feed
  const handleCapturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      stopCameraStream();
      setImagePreview(dataUrl);
      setFileName(`Captura_Factura_${new Date().toISOString().slice(0, 10)}.jpg`);
      setIsPdf(false);
      setRotation(0);
      setStep('review');
    }
  };

  // --- Step 2: File Upload with strict validation ---
  const handleFileSelect = (file: File) => {
    setUploadError(null);
    setCameraError(null);

    // 1. Validate MIME type & extension
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    const allowedExts = ['.jpg', '.jpeg', '.png', '.webp', '.pdf'];
    const fileNameLower = file.name.toLowerCase();
    const hasValidExt = allowedExts.some((ext) => fileNameLower.endsWith(ext));

    if (!allowedMimeTypes.includes(file.type) && !hasValidExt) {
      setUploadError(
        language === 'en'
          ? 'Unsupported file format. Please choose a PDF, JPG, or PNG file.'
          : 'Formato no admitido. Selecciona un archivo PDF, JPG o PNG.'
      );
      return;
    }

    // 2. Validate max file size (10 MB)
    const MAX_SIZE_BYTES = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE_BYTES) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      setUploadError(
        language === 'en'
          ? `File exceeds the maximum 10 MB limit (current size: ${sizeMB} MB).`
          : `El archivo supera el tamaño máximo permitido de 10 MB (tamaño actual: ${sizeMB} MB).`
      );
      return;
    }

    const isFilePdf = file.type === 'application/pdf' || fileNameLower.endsWith('.pdf');
    setIsPdf(isFilePdf);
    setFileName(file.name);
    setRotation(0);

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImagePreview(result);
      setStep('review');
    };
    reader.onerror = () => {
      setUploadError(
        language === 'en' ? 'Could not read the file. Please try again.' : 'No se pudo leer el archivo. Inténtalo de nuevo.'
      );
    };

    reader.readAsDataURL(file);
  };

  // Helper: Produce rotated base64 image if rotated
  const getProcessedBase64 = async (srcUrl: string, rot: number): Promise<string> => {
    if (isPdf || rot === 0) return srcUrl;

    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(srcUrl);
          return;
        }

        if (rot === 90 || rot === 270) {
          canvas.width = img.height;
          canvas.height = img.width;
        } else {
          canvas.width = img.width;
          canvas.height = img.height;
        }

        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((rot * Math.PI) / 180);
        ctx.drawImage(img, -img.width / 2, -img.height / 2);
        resolve(canvas.toDataURL('image/jpeg', 0.92));
      };
      img.onerror = () => resolve(srcUrl);
      img.src = srcUrl;
    });
  };

  // --- Step 3: AI Processing ---
  const handleProcessImage = async (sampleType?: string) => {
    setStep('scanning');
    setScanError(null);

    try {
      let payloadBase64 = imagePreview || '';
      if (payloadBase64 && !sampleType) {
        payloadBase64 = await getProcessedBase64(payloadBase64, rotation);
      }

      const response = await fetch('/api/scan-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: payloadBase64,
          mimeType: isPdf ? 'application/pdf' : 'image/jpeg',
          sampleType,
        }),
      });

      const res = await response.json();

      if (res.success && res.data) {
        const data: ScannedReceiptData = res.data;
        populateFormFromData(data);
        setStep('form');
      } else {
        throw new Error(res.error || 'No se pudieron extraer los datos.');
      }
    } catch (err: any) {
      console.error('Scan processing error:', err);
      setScanError(
        err.message || 'Error al comunicarse con el servicio de OCR. Puedes reintentar o completar los campos manualmente.'
      );
      // Resilience rule: Keep imagePreview intact, switch to form with available defaults so user work isn't lost
      const fallback: ScannedReceiptData = {
        title: fileName.replace(/\.[^/.]+$/, '') || 'Factura / Comprobante',
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        category: 'Supermercado',
        suggestedType: 'variable',
        flaggedFields: ['amount', 'title', 'invoiceNumber', 'taxId'],
        notes: 'Comprobante escaneado pendiente de revisión manual',
      };
      populateFormFromData(fallback);
      setStep('form');
    }
  };

  const populateFormFromData = (data: ScannedReceiptData) => {
    setTitle(data.title || '');
    setTaxId(data.taxId || '');
    setInvoiceNumber(data.invoiceNumber || '');
    setDate(data.date || new Date().toISOString().split('T')[0]);
    setDueDate(data.dueDate || '');
    if (data.currency) setReceiptCurrency(data.currency as CurrencyCode);
    setSubtotal(data.subtotal !== undefined ? data.subtotal.toString() : '');
    setTax(data.tax !== undefined ? data.tax.toString() : '');
    setAmount(data.amount ? data.amount.toString() : '');
    setType(data.suggestedType || 'variable');
    setCategory(data.category || 'Otros');
    setIsExtraordinary(Boolean(data.isExtraordinary));
    setNotes(data.notes || '');
    setFlaggedFields(data.flaggedFields || []);
  };

  // Quick Demo Invoice selection
  const handleSelectSample = (sampleType: 'electricidad' | 'supermercado' | 'gasolina' | 'internet') => {
    const samplePreviewMap = {
      electricidad: 'https://images.unsplash.com/photo-1558441719-8b489c63f7d1?w=600&auto=format&fit=crop&q=80',
      supermercado: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=600&auto=format&fit=crop&q=80',
      gasolina: 'https://images.unsplash.com/photo-1527018606412-a613d017b29f?w=600&auto=format&fit=crop&q=80',
      internet: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&auto=format&fit=crop&q=80',
    };
    setImagePreview(samplePreviewMap[sampleType] || null);
    setFileName(`Factura_Demo_${sampleType.toUpperCase()}.jpg`);
    setIsPdf(false);
    setRotation(0);
    handleProcessImage(sampleType);
  };

  // --- Duplicate Detection Logic ---
  const findDuplicateExpense = () => {
    const parsedAmount = parseFloat(amount);
    const cleanInvoiceNum = invoiceNumber.trim().toLowerCase();
    const cleanTitle = title.trim().toLowerCase();

    // 1. Check fixed expenses
    for (const exp of fixedExpenses) {
      if (cleanInvoiceNum && exp.invoiceNumber?.toLowerCase() === cleanInvoiceNum) {
        return { name: exp.name, amount: exp.expectedAmount, type: 'Gasto Fijo' };
      }
      if (
        !isNaN(parsedAmount) &&
        parsedAmount > 0 &&
        Math.abs(exp.expectedAmount - parsedAmount) < 0.05 &&
        cleanTitle &&
        (exp.name.toLowerCase().includes(cleanTitle) || cleanTitle.includes(exp.name.toLowerCase()))
      ) {
        return { name: exp.name, amount: exp.expectedAmount, type: 'Gasto Fijo' };
      }
    }

    // 2. Check variable expenses
    for (const exp of variableExpenses) {
      if (cleanInvoiceNum && exp.invoiceNumber?.toLowerCase() === cleanInvoiceNum) {
        return { name: exp.description, amount: exp.amount, type: 'Gasto Variable' };
      }
      if (
        !isNaN(parsedAmount) &&
        parsedAmount > 0 &&
        Math.abs(exp.amount - parsedAmount) < 0.05 &&
        cleanTitle &&
        (exp.description.toLowerCase().includes(cleanTitle) || cleanTitle.includes(exp.description.toLowerCase()))
      ) {
        return { name: exp.description, amount: exp.amount, type: 'Gasto Variable' };
      }
    }

    return null;
  };

  const duplicateExpense = findDuplicateExpense();

  // --- Mathematical Consistency Check ---
  const parsedSubtotal = parseFloat(subtotal);
  const parsedTax = parseFloat(tax);
  const parsedAmount = parseFloat(amount);
  const hasSubtotalAndTax = !isNaN(parsedSubtotal) && !isNaN(parsedTax) && parsedSubtotal > 0;
  const calculatedTotal = hasSubtotalAndTax ? +(parsedSubtotal + parsedTax).toFixed(2) : null;
  const hasMathMismatch =
    calculatedTotal !== null && !isNaN(parsedAmount) && Math.abs(calculatedTotal - parsedAmount) > 0.05;

  // --- Step 4: Save & Confirmation ---
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);

    const numericAmount = parseFloat(amount);
    if (!title.trim() || isNaN(numericAmount) || numericAmount <= 0) {
      setSaveError(
        language === 'en'
          ? 'Please enter a valid title and an amount greater than 0.'
          : 'Por favor ingresa un concepto válido y un importe mayor a 0.'
      );
      return;
    }

    try {
      onConfirmReceipt({
        type,
        title: title.trim(),
        amount: numericAmount,
        date,
        dueDate: dueDate || undefined,
        category,
        responsibleMemberId,
        paymentMethod,
        isExtraordinary,
        notes: notes.trim() || undefined,
        receiptImageUrl: imagePreview || undefined,
        taxId: taxId.trim() || undefined,
        invoiceNumber: invoiceNumber.trim() || undefined,
        subtotal: !isNaN(parsedSubtotal) ? parsedSubtotal : undefined,
        tax: !isNaN(parsedTax) ? parsedTax : undefined,
        currency: receiptCurrency,
      });

      setSavedData({
        title: title.trim(),
        amount: numericAmount,
        type,
        invoiceNumber: invoiceNumber.trim() || undefined,
      });
      setStep('saved');
    } catch (err: any) {
      console.error('Save error:', err);
      setSaveError(
        language === 'en'
          ? 'Error saving invoice. Your data is retained, please retry.'
          : 'Error al guardar la factura. Tus datos se conservan, por favor reintenta.'
      );
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="scanner-dialog-title"
      className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center sm:items-center bg-black/75 backdrop-blur-md sm:p-4 overflow-y-auto"
    >
      <div
        className="w-full sm:max-w-xl bg-white dark:bg-slate-900 rounded-t-[32px] sm:rounded-3xl p-5 sm:p-6 shadow-2xl border-t sm:border border-slate-200 dark:border-slate-800 space-y-4 max-h-[94vh] sm:max-h-[88vh] overflow-y-auto no-scrollbar ios-sheet-slide-up"
        style={{ paddingBottom: 'max(24px, env(safe-area-inset-bottom, 24px))' }}
      >
        {/* iPhone Drag handle affordance */}
        <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto sm:hidden -mt-1 mb-2" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3
                id="scanner-dialog-title"
                className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2"
              >
                <span>{language === 'en' ? 'Scan Invoice' : 'Escanear factura'}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                  AI OCR
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {step === 'choose' &&
                  (language === 'en'
                    ? 'Choose to take a photo or upload an invoice'
                    : 'Toma una foto o sube un archivo de tu factura')}
                {step === 'camera' &&
                  (language === 'en' ? 'Capture document in clear lighting' : 'Enfoca la factura con buena iluminación')}
                {step === 'review' &&
                  (language === 'en' ? 'Review, rotate or adjust framing' : 'Revisa, gira o ajusta el encuadre')}
                {step === 'scanning' &&
                  (language === 'en' ? 'Extracting fiscal data...' : 'Extrayendo datos fiscales con IA...')}
                {step === 'form' &&
                  (language === 'en' ? 'Verify and confirm extracted data' : 'Verifica y confirma los datos extraídos')}
                {step === 'saved' &&
                  (language === 'en' ? 'Invoice successfully registered' : 'Factura registrada con éxito')}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              stopCameraStream();
              onClose();
            }}
            aria-label={language === 'en' ? 'Close dialog' : 'Cerrar diálogo'}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ================= STEP 1: CHOOSE (Tomar foto vs Subir archivo) ================= */}
        {step === 'choose' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Error notifications */}
            {uploadError && (
              <div
                role="alert"
                className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 rounded-2xl flex items-start gap-2.5 text-xs text-red-700 dark:text-red-300"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
                <div className="flex-1">
                  <span className="font-semibold">{uploadError}</span>
                  <p className="text-[11px] text-red-600 dark:text-red-400 mt-0.5">
                    {language === 'en'
                      ? 'Supported formats: PDF, JPG, PNG (Max 10 MB).'
                      : 'Formatos admitidos: PDF, JPG, PNG (Máximo 10 MB).'}
                  </p>
                </div>
              </div>
            )}

            {cameraError && (
              <div
                role="alert"
                className="p-3 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900/60 rounded-2xl flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-200"
              >
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                <div className="flex-1">
                  <span className="font-semibold">{cameraError}</span>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-2.5 py-1 rounded-lg bg-amber-200 dark:bg-amber-800/80 text-amber-900 dark:text-amber-100 font-semibold text-[11px] hover:bg-amber-300 transition-colors"
                    >
                      {language === 'en' ? 'Upload file instead' : 'Subir archivo en su lugar'}
                    </button>
                    <button
                      type="button"
                      onClick={() => mobileCameraInputRef.current?.click()}
                      className="px-2.5 py-1 rounded-lg border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200 font-semibold text-[11px]"
                    >
                      {language === 'en' ? 'Native camera' : 'Cámara del sistema'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Two Primary Options: Tomar foto & Subir archivo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Option 1: Tomar foto */}
              <button
                type="button"
                onClick={handleStartCamera}
                className="group p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-blue-50/40 dark:hover:bg-blue-950/20 transition-all text-left flex flex-col justify-between space-y-3 cursor-pointer shadow-xs active:scale-[0.98]"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/60 flex items-center justify-center text-blue-600 dark:text-blue-300 group-hover:scale-105 transition-transform">
                  <Camera className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between">
                    <span>{language === 'en' ? 'Take Photo' : 'Tomar foto'}</span>
                    <Smartphone className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {language === 'en'
                      ? 'Opens the rear camera on mobile or webcam on desktop.'
                      : 'Abre la cámara trasera en tu teléfono o la webcam.'}
                  </p>
                </div>
              </button>

              {/* Option 2: Subir archivo */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="group p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-blue-50/40 dark:hover:bg-blue-950/20 transition-all text-left flex flex-col justify-between space-y-3 cursor-pointer shadow-xs active:scale-[0.98]"
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/60 flex items-center justify-center text-indigo-600 dark:text-indigo-300 group-hover:scale-105 transition-transform">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between">
                    <span>{language === 'en' ? 'Upload File' : 'Subir archivo'}</span>
                    <FileText className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {language === 'en'
                      ? 'Select PDF, JPG or PNG invoices (up to 10 MB).'
                      : 'Selecciona facturas en PDF, JPG o PNG (hasta 10 MB).'}
                  </p>
                </div>
              </button>
            </div>

            {/* Hidden file inputs */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(file);
                e.target.value = '';
              }}
              className="hidden"
            />
            <input
              ref={mobileCameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(file);
                e.target.value = '';
              }}
              className="hidden"
            />

            {/* Quick Demo Invoices for Evaluation */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>
                  {language === 'en' ? 'Quick Test / Demo Invoices:' : 'Facturas de prueba para evaluar:'}
                </span>
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleSelectSample('electricidad')}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-blue-500 text-left flex items-center gap-2 text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
                >
                  <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className="truncate">{t('demo_bill_electricidad')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectSample('supermercado')}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-blue-500 text-left flex items-center gap-2 text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="truncate">{t('demo_bill_supermercado')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectSample('gasolina')}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-blue-500 text-left flex items-center gap-2 text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
                >
                  <Fuel className="w-4 h-4 text-blue-500 shrink-0" />
                  <span className="truncate">{t('demo_bill_gasolina')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectSample('internet')}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-blue-500 text-left flex items-center gap-2 text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
                >
                  <Wifi className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span className="truncate">{t('demo_bill_internet')}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 2: CAMERA LIVE VIEW ================= */}
        {step === 'camera' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {cameraError ? (
              <div className="p-4 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 rounded-2xl text-xs text-amber-900 dark:text-amber-200 space-y-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm">
                      {language === 'en' ? 'Camera access not permitted' : 'Cámara no disponible'}
                    </h4>
                    <p className="mt-1 leading-relaxed">{cameraError}</p>
                  </div>
                </div>
                <div className="pt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      stopCameraStream();
                      fileInputRef.current?.click();
                    }}
                    className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{language === 'en' ? 'Upload file instead' : 'Subir archivo en su lugar'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep('choose')}
                    className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs"
                  >
                    {language === 'en' ? 'Back' : 'Volver'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Live Viewport */}
                <div className="relative rounded-2xl overflow-hidden bg-black aspect-3/4 sm:aspect-4/3 max-h-[380px] flex items-center justify-center border border-slate-800 shadow-inner">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />

                  {/* Target guide reticle */}
                  <div className="absolute inset-6 border-2 border-white/40 rounded-xl pointer-events-none flex flex-col justify-between p-3">
                    <div className="flex justify-between">
                      <span className="w-4 h-4 border-t-2 border-l-2 border-white" />
                      <span className="w-4 h-4 border-t-2 border-r-2 border-white" />
                    </div>
                    <div className="text-center text-[11px] text-white/90 bg-black/40 backdrop-blur-xs py-1 px-3 rounded-full mx-auto font-medium">
                      {language === 'en'
                        ? 'Align invoice inside frame'
                        : 'Alinea la factura dentro del marco'}
                    </div>
                    <div className="flex justify-between">
                      <span className="w-4 h-4 border-b-2 border-l-2 border-white" />
                      <span className="w-4 h-4 border-b-2 border-r-2 border-white" />
                    </div>
                  </div>
                </div>

                {/* Shutter button bar */}
                <div className="flex items-center justify-between px-4 py-2">
                  <button
                    type="button"
                    onClick={() => {
                      stopCameraStream();
                      setStep('choose');
                    }}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  >
                    {language === 'en' ? 'Cancel' : 'Cancelar'}
                  </button>

                  {/* iOS Style Shutter Button */}
                  <button
                    type="button"
                    onClick={handleCapturePhoto}
                    aria-label={language === 'en' ? 'Capture photo' : 'Capturar foto'}
                    className="w-16 h-16 rounded-full border-4 border-white shadow-lg bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center text-white cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-full border-2 border-blue-400 bg-blue-500 flex items-center justify-center">
                      <Camera className="w-6 h-6" />
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      stopCameraStream();
                      fileInputRef.current?.click();
                    }}
                    className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {language === 'en' ? 'Use file' : 'Usar archivo'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= STEP 3: REVIEW IMAGE (Rotar, Recortar/Ajustar, Repetir) ================= */}
        {step === 'review' && imagePreview && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {scanError && (
              <div
                role="alert"
                className="p-3 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 rounded-2xl flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-200"
              >
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                <div className="flex-1">
                  <span className="font-semibold">{scanError}</span>
                  <p className="mt-0.5 text-[11px]">
                    {language === 'en'
                      ? 'The image was retained so you do not have to start over.'
                      : 'La imagen se conserva intacta para que no tengas que empezar de nuevo.'}
                  </p>
                </div>
              </div>
            )}

            {/* Document / Image Preview viewport */}
            <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-700/60 flex items-center justify-center min-h-[220px] max-h-[340px]">
              {isPdf ? (
                <div className="p-8 text-center text-white space-y-2">
                  <div className="w-16 h-16 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center mx-auto border border-red-500/40">
                    <FileText className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold truncate max-w-xs">{fileName}</h4>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      {language === 'en' ? 'PDF Document Ready' : 'Documento PDF Listo para Procesar'}
                    </span>
                  </div>
                </div>
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center overflow-hidden p-2 transition-transform duration-200"
                  style={{
                    filter: highContrast ? 'contrast(135%) brightness(95%)' : 'none',
                  }}
                >
                  <img
                    src={imagePreview}
                    alt="Vista previa de factura"
                    style={{
                      transform: `rotate(${rotation}deg) scale(${zoomLevel})`,
                      transformOrigin: 'center center',
                      maxHeight: '300px',
                    }}
                    className="object-contain rounded-lg transition-transform duration-200 shadow-md"
                  />
                </div>
              )}

              {/* Badge info */}
              <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-mono flex items-center gap-1.5">
                <span>{fileName || 'Factura'}</span>
                {!isPdf && rotation !== 0 && <span>• {rotation}°</span>}
              </div>
            </div>

            {/* Image Adjustment Toolbar */}
            {!isPdf && (
              <div className="grid grid-cols-3 gap-2 text-xs">
                {/* 1. Rotar */}
                <button
                  type="button"
                  onClick={() => setRotation((prev) => (prev + 90) % 360)}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                  title="Girar 90 grados"
                >
                  <RotateCw className="w-3.5 h-3.5 text-blue-500" />
                  <span>{language === 'en' ? 'Rotate 90°' : 'Rotar 90°'}</span>
                </button>

                {/* 2. Recortar / Zoom */}
                <button
                  type="button"
                  onClick={() => setZoomLevel((prev) => (prev === 1 ? 1.25 : prev === 1.25 ? 1.5 : 1))}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                  title="Ajustar escala / encuadre"
                >
                  <ZoomIn className="w-3.5 h-3.5 text-indigo-500" />
                  <span>
                    {language === 'en' ? 'Zoom' : 'Encuadre'} {zoomLevel}x
                  </span>
                </button>

                {/* 3. Contraste */}
                <button
                  type="button"
                  onClick={() => setHighContrast(!highContrast)}
                  className={`p-2.5 rounded-xl border flex items-center justify-center gap-1.5 font-semibold transition-colors cursor-pointer ${
                    highContrast
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300'
                  }`}
                  title="Realzar texto y nitidez"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>{language === 'en' ? 'Contrast' : 'Contraste'}</span>
                </button>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setImagePreview(null);
                  setFileName('');
                  setRotation(0);
                  setStep('choose');
                }}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{language === 'en' ? 'Retake / Change' : 'Repetir / Cambiar'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleProcessImage()}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>{language === 'en' ? 'Process Invoice with AI' : 'Procesar factura con IA'}</span>
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 4: SCANNING LOADER ================= */}
        {step === 'scanning' && (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in duration-200">
            <div className="relative w-20 h-20 rounded-3xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center border-2 border-blue-500/40 shadow-lg">
              <Sparkles className="w-10 h-10 text-blue-500 animate-pulse" />
              <div className="absolute inset-x-2 h-0.5 bg-blue-500 animate-ping rounded-full" />
            </div>
            <div className="space-y-1.5">
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                {language === 'en' ? 'Analyzing invoice with AI...' : 'Analizando factura con IA...'}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                {language === 'en'
                  ? 'Extracting merchant, fiscal ID, invoice number, dates, subtotal, taxes and total...'
                  : 'Extrayendo emisor, NIF/RFC, número de factura, fechas, subtotal, impuestos y total...'}
              </p>
            </div>
          </div>
        )}

        {/* ================= STEP 5: VERIFICATION & EDITABLE FORM ================= */}
        {step === 'form' && (
          <form onSubmit={handleSaveForm} className="space-y-4 animate-in fade-in duration-200">
            {/* Save error notice */}
            {saveError && (
              <div
                role="alert"
                className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-2xl flex items-start gap-2.5 text-xs text-red-800 dark:text-red-200"
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
                <div>
                  <span className="font-semibold">{saveError}</span>
                </div>
              </div>
            )}

            {/* Duplicate invoice warning banner */}
            {duplicateExpense && !isDuplicateAcknowledged && (
              <div
                role="alert"
                className="p-3.5 bg-amber-50 dark:bg-amber-950/60 border-2 border-amber-300 dark:border-amber-800 rounded-2xl text-xs text-amber-900 dark:text-amber-200 space-y-2 shadow-xs"
              >
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">
                      {language === 'en' ? 'Potential duplicate invoice detected' : 'Posible factura duplicada detectada'}
                    </span>
                    <p className="mt-0.5 leading-relaxed text-[11px]">
                      {language === 'en'
                        ? `An existing expense "${duplicateExpense.name}" with amount $${duplicateExpense.amount} (${duplicateExpense.type}) is already recorded. Please verify before saving.`
                        : `Ya existe un gasto registrado con el emisor "${duplicateExpense.name}" por $${duplicateExpense.amount} (${duplicateExpense.type}). Verifica si se trata del mismo comprobante.`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsDuplicateAcknowledged(true)}
                    className="px-3 py-1 rounded-lg bg-amber-200 dark:bg-amber-900/80 hover:bg-amber-300 font-semibold text-[11px] text-amber-900 dark:text-amber-100 transition-colors"
                  >
                    {language === 'en' ? 'Continue anyway' : 'Continuar de todos modos'}
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-3 py-1 text-[11px] font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  >
                    {language === 'en' ? 'Cancel' : 'Cancelar'}
                  </button>
                </div>
              </div>
            )}

            {/* Math mismatch warning */}
            {hasMathMismatch && (
              <div
                role="alert"
                className="p-3 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 rounded-2xl flex items-start gap-2.5 text-xs text-blue-900 dark:text-blue-200"
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="flex-1">
                  <span className="font-bold">
                    {language === 'en' ? 'Amounts check notice:' : 'Comprobación de importes:'}
                  </span>
                  <p className="mt-0.5 text-[11px] leading-relaxed">
                    {language === 'en'
                      ? `Subtotal ($${parsedSubtotal}) + Taxes ($${parsedTax}) = $${calculatedTotal}, but Total is set to $${parsedAmount}.`
                      : `Subtotal ($${parsedSubtotal}) + Impuestos ($${parsedTax}) = $${calculatedTotal}, pero el Total ingresado es $${parsedAmount}.`}
                  </p>
                  {calculatedTotal !== null && (
                    <button
                      type="button"
                      onClick={() => setAmount(calculatedTotal.toString())}
                      className="mt-1.5 px-2.5 py-1 rounded-lg bg-blue-200 dark:bg-blue-800 text-blue-900 dark:text-blue-100 font-semibold text-[11px] hover:bg-blue-300"
                    >
                      {language === 'en'
                        ? `Auto-adjust Total to $${calculatedTotal}`
                        : `Ajustar Total a $${calculatedTotal}`}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Document Thumbnail Bar */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
              {imagePreview && (
                <div className="relative group shrink-0">
                  <img
                    src={imagePreview}
                    alt="Factura original"
                    className="w-14 h-14 object-cover rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs"
                  />
                  <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Eye className="w-4 h-4 text-white" />
                  </div>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  {language === 'en' ? 'Original Document Attached' : 'Documento original adjunto'}
                </span>
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {fileName || 'Factura_Captura.jpg'}
                </p>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>
                    {language === 'en'
                      ? 'Archived with this expense record'
                      : 'Se conservará junto con el registro del gasto'}
                  </span>
                </span>
              </div>
            </div>

            {/* Field: Emisor (Merchant) & Número Fiscal */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between mb-1">
                  <span>{language === 'en' ? 'Issuer / Merchant *' : 'Emisor / Comercio *'}</span>
                  {flaggedFields.includes('title') && (
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                      ⚠️ {language === 'en' ? 'Review' : 'Revisar'}
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="ej. Walmart, CFE, Gasolinera"
                  className={`w-full px-3 py-2 text-xs rounded-xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium ${
                    flaggedFields.includes('title')
                      ? 'border-amber-400 dark:border-amber-500 focus:ring-amber-500'
                      : 'border-slate-200 dark:border-slate-700'
                  }`}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between mb-1">
                  <span>{language === 'en' ? 'Fiscal ID (RFC/CIF/NIF)' : 'Número fiscal (RFC/NIF)'}</span>
                  {flaggedFields.includes('taxId') && (
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                      ⚠️ {language === 'en' ? 'Optional check' : 'Opcional'}
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  value={taxId}
                  onChange={(e) => setTaxId(e.target.value)}
                  placeholder="ej. B-12345678"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                />
              </div>
            </div>

            {/* Field: Número de Factura & Fechas */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between mb-1">
                  <span>{language === 'en' ? 'Invoice Number' : 'Nº de factura'}</span>
                  {flaggedFields.includes('invoiceNumber') && (
                    <span className="text-[10px] text-amber-600 dark:text-amber-400">⚠️</span>
                  )}
                </label>
                <input
                  type="text"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  placeholder="ej. INV-2026-0041"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  {language === 'en' ? 'Issue Date *' : 'Fecha de emisión *'}
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  {language === 'en' ? 'Due Date' : 'Fecha vencimiento'}
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Field: Subtotal, Impuestos & Total */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  {language === 'en' ? 'Subtotal' : 'Subtotal'} ({receiptCurrency})
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={subtotal}
                  onChange={(e) => setSubtotal(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white tabular-nums"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  {language === 'en' ? 'Taxes (VAT/IVA)' : 'Impuestos (IVA)'} ({receiptCurrency})
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={tax}
                  onChange={(e) => setTax(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white tabular-nums"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between mb-1">
                  <span>{language === 'en' ? 'Total Amount *' : 'Total Factura *'}</span>
                  {flaggedFields.includes('amount') && (
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                      ⚠️ {language === 'en' ? 'Required' : 'Requerido'}
                    </span>
                  )}
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className={`w-full px-3 py-2 text-sm font-extrabold rounded-xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-white tabular-nums ${
                    flaggedFields.includes('amount') || hasMathMismatch
                      ? 'border-amber-500 focus:ring-amber-500'
                      : 'border-blue-500 focus:ring-blue-500'
                  }`}
                />
              </div>
            </div>

            {/* Movement Type: Gasto Fijo vs Gasto Variable */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                {language === 'en' ? 'Expense Classification' : 'Tipo de movimiento'}
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
                  <span>{language === 'en' ? 'Fixed Expense (Bill)' : 'Gasto Fijo Mensual'}</span>
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
                  <span>{language === 'en' ? 'Variable Expense' : 'Gasto Variable'}</span>
                </button>
              </div>
            </div>

            {/* Category and Responsible Member */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  {language === 'en' ? 'Category' : 'Categoría'}
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                >
                  <option value="Supermercado">{language === 'en' ? 'Supermarket' : 'Supermercado'}</option>
                  <option value="Electricidad">{language === 'en' ? 'Electricity' : 'Electricidad'}</option>
                  <option value="Agua">{language === 'en' ? 'Water' : 'Agua'}</option>
                  <option value="Gas">{language === 'en' ? 'Gas' : 'Gas'}</option>
                  <option value="Internet">{language === 'en' ? 'Internet' : 'Internet'}</option>
                  <option value="Combustible">{language === 'en' ? 'Fuel' : 'Combustible'}</option>
                  <option value="Restaurantes">{language === 'en' ? 'Restaurants' : 'Restaurantes'}</option>
                  <option value="Farmacia">{language === 'en' ? 'Pharmacy' : 'Farmacia'}</option>
                  <option value="Salud">{language === 'en' ? 'Health' : 'Salud'}</option>
                  <option value="Mantenimiento del hogar">
                    {language === 'en' ? 'Home Maintenance' : 'Mantenimiento del hogar'}
                  </option>
                  <option value="Otros">{language === 'en' ? 'Other' : 'Otros'}</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  {language === 'en' ? 'Responsible Member' : 'Miembro responsable'}
                </label>
                <select
                  value={responsibleMemberId}
                  onChange={(e) => setResponsibleMemberId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
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
                {language === 'en' ? 'Notes / Observations' : 'Notas u observaciones'}
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={language === 'en' ? 'e.g. Weekly family groceries' : 'ej. Despensa semanal del hogar'}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>

            {/* Actions Toolbar */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setStep('review')}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
              >
                {language === 'en' ? 'Back to image' : 'Volver a la imagen'}
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                >
                  {language === 'en' ? 'Cancel' : 'Cancelar'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-xl transition-all cursor-pointer shadow-md flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{language === 'en' ? 'Confirm & Save' : 'Confirmar y Guardar'}</span>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* ================= STEP 6: SAVED CONFIRMATION SCREEN ================= */}
        {step === 'saved' && savedData && (
          <div className="py-6 space-y-5 text-center animate-in fade-in duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/70 border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                {language === 'en' ? 'Invoice Successfully Registered!' : '¡Factura registrada con éxito!'}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                {language === 'en'
                  ? 'The document has been securely stored in your local records.'
                  : 'El comprobante y sus datos fueron guardados correctamente en tu registro.'}
              </p>
            </div>

            {/* Summary card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-left max-w-md mx-auto space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 dark:text-slate-400">{language === 'en' ? 'Concept:' : 'Concepto:'}</span>
                <span className="font-bold text-slate-900 dark:text-white">{savedData.title}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 dark:text-slate-400">{language === 'en' ? 'Amount:' : 'Importe total:'}</span>
                <span className="font-extrabold text-blue-600 dark:text-blue-400 text-sm">
                  ${savedData.amount.toFixed(2)} {currencyCode}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 dark:text-slate-400">{language === 'en' ? 'Type:' : 'Clasificación:'}</span>
                <span className="px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-semibold text-[10px]">
                  {savedData.type === 'fixedExpense'
                    ? (language === 'en' ? 'Fixed Expense' : 'Gasto Fijo')
                    : (language === 'en' ? 'Variable Expense' : 'Gasto Variable')}
                </span>
              </div>
              {savedData.invoiceNumber && (
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 dark:text-slate-400">
                    {language === 'en' ? 'Invoice Number:' : 'Nº de factura:'}
                  </span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">{savedData.invoiceNumber}</span>
                </div>
              )}
            </div>

            {/* Actions: View in list or close */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
              {onViewExpense && (
                <button
                  type="button"
                  onClick={() => {
                    onViewExpense(savedData.type);
                    onClose();
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <span>{language === 'en' ? 'View in expense list' : 'Ver en registro de gastos'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setImagePreview(null);
                  setFileName('');
                  setStep('choose');
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs cursor-pointer"
              >
                {language === 'en' ? 'Scan another invoice' : 'Escanear otra factura'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-semibold text-xs cursor-pointer"
              >
                {language === 'en' ? 'Done' : 'Listo'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
