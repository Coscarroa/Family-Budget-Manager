import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Smartphone,
  Mail,
  ScanFace,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  UserCheck,
  Lock,
  ChevronLeft,
  UserPlus,
  RefreshCw,
} from 'lucide-react';
import { FamilyMember, AppLanguage, SystemRole } from '../types/finance';
import { getTranslation } from '../services/i18n';

interface LoginPageProps {
  language: AppLanguage;
  members: FamilyMember[];
  onLoginSuccess: (user: FamilyMember, method: 'otp' | 'biometric') => void;
  onRegisterMember: (newMember: FamilyMember) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  language,
  members,
  onLoginSuccess,
  onRegisterMember,
}) => {
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);

  // Mode: 'login' | 'register'
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Input identifier: email or phone
  const [identifier, setIdentifier] = useState('');
  const [step, setStep] = useState<'input' | 'otp'>('input');
  const [otpCode, setOtpCode] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState<string>('');
  const [activeUser, setActiveUser] = useState<FamilyMember | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSimulatingSending, setIsSimulatingSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // Biometric state
  const [isBiometricScanning, setIsBiometricScanning] = useState(false);
  const [biometricSuccess, setBiometricSuccess] = useState(false);

  // Registration form states
  const [regName, setRegName] = useState('');
  const [regIdentifierType, setRegIdentifierType] = useState<'phone' | 'email'>('phone');
  const [regContact, setRegContact] = useState('');
  const [regRole, setRegRole] = useState('Adulto');
  const [regSystemRole, setRegSystemRole] = useState<SystemRole>('editor');

  // Clear errors on change
  useEffect(() => {
    setErrorMsg('');
  }, [identifier, otpCode, authMode]);

  // Clean and normalize phone/email for comparison
  const normalize = (val: string) => val.trim().toLowerCase().replace(/[\s\-\(\)]/g, '');

  const findUserByIdentifier = (val: string): FamilyMember | undefined => {
    const norm = normalize(val);
    if (!norm) return undefined;
    return members.find((m) => {
      const emailNorm = m.email ? normalize(m.email) : '';
      const phoneNorm = m.phone ? normalize(m.phone) : '';
      return emailNorm === norm || phoneNorm === norm;
    });
  };

  // Quick Super Admin one-tap fill
  const handleFillSuperAdmin = () => {
    setAuthMode('login');
    setIdentifier('1-272-892-1925');
    setErrorMsg('');
  };

  // Step 1: Send verification code
  const handleSendOtp = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    const norm = normalize(identifier);
    if (!norm) {
      setErrorMsg(language === 'en' ? 'Please enter a valid phone number or email' : 'Por favor ingresa un teléfono o correo válido');
      return;
    }

    const matchedUser = findUserByIdentifier(identifier);
    if (!matchedUser) {
      setErrorMsg(
        language === 'en'
          ? 'No registered member found with this phone or email. You can create an account below.'
          : 'No se encontró un integrante con este teléfono o correo. Puedes registrarte abajo.'
      );
      return;
    }

    setIsSimulatingSending(true);

    // Specific preset for the requested Super Admin: code 946318
    const isSuperAdminPhone = norm.includes('12728921925') || norm.includes('2728921925');
    const assignedCode = isSuperAdminPhone ? '946318' : Math.floor(100000 + Math.random() * 900000).toString();

    setTimeout(() => {
      setIsSimulatingSending(false);
      setActiveUser(matchedUser);
      setGeneratedOtp(assignedCode);
      setStep('otp');
      setOtpCode('');
    }, 600);
  };

  // Step 2: Validate verification code
  const handleValidateOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setErrorMsg('');

    setTimeout(() => {
      setIsVerifying(false);
      if (otpCode.trim() === generatedOtp.trim()) {
        if (activeUser) {
          onLoginSuccess(activeUser, 'otp');
        }
      } else {
        setErrorMsg(
          language === 'en'
            ? `Incorrect code. Enter "${generatedOtp}" to continue.`
            : `Código incorrecto. Ingresa "${generatedOtp}" para continuar.`
        );
      }
    }, 450);
  };

  // Biometric Auth (Face ID / Touch ID)
  const handleTriggerBiometric = () => {
    setIsBiometricScanning(true);
    setErrorMsg('');

    setTimeout(() => {
      setIsBiometricScanning(false);
      setBiometricSuccess(true);

      // Authenticate with the matched user or fallback to Super Admin / First Active
      const userToLogin =
        (identifier ? findUserByIdentifier(identifier) : null) ||
        members.find((m) => m.systemRole === 'superadmin') ||
        members[0];

      setTimeout(() => {
        onLoginSuccess(userToLogin, 'biometric');
      }, 600);
    }, 1100);
  };

  // Handle registration submit
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!regName.trim() || !regContact.trim()) {
      setErrorMsg(language === 'en' ? 'Please complete all required fields' : 'Por favor completa todos los campos requeridos');
      return;
    }

    const normContact = normalize(regContact);
    const existing = findUserByIdentifier(regContact);
    if (existing) {
      setErrorMsg(
        language === 'en'
          ? 'An account with this contact already exists. Please log in.'
          : 'Ya existe una cuenta con este contacto. Por favor inicia sesión.'
      );
      return;
    }

    const newMember: FamilyMember = {
      id: `mem-${Date.now()}`,
      name: regName.trim(),
      role: regRole,
      systemRole: regSystemRole,
      avatarColor: ['#007AFF', '#34C759', '#AF52DE', '#FF9500', '#FF2D55', '#5856D6'][Math.floor(Math.random() * 6)],
      phone: regIdentifierType === 'phone' ? regContact.trim() : undefined,
      email: regIdentifierType === 'email' ? regContact.trim() : undefined,
      isMainEarner: false,
      monthlyContribution: 0,
      isActive: true,
      biometricEnabled: true,
      notes: 'Registrado desde la pantalla de acceso',
    };

    onRegisterMember(newMember);

    // Automatically transition to verification OTP for the new user
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    setActiveUser(newMember);
    setIdentifier(regContact.trim());
    setGeneratedOtp(newCode);
    setAuthMode('login');
    setStep('otp');
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center px-4 py-8 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors">
      {/* Background ambient Apple blur glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 dark:bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Minimalist Apple Card */}
      <div className="relative w-full max-w-sm sm:max-w-md bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-3xl sm:rounded-[36px] p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800/80 shadow-2xl shadow-slate-900/5 dark:shadow-black/40">
        {/* Brand Apple-inspired Minimalist Header with Official App Icon */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="relative mb-3 group">
            <img
              src="/app-icon.png"
              alt="Family Budget App Icon"
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-[22px] shadow-xl shadow-blue-500/25 border-2 border-white/80 dark:border-slate-800 object-cover transition-transform group-hover:scale-105"
            />
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Family Budget
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
            {t('login_subtitulo')}
          </p>
        </div>

        {/* Tab switch: Login vs Registro */}
        <div className="flex p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => {
              setAuthMode('login');
              setStep('input');
              setErrorMsg('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              authMode === 'login'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {t('iniciar_sesion')}
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('register');
              setErrorMsg('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              authMode === 'register'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {t('crear_cuenta')}
          </button>
        </div>

        {/* Error Callout */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* MODE 1: LOGIN */}
        {authMode === 'login' && (
          <>
            {step === 'input' ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    {t('ingresa_telefono_o_correo')}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      autoFocus
                      placeholder="1-272-892-1925 o correo@familia.com"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="w-full px-4 py-3 text-sm rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                      {identifier.includes('@') ? (
                        <Mail className="w-4 h-4" />
                      ) : (
                        <Smartphone className="w-4 h-4" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Primary Button: Send OTP */}
                <button
                  type="submit"
                  disabled={isSimulatingSending || !identifier.trim()}
                  className="w-full py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold shadow-sm shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                >
                  {isSimulatingSending ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{language === 'en' ? 'Generating code...' : 'Generando código...'}</span>
                    </>
                  ) : (
                    <>
                      <span>{t('enviar_codigo')}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Super Admin Quick Badge / One-tap demo */}
                <div className="pt-2">
                  <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-2">
                    <div className="text-left">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-purple-500 inline-block" />
                        <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                          {t('superadmin_badge')}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                        Tel: 1-272-892-1925 · Code: 946318
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleFillSuperAdmin}
                      className="px-2.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-bold cursor-pointer transition-colors shrink-0 shadow-xs"
                    >
                      {language === 'en' ? 'Auto-fill' : 'Cargar'}
                    </button>
                  </div>
                </div>

                {/* Biometric Face ID option */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={handleTriggerBiometric}
                    disabled={isBiometricScanning}
                    className="w-full py-2.5 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
                  >
                    <ScanFace className="w-4 h-4 text-blue-500" />
                    <span>{t('entrar_con_biometria')}</span>
                  </button>
                </div>
              </form>
            ) : (
              /* Step 2: Verification Code (OTP) Form */
              <form onSubmit={handleValidateOtp} className="space-y-4 animate-in fade-in duration-200">
                <div className="text-center">
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {t('codigo_enviado_a')}
                  </span>
                  <div className="font-semibold text-xs text-slate-800 dark:text-slate-200 mt-0.5 flex items-center justify-center gap-1.5">
                    <span>{identifier}</span>
                    <button
                      type="button"
                      onClick={() => setStep('input')}
                      className="text-blue-600 dark:text-blue-400 text-[11px] underline cursor-pointer"
                    >
                      ({t('cambiar_metodo')})
                    </button>
                  </div>

                  {/* Simulated iOS SMS / Email Push Banner */}
                  <div className="mt-3 p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-left">
                    <div className="flex items-center justify-between text-[11px] font-bold text-blue-900 dark:text-blue-200">
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        Código recibido (Simulado)
                      </span>
                      <span className="text-[10px] text-blue-500">Ahora</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-xs text-slate-600 dark:text-slate-400">
                        Tu código de acceso:
                      </span>
                      <button
                        type="button"
                        onClick={() => setOtpCode(generatedOtp)}
                        className="px-2 py-0.5 rounded-lg bg-blue-600 text-white font-mono font-bold text-xs cursor-pointer hover:bg-blue-700 tracking-wider shadow-xs"
                        title="Toca para autocompletar"
                      >
                        {generatedOtp}
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    {t('ingresa_codigo_verificacion')}
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    autoFocus
                    placeholder="946318"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full text-center tracking-[0.4em] font-mono text-xl py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isVerifying || otpCode.length < 4}
                  className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold shadow-sm shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                >
                  {isVerifying ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{language === 'en' ? 'Verifying...' : 'Validando...'}</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{t('validar_y_entrar')}</span>
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      const newCode = Math.floor(100000 + Math.random() * 900000).toString();
                      setGeneratedOtp(newCode);
                    }}
                    className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
                  >
                    {t('volver_a_enviar')}
                  </button>
                  <button
                    type="button"
                    onClick={handleTriggerBiometric}
                    className="text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <ScanFace className="w-3.5 h-3.5" />
                    <span>Face ID</span>
                  </button>
                </div>
              </form>
            )}
          </>
        )}

        {/* MODE 2: REGISTER */}
        {authMode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5 animate-in fade-in duration-200">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t('nombre_completo')}
              </label>
              <input
                type="text"
                required
                autoFocus
                placeholder="ej: María Gómez"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t('rol_familiar')}
                </label>
                <input
                  type="text"
                  required
                  placeholder="ej: Padre, Madre, Hijo"
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t('rol_sistema')}
                </label>
                <select
                  value={regSystemRole}
                  onChange={(e) => setRegSystemRole(e.target.value as SystemRole)}
                  className="w-full px-2 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
                >
                  <option value="admin">{t('rol_admin')}</option>
                  <option value="editor">{t('rol_editor')}</option>
                  <option value="viewer">{t('rol_viewer')}</option>
                </select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {regIdentifierType === 'phone' ? t('telefono') : t('correo_o_id')}
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setRegIdentifierType(regIdentifierType === 'phone' ? 'email' : 'phone')
                  }
                  className="text-[11px] text-blue-600 dark:text-blue-400 underline cursor-pointer"
                >
                  {regIdentifierType === 'phone'
                    ? (language === 'en' ? 'Use Email' : 'Usar Correo')
                    : (language === 'en' ? 'Use Phone' : 'Usar Teléfono')}
                </button>
              </div>

              <div className="relative">
                <input
                  type={regIdentifierType === 'phone' ? 'tel' : 'email'}
                  required
                  placeholder={
                    regIdentifierType === 'phone' ? '+1 555-0199' : 'nuevo.usuario@familia.com'
                  }
                  value={regContact}
                  onChange={(e) => setRegContact(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  {regIdentifierType === 'phone' ? (
                    <Smartphone className="w-3.5 h-3.5" />
                  ) : (
                    <Mail className="w-3.5 h-3.5" />
                  )}
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
              {language === 'en'
                ? 'After registering, a 6-digit code will be generated to verify and access.'
                : 'Al registrarte, se generará un código de 6 dígitos para validar y acceder.'}
            </p>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
            >
              <UserPlus className="w-4 h-4" />
              <span>{language === 'en' ? 'Complete Registration' : 'Completar Registro'}</span>
            </button>
          </form>
        )}
      </div>

      {/* Biometric Scanning Overlay (Apple Face ID HUD) */}
      {isBiometricScanning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-56 h-56 rounded-3xl bg-slate-900/90 border border-white/10 p-6 flex flex-col items-center justify-center text-center shadow-2xl animate-in zoom-in-95">
            <div className="relative flex items-center justify-center w-20 h-20 rounded-2xl bg-blue-500/10 border border-blue-500/30 mb-3">
              <ScanFace className="w-10 h-10 text-blue-400 animate-pulse" />
              <div className="absolute inset-x-2 h-0.5 bg-blue-400 animate-ping" />
            </div>
            <span className="text-xs font-bold text-white">Face ID</span>
            <span className="text-[11px] text-slate-400 mt-1">
              {language === 'en' ? 'Scanning sensor...' : 'Escaneando sensor...'}
            </span>
          </div>
        </div>
      )}

      {/* Footer minimal info */}
      <div className="mt-8 text-center text-[11px] text-slate-400 flex items-center gap-2">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
        <span>Cifrado y verificación local segura · Family Budget Manager</span>
      </div>
    </div>
  );
};
