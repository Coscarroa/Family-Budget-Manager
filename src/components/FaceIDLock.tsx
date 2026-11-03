import React, { useState } from 'react';
import { ScanFace, Lock, Unlock, ShieldCheck, KeyRound } from 'lucide-react';

interface FaceIDLockProps {
  householdName: string;
  pinCode?: string;
  onUnlock: () => void;
}

export const FaceIDLock: React.FC<FaceIDLockProps> = ({
  householdName,
  pinCode = '1234',
  onUnlock,
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [showPinPad, setShowPinPad] = useState(false);
  const [pinError, setPinError] = useState(false);

  const triggerFaceID = () => {
    setIsScanning(true);
    setPinError(false);

    // Simulate Apple Face ID biometric sensor timing
    setTimeout(() => {
      setIsScanning(false);
      setAuthSuccess(true);
      setTimeout(() => {
        onUnlock();
      }, 700);
    }, 1200);
  };

  const handlePinDigit = (digit: string) => {
    if (pinInput.length < 4) {
      const next = pinInput + digit;
      setPinInput(next);
      setPinError(false);

      if (next.length === 4) {
        if (next === pinCode) {
          setAuthSuccess(true);
          setTimeout(() => onUnlock(), 500);
        } else {
          setPinError(true);
          setTimeout(() => setPinInput(''), 600);
        }
      }
    }
  };

  const handleBackspace = () => {
    setPinInput((prev) => prev.slice(0, -1));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-2xl text-white p-6 animate-in fade-in duration-300">
      <div className="w-full max-w-sm flex flex-col items-center text-center">
        {/* Apple Padlock Header */}
        <div className="mb-6 flex items-center justify-center w-16 h-16 rounded-full bg-slate-900 border border-slate-800 shadow-inner">
          {authSuccess ? (
            <Unlock className="w-8 h-8 text-emerald-400 animate-bounce" />
          ) : (
            <Lock className="w-8 h-8 text-blue-400" />
          )}
        </div>

        <h2 className="text-2xl font-bold tracking-tight text-white mb-1">
          {householdName}
        </h2>
        <p className="text-sm text-slate-400 mb-8">
          Protección biométrica y cifrado local activo
        </p>

        {!showPinPad ? (
          <div className="flex flex-col items-center w-full">
            {/* Face ID Visual Scanner */}
            <button
              onClick={triggerFaceID}
              disabled={isScanning || authSuccess}
              className={`relative flex items-center justify-center w-28 h-28 rounded-3xl border-2 transition-all duration-300 ${
                isScanning
                  ? 'border-blue-500 bg-blue-500/10 scale-105 shadow-lg shadow-blue-500/20'
                  : authSuccess
                  ? 'border-emerald-500 bg-emerald-500/10 scale-105'
                  : 'border-slate-700 bg-slate-900/60 hover:border-blue-400 hover:scale-102 cursor-pointer'
              }`}
            >
              <ScanFace
                className={`w-14 h-14 transition-colors ${
                  isScanning
                    ? 'text-blue-400 animate-pulse'
                    : authSuccess
                    ? 'text-emerald-400'
                    : 'text-slate-300'
                }`}
              />

              {isScanning && (
                <div className="absolute inset-x-2 h-0.5 bg-blue-400/80 animate-ping" />
              )}
            </button>

            <p className="mt-4 text-xs font-medium text-slate-300">
              {isScanning
                ? 'Verificando con Face ID...'
                : authSuccess
                ? '¡Identidad Confirmada!'
                : 'Toca el sensor para desbloquear con Face ID'}
            </p>

            <button
              onClick={() => setShowPinPad(true)}
              className="mt-8 flex items-center gap-2 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors py-2 px-4 rounded-full bg-slate-900/80 border border-slate-800"
            >
              <KeyRound className="w-3.5 h-3.5" />
              Usar Código PIN de Seguridad
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center w-full">
            {/* PIN Code Circles */}
            <div className={`flex items-center gap-4 mb-6 ${pinError ? 'animate-shake' : ''}`}>
              {[0, 1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  className={`w-4 h-4 rounded-full border-2 transition-all ${
                    idx < pinInput.length
                      ? pinError
                        ? 'bg-rose-500 border-rose-500'
                        : 'bg-blue-500 border-blue-500 scale-110'
                      : 'border-slate-600 bg-transparent'
                  }`}
                />
              ))}
            </div>

            {pinError && (
              <p className="text-xs text-rose-400 mb-4 font-medium">
                Código PIN incorrecto (Prueba con {pinCode})
              </p>
            )}

            {/* Apple Style Number Pad */}
            <div className="grid grid-cols-3 gap-3 w-64 mb-6">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  onClick={() => handlePinDigit(digit)}
                  className="w-16 h-16 rounded-full bg-slate-900/90 border border-slate-800 text-xl font-semibold text-white flex items-center justify-center hover:bg-slate-800 active:scale-95 transition-all shadow-sm"
                >
                  {digit}
                </button>
              ))}
              <button
                onClick={() => setShowPinPad(false)}
                className="w-16 h-16 rounded-full text-xs font-medium text-slate-400 flex items-center justify-center hover:text-white"
              >
                Face ID
              </button>
              <button
                onClick={() => handlePinDigit('0')}
                className="w-16 h-16 rounded-full bg-slate-900/90 border border-slate-800 text-xl font-semibold text-white flex items-center justify-center hover:bg-slate-800 active:scale-95 transition-all shadow-sm"
              >
                0
              </button>
              <button
                onClick={handleBackspace}
                className="w-16 h-16 rounded-full text-xs font-medium text-slate-400 flex items-center justify-center hover:text-white"
              >
                Borrar
              </button>
            </div>
          </div>
        )}

        <div className="mt-8 flex items-center gap-1.5 text-[11px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Almacenamiento Local Seguro (SwiftData / Secure Storage)</span>
        </div>
      </div>
    </div>
  );
};
