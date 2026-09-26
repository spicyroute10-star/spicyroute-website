import React from 'react';
import { ArrowLeft, ShieldCheck, FileText } from 'lucide-react';

export default function BlankLegalPage({ title, onBack }) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-black text-rose-600 hover:text-rose-700 bg-rose-50 px-4 py-2 rounded-xl border border-rose-200"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Profile
      </button>

      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-200 shadow-sm text-center space-y-6">
        <div className="w-16 h-16 bg-rose-50 rounded-2xl mx-auto flex items-center justify-center text-rose-600 border border-rose-100">
          <FileText className="w-8 h-8" />
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">{title}</h1>
          <p className="text-xs font-semibold text-gray-400 mt-1">Spice Route Official Legal Document</p>
        </div>

        {/* Blank content space for user to fill later */}
        <div className="min-h-[300px] border-2 border-dashed border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center text-gray-400 space-y-2">
          <ShieldCheck className="w-10 h-10 text-gray-300" />
          <p className="text-sm font-bold text-gray-500">Document Content Reserved</p>
          <p className="text-xs font-medium text-gray-400 max-w-sm">
            This space is left blank for you to insert your official {title} content.
          </p>
        </div>
      </div>
    </div>
  );
}
