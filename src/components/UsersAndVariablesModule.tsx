import React, { useState } from 'react';
import {
  Users,
  Sliders,
  UserCheck,
  UserPlus,
  Edit2,
  Trash2,
  DollarSign,
  Shield,
  CreditCard,
  Target,
  Sparkles,
  Check,
  X,
  Mail,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import {
  Household,
  FamilyMember,
  HouseholdVariables,
  CurrencyCode,
  PaymentMethod,
  SUPPORTED_CURRENCIES,
  AppLanguage,
  SystemRole,
} from '../types/finance';
import { getTranslation } from '../services/i18n';
import { FinancialCalculatorService } from '../services/financialCalculations';

interface UsersAndVariablesModuleProps {
  language: AppLanguage;
  household: Household;
  members: FamilyMember[];
  currencyCode: CurrencyCode;
  onUpdateHousehold: (updated: Household) => void;
  onUpdateMembers: (members: FamilyMember[]) => void;
}

export const UsersAndVariablesModule: React.FC<UsersAndVariablesModuleProps> = ({
  language,
  household,
  members,
  currencyCode,
  onUpdateHousehold,
  onUpdateMembers,
}) => {
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);
  const format = (val: number) => FinancialCalculatorService.formatCurrency(val, currencyCode);

  const [activeSubTab, setActiveSubTab] = useState<'users' | 'variables'>('users');

  // Edit user modal state
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [isCreatingMember, setIsCreatingMember] = useState(false);

  // Form states for member editing
  const [name, setName] = useState('');
  const [role, setRole] = useState('Padre');
  const [systemRole, setSystemRole] = useState<SystemRole>('editor');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [monthlyContribution, setMonthlyContribution] = useState('0');
  const [avatarColor, setAvatarColor] = useState('#007AFF');
  const [isMainEarner, setIsMainEarner] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [notes, setNotes] = useState('');

  // Variables form states
  const [householdName, setHouseholdName] = useState(household.name);
  const [baseCurrency, setBaseCurrency] = useState<CurrencyCode>(household.currency);
  const [cycleStartDay, setCycleStartDay] = useState(household.budgetCycleStartDay || 1);
  const [emergencyMonths, setEmergencyMonths] = useState(household.variables?.emergencyFundMonths || 6);
  const [targetSavingsRate, setTargetSavingsRate] = useState(household.variables?.targetSavingsRate || 20);
  const [alertThreshold, setAlertThreshold] = useState(household.variables?.alertThresholdPercent || 80);
  const [defaultMethod, setDefaultMethod] = useState<PaymentMethod>(
    household.variables?.defaultPaymentMethod || 'Transferencia bancaria'
  );
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  const [customCategories, setCustomCategories] = useState<string[]>(
    household.variables?.customCategories || ['Educación complementaria', 'Mascotas', 'Tecnología']
  );

  const [savedFeedback, setSavedFeedback] = useState(false);

  const handleOpenEditMember = (m: FamilyMember) => {
    setEditingMember(m);
    setIsCreatingMember(false);
    setName(m.name);
    setRole(m.role);
    setSystemRole(m.systemRole || (m.role.toLowerCase().includes('hijo') ? 'viewer' : 'editor'));
    setPhone(m.phone || '');
    setEmail(m.email || '');
    setBiometricEnabled(m.biometricEnabled !== false);
    setMonthlyContribution((m.monthlyContribution || 0).toString());
    setAvatarColor(m.avatarColor || '#007AFF');
    setIsMainEarner(Boolean(m.isMainEarner));
    setIsActive(m.isActive !== false);
    setNotes(m.notes || '');
  };

  const handleOpenCreateMember = () => {
    setEditingMember(null);
    setIsCreatingMember(true);
    setName('');
    setRole('Hijo/a');
    setSystemRole('editor');
    setPhone('');
    setEmail('');
    setBiometricEnabled(true);
    setMonthlyContribution('0');
    setAvatarColor('#AF52DE');
    setIsMainEarner(false);
    setIsActive(true);
    setNotes('');
  };

  const handleSaveMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const parsedContribution = parseFloat(monthlyContribution) || 0;

    if (isCreatingMember) {
      const newM: FamilyMember = {
        id: `mem-${Date.now()}`,
        name: name.trim(),
        role: role.trim(),
        systemRole,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        biometricEnabled,
        monthlyContribution: parsedContribution,
        avatarColor,
        isMainEarner,
        isActive,
        notes: notes.trim(),
      };
      onUpdateMembers([...members, newM]);
    } else if (editingMember) {
      const updated = members.map((m) =>
        m.id === editingMember.id
          ? {
              ...m,
              name: name.trim(),
              role: role.trim(),
              systemRole,
              phone: phone.trim() || undefined,
              email: email.trim() || undefined,
              biometricEnabled,
              monthlyContribution: parsedContribution,
              avatarColor,
              isMainEarner,
              isActive,
              notes: notes.trim(),
            }
          : m
      );
      onUpdateMembers(updated);
    }

    setEditingMember(null);
    setIsCreatingMember(false);
  };

  const handleDeleteMember = (id: string) => {
    if (members.length <= 1) {
      alert('Debe existir al menos un integrante en el hogar.');
      return;
    }
    if (confirm('¿Eliminar este usuario del presupuesto familiar?')) {
      onUpdateMembers(members.filter((m) => m.id !== id));
      setEditingMember(null);
    }
  };

  const handleSaveVariables = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedVariables: HouseholdVariables = {
      emergencyFundMonths: Number(emergencyMonths),
      targetSavingsRate: Number(targetSavingsRate),
      alertThresholdPercent: Number(alertThreshold),
      defaultPaymentMethod: defaultMethod,
      customCategories,
    };

    onUpdateHousehold({
      ...household,
      name: householdName,
      currency: baseCurrency,
      budgetCycleStartDay: Number(cycleStartDay),
      variables: updatedVariables,
    });

    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 3000);
  };

  const handleAddCategory = () => {
    if (customCategoryInput.trim() && !customCategories.includes(customCategoryInput.trim())) {
      setCustomCategories([...customCategories, customCategoryInput.trim()]);
      setCustomCategoryInput('');
    }
  };

  const handleRemoveCategory = (cat: string) => {
    setCustomCategories(customCategories.filter((c) => c !== cat));
  };

  const COLOR_PALETTE = ['#007AFF', '#34C759', '#AF52DE', '#FF9500', '#FF2D55', '#5856D6', '#00C7BE', '#FF3B30'];

  return (
    <div className="space-y-6 pb-32 sm:pb-24 animate-in fade-in duration-300">
      {/* Title & Description */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            {t('gestion_usuarios_vars')}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t('gestion_usuarios_desc')}
          </p>
        </div>

        {/* Sub-tab switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <button
            onClick={() => setActiveSubTab('users')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'users'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>{t('seccion_usuarios')} ({members.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('variables')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'variables'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{t('seccion_variables')}</span>
          </button>
        </div>
      </div>

      {/* SUBTAB 1: USERS MANAGEMENT */}
      {activeSubTab === 'users' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Perfiles de los integrantes y responsables económicos del hogar
            </span>
            <button
              onClick={handleOpenCreateMember}
              className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-xs"
            >
              <UserPlus className="w-4 h-4" />
              <span>{t('crear_usuario')}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {members.map((member) => (
              <div
                key={member.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 relative group hover:border-blue-400 dark:hover:border-blue-500 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-bold text-base shadow-sm shrink-0"
                      style={{ backgroundColor: member.avatarColor || '#007AFF' }}
                    >
                      {member.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          {member.name}
                        </h4>
                        {member.systemRole === 'superadmin' ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                            Super Admin
                          </span>
                        ) : member.systemRole === 'admin' ? (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                            Admin
                          </span>
                        ) : member.systemRole === 'viewer' ? (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            Viewer
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                            Editor
                          </span>
                        )}

                        {member.isMainEarner && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                            Perceptor Principal
                          </span>
                        )}
                        {member.isActive === false && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                            Inactivo
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        <span>{member.role}</span>
                        {member.phone && (
                          <>
                            <span>·</span>
                            <span>Tel: {member.phone}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditMember(member)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      title={t('editar_usuario')}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteMember(member.id)}
                      disabled={members.length <= 1 || member.systemRole === 'superadmin'}
                      className="p-1.5 text-slate-400 hover:text-rose-500 disabled:opacity-30 transition-colors"
                      title={t('eliminar_usuario')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[11px] text-slate-400 block">{t('correo_o_id')}</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300 truncate block">
                      {member.email || member.phone || 'No especificado'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block">{t('ingreso_mensual_estimado')}</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 tabular-nums block">
                      {format(member.monthlyContribution || 0)}
                    </span>
                  </div>
                </div>

                {member.notes && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 italic pt-1 border-t border-slate-100 dark:border-slate-800/60">
                    "{member.notes}"
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 2: HOUSEHOLD FINANCIAL VARIABLES */}
      {activeSubTab === 'variables' && (
        <form onSubmit={handleSaveVariables} className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-500" />
              Parámetros Financieros del Hogar
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  {t('nombre_hogar')}
                </label>
                <input
                  type="text"
                  required
                  value={householdName}
                  onChange={(e) => setHouseholdName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  {t('moneda_base')}
                </label>
                <select
                  value={baseCurrency}
                  onChange={(e) => setBaseCurrency(e.target.value as CurrencyCode)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                >
                  {Object.values(SUPPORTED_CURRENCIES).map((curr) => (
                    <option key={curr.code} value={curr.code}>
                      {curr.name} ({curr.symbol})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  {t('dia_inicio_ciclo')}
                </label>
                <input
                  type="number"
                  min="1"
                  max="28"
                  required
                  value={cycleStartDay}
                  onChange={(e) => setCycleStartDay(parseInt(e.target.value, 10) || 1)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                />
                <span className="text-[10px] text-slate-400 block mt-1">
                  Día en que se reinicia el período contable (ej. día 1 o 15).
                </span>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  {t('metodo_pago_defecto')}
                </label>
                <select
                  value={defaultMethod}
                  onChange={(e) => setDefaultMethod(e.target.value as PaymentMethod)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                >
                  <option value="Transferencia bancaria">Transferencia bancaria</option>
                  <option value="Tarjeta de débito">Tarjeta de débito</option>
                  <option value="Tarjeta de crédito">Tarjeta de crédito</option>
                  <option value="Domiciliación bancaria">Domiciliación bancaria</option>
                  <option value="Efectivo">Efectivo</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  {t('meses_fondo_emergencia')}
                </label>
                <input
                  type="number"
                  min="1"
                  max="24"
                  value={emergencyMonths}
                  onChange={(e) => setEmergencyMonths(parseInt(e.target.value, 10) || 6)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                />
                <span className="text-[10px] text-slate-400 block mt-1">
                  Sugerido: 6 meses de gastos fijos.
                </span>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  {t('tasa_objetivo_ahorro')}
                </label>
                <input
                  type="number"
                  min="5"
                  max="80"
                  value={targetSavingsRate}
                  onChange={(e) => setTargetSavingsRate(parseFloat(e.target.value) || 20)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                />
                <span className="text-[10px] text-slate-400 block mt-1">
                  Meta recomendada: 20% a 30%.
                </span>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  {t('umbral_alerta')}
                </label>
                <input
                  type="number"
                  min="50"
                  max="95"
                  value={alertThreshold}
                  onChange={(e) => setAlertThreshold(parseFloat(e.target.value) || 80)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                />
                <span className="text-[10px] text-slate-400 block mt-1">
                  Alcanzado este % se emite alerta preventiva.
                </span>
              </div>
            </div>

            {/* Custom categories */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                Categorías Adicionales Personalizadas
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="ej: Guardería canina, Gimnasio, Cursos..."
                  value={customCategoryInput}
                  onChange={(e) => setCustomCategoryInput(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={handleAddCategory}
                  className="px-3 py-1.5 text-xs font-semibold bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 rounded-xl transition-colors"
                >
                  Añadir
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {customCategories.map((cat) => (
                  <span
                    key={cat}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                  >
                    <span>{cat}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCategory(cat)}
                      className="text-slate-400 hover:text-rose-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              {savedFeedback ? (
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Check className="w-4 h-4" />
                  {t('variables_actualizadas')}
                </span>
              ) : (
                <span />
              )}

              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                {t('guardar_variables')}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Edit or Create Member Modal */}
      {(editingMember || isCreatingMember) && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 overflow-y-auto">
          <form
            onSubmit={handleSaveMember}
            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-[32px] sm:rounded-3xl p-5 sm:p-6 shadow-2xl border-t sm:border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto pb-safe"
          >
            {/* iOS grab handle */}
            <div className="flex justify-center -mt-1 mb-1 sm:hidden">
              <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {isCreatingMember ? t('crear_usuario') : `${t('editar_usuario')}: ${editingMember?.name}`}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setEditingMember(null);
                  setIsCreatingMember(false);
                }}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                {t('nombre_completo')}
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  {t('rol_familiar')}
                </label>
                <input
                  type="text"
                  required
                  placeholder="ej: Padre, Madre, Hijo"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  {t('rol_sistema')}
                </label>
                <select
                  value={systemRole}
                  onChange={(e) => setSystemRole(e.target.value as SystemRole)}
                  className="w-full px-2.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                >
                  <option value="superadmin">{t('rol_superadmin')}</option>
                  <option value="admin">{t('rol_admin')}</option>
                  <option value="editor">{t('rol_editor')}</option>
                  <option value="viewer">{t('rol_viewer')}</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  {t('telefono')}
                </label>
                <input
                  type="tel"
                  placeholder="+1 555-0100"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  {t('ingreso_mensual_estimado')} ({currencyCode})
                </label>
                <input
                  type="number"
                  step="50"
                  min="0"
                  value={monthlyContribution}
                  onChange={(e) => setMonthlyContribution(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                {t('correo_o_id')}
              </label>
              <input
                type="email"
                placeholder="ejemplo@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            {/* Avatar Color Picker */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                {t('color_avatar')}
              </label>
              <div className="flex items-center gap-2">
                {COLOR_PALETTE.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setAvatarColor(c)}
                    className={`w-7 h-7 rounded-full border transition-transform ${
                      avatarColor === c ? 'scale-115 ring-2 ring-blue-500' : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            {/* Checkboxes: Main earner, Biometric, and Active */}
            <div className="pt-2 space-y-2">
              <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isMainEarner}
                  onChange={(e) => setIsMainEarner(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-0"
                />
                <span>{t('es_perceptor_principal')}</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={biometricEnabled}
                  onChange={(e) => setBiometricEnabled(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-0"
                />
                <span>{t('acceso_biometrico_usuario')}</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-0"
                />
                <span>{t('usuario_activo')}</span>
              </label>
            </div>

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

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setEditingMember(null);
                  setIsCreatingMember(false);
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700"
              >
                {t('cancelar')}
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl"
              >
                {t('guardar_usuario')}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
