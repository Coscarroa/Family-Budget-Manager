import React, { useState } from 'react';
import {
  X,
  FileCode2,
  Copy,
  Check,
  Download,
  BookOpen,
  Layers,
  Code2,
  TestTube2,
  Terminal,
} from 'lucide-react';
import { SWIFT_ARCHITECTURE_FILES, SwiftFileDoc } from '../data/swiftArchitectureDocs';

interface SwiftArchitectureModalProps {
  onClose: () => void;
}

export const SwiftArchitectureModal: React.FC<SwiftArchitectureModalProps> = ({ onClose }) => {
  const [selectedFileId, setSelectedFileId] = useState<string>(SWIFT_ARCHITECTURE_FILES[0].id);
  const [copied, setCopied] = useState(false);

  const currentFile =
    SWIFT_ARCHITECTURE_FILES.find((f) => f.id === selectedFileId) || SWIFT_ARCHITECTURE_FILES[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([currentFile.code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = currentFile.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center sm:items-center bg-black/80 backdrop-blur-md p-2 sm:p-6 overflow-y-auto">
      <div className="w-full sm:max-w-5xl h-[92vh] sm:h-[85vh] bg-slate-950 text-white rounded-t-[32px] sm:rounded-3xl shadow-2xl border border-slate-800 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
              <FileCode2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Entregables Swift 6 & Xcode</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                  SwiftUI · SwiftData · MVVM
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Arquitectura, modelos entidad-relación, servicios puros, pruebas unitarias y guía de compilación.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copiado</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar Código</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area: Sidebar + Code Viewer */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Sidebar */}
          <div className="w-full md:w-72 bg-slate-900/60 border-b md:border-b-0 md:border-r border-slate-800 p-3 space-y-1 overflow-y-auto shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 py-1.5 block">
              Documentos & Fuentes
            </span>
            {SWIFT_ARCHITECTURE_FILES.map((file) => {
              const isSelected = file.id === selectedFileId;
              return (
                <button
                  key={file.id}
                  onClick={() => setSelectedFileId(file.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {file.category === 'architecture' && <Layers className="w-3.5 h-3.5 shrink-0" />}
                    {file.category === 'models' && <Code2 className="w-3.5 h-3.5 shrink-0 text-emerald-400" />}
                    {file.category === 'services' && <Code2 className="w-3.5 h-3.5 shrink-0 text-indigo-400" />}
                    {file.category === 'viewmodels' && <Code2 className="w-3.5 h-3.5 shrink-0 text-purple-400" />}
                    {file.category === 'tests' && <TestTube2 className="w-3.5 h-3.5 shrink-0 text-amber-400" />}
                    <span className="truncate">{file.filename}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Code Viewer */}
          <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
            {/* File Path & Description Bar */}
            <div className="px-5 py-2.5 bg-slate-900/40 border-b border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-mono">
              <span className="text-slate-300">{currentFile.path}</span>
              <span className="text-[11px] text-slate-500 font-sans hidden sm:inline">
                {currentFile.description}
              </span>
            </div>

            {/* Code Content */}
            <div className="flex-1 p-5 overflow-auto font-mono text-xs text-slate-200 leading-relaxed whitespace-pre select-text">
              {currentFile.code}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
