import React, { useState } from 'react';
import {
  X,
  Settings,
  Users,
  Coins,
  Shield,
  Download,
  Upload,
  RotateCcw,
  Plus,
  Trash2,
  Check,
  Lock,
} from 'lucide-react';
import {
  Household,
  FamilyMember,
  CurrencyCode,
  SUPPORTED_CURRENCIES,
} from '../types/finance';

interface SettingsAndFamilyModalProps {
  household: Household;
  members: FamilyMember[];
  onClose: () => void;
  onUpdateHousehold: (updated: Household) => void;
  onUpdateMembers: (members: FamilyMember[]) => void;
  onExportJSON: () => void;
  onImportJSON: (jsonString: string) => void;
  onResetToDemo: () => void;
}

export const SettingsAndFamilyModal: React.FC<SettingsAndFamilyModalProps> = ({
  household,
  members,
  onClose,
  onUpdateHousehold,
  onUpdateMembers,
  onExportJSON,
  onImportJSON,
  onResetToDemo,
}) => {
  const [activeTab, setActiveTab] = useState<'household' | 'members' | 'security' | 'backup'>('household');

  // Household fields
  const [name, setName] = useState(household.name);
  const [currency, setCurrency] = useState<CurrencyCode>(household.currency);
  const [budgetCycleStartDay, setBudgetCycleStartDay] = useState(household.budgetCycleStartDay);
  const [pinProtected, setPinProtected] = useState(household.pinProtected);
  const [pinCode, setPinCode] = useState(household.pinCode || '1234');

  // New member inputs
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('Hijo/a');
  const [newMemberColor, setNewMemberColor] = useState('#007AFF');

  const handleSaveHousehold = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateHousehold({
      ...household,
      name,
      currency,
      budgetCycleStartDay,
      pinProtected,
      pinCode,
    });
    onClose();
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;

    const newMember: FamilyMember = {
      id: `mem-${Date.now()}`,
      name: newMemberName.trim(),
      role: newMemberRole,
      avatarColor: newMemberColor,
      isMainEarner: false,
    };

    onUpdateMembers([...members, newMember]);
    setNewMemberName('');
  };

  const handleDeleteMember = (id: string) => {
    if (members.length <= 1) return;
    onUpdateMembers(members.filter((m) => m.id !== id));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
          onImportJSON(content);
          onClose();
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Configuración y Familia
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('household')}
            className={`py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'household'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Hogar
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'members'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Miembros ({members.length})
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'security'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Seguridad
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            className={`py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'backup'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Copias
          </button>
        </div>

        {/* TAB 1: Household settings */}
        {activeTab === 'household' && (
          <form onSubmit={handleSaveHousehold} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Nombre del Hogar o Familia
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Moneda Predeterminada
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                {Object.values(SUPPORTED_CURRENCIES).map((curr) => (
                  <option key={curr.code} value={curr.code}>
                    {curr.name} ({curr.symbol})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Día de Inicio del Período Presupuestario
              </label>
              <input
                type="number"
                min="1"
                max="28"
                value={budgetCycleStartDay}
                onChange={(e) => setBudgetCycleStartDay(parseInt(e.target.value, 10) || 1)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
              <span className="text-[11px] text-slate-400 block mt-1">
                Día en que se reinicia el cómputo mensual (habitualmente día 1 o día 15 de nómina).
              </span>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl"
              >
                Guardar Ajustes
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: Family Members */}
        {activeTab === 'members' && (
          <div className="space-y-4 text-xs">
            {/* List of members */}
            <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar">
              {members.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-3.5 h-3.5 rounded-full inline-block"
                      style={{ backgroundColor: m.avatarColor }}
                    />
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white block">
                        {m.name}
                      </span>
                      <span className="text-[11px] text-slate-400">{m.role}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteMember(m.id)}
                    disabled={members.length <= 1}
                    className="p-1 text-slate-400 hover:text-rose-500 disabled:opacity-30"
                    title="Eliminar miembro"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add member form */}
            <form onSubmit={handleAddMember} className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
              <span className="font-bold text-slate-900 dark:text-white block">
                Añadir Integrante Familiar
              </span>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  placeholder="Nombre..."
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                />
                <input
                  type="text"
                  required
                  placeholder="Rol (ej: Padre, Madre, Hijo)..."
                  value={newMemberRole}
                  onChange={(e) => setNewMemberRole(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-slate-500">Color:</span>
                  {['#007AFF', '#34C759', '#AF52DE', '#FF9500', '#FF2D55', '#5856D6'].map((c) => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => setNewMemberColor(c)}
                      className={`w-4 h-4 rounded-full border ${
                        newMemberColor === c ? 'ring-2 ring-blue-500' : ''
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs"
                >
                  Añadir
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 3: Security & Face ID */}
        {activeTab === 'security' && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">
                    Protección Biométrica / Face ID
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Bloquea el acceso al abrir la aplicación o cambiar de pestaña.
                  </span>
                </div>

                <input
                  type="checkbox"
                  checked={pinProtected}
                  onChange={(e) => setPinProtected(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-0 w-4 h-4"
                />
              </div>

              {pinProtected && (
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Código PIN de Respaldo (4 dígitos)
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value)}
                    className="w-32 px-3 py-1.5 text-center text-sm font-mono tracking-widest rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => {
                  onUpdateHousehold({ ...household, pinProtected, pinCode });
                  onClose();
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl"
              >
                Aplicar Seguridad
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: Backup & Demo */}
        {activeTab === 'backup' && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 space-y-2">
              <span className="font-bold text-slate-900 dark:text-white block">
                Copia de Seguridad del Hogar
              </span>
              <p className="text-slate-500 text-[11px]">
                Descarga un archivo JSON cifrado con todo el histórico de transacciones, gastos fijos y presupuestos.
              </p>
              <button
                onClick={onExportJSON}
                className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100"
              >
                <Download className="w-3.5 h-3.5 text-blue-500" />
                <span>Exportar Base de Datos (JSON)</span>
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 space-y-2">
              <span className="font-bold text-slate-900 dark:text-white block">
                Restaurar Copia de Seguridad
              </span>
              <p className="text-slate-500 text-[11px]">
                Carga un archivo de respaldo previo para sustituir los registros locales.
              </p>
              <label className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 cursor-pointer w-fit">
                <Upload className="w-3.5 h-3.5 text-emerald-500" />
                <span>Seleccionar Archivo JSON</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-900/60 space-y-2">
              <span className="font-bold text-rose-800 dark:text-rose-200 block">
                Restablecer a Datos de Demostración
              </span>
              <p className="text-rose-600/80 text-[11px]">
                Recarga los datos de ejemplo (Familia Rivera Gómez, salarios, hipoteca y gastos preconfigurados).
              </p>
              <button
                onClick={() => {
                  if (window.confirm('¿Seguro que deseas reiniciar los datos a la demostración inicial?')) {
                    onResetToDemo();
                    onClose();
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restablecer Demostración</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
