import React from 'react';
import { Globe } from 'lucide-react';

export const STT_SPOKEN_LANGUAGES = [
  { code: 'AUTO', label: 'Auto Detect', native: 'Auto' },
  { code: 'EN', label: 'English', native: 'English' },
  { code: 'HI', label: 'Hindi', native: 'हिन्दी' },
  { code: 'BN', label: 'Bengali', native: 'বাংলা' },
  { code: 'MR', label: 'Marathi', native: 'मराठी' },
  { code: 'TE', label: 'Telugu', native: 'తెలుగు' },
  { code: 'TA', label: 'Tamil', native: 'தமிழ்' },
  { code: 'GU', label: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'UR', label: 'Urdu', native: 'اردو' },
  { code: 'KN', label: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'OR', label: 'Odia', native: 'ଓଡ଼ିଆ' },
  { code: 'ML', label: 'Malayalam', native: 'മലയാളം' },
  { code: 'PA', label: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  { code: 'AS', label: 'Assamese', native: 'অসমীয়া' },
  { code: 'SAT', label: 'Santali', native: 'ᱥᱟᱱᱛᱟᱲᱤ' },
  { code: 'KS', label: 'Kashmiri', native: 'कॉशुर' },
  { code: 'MNI', label: 'Manipuri', native: 'মৈতৈলোন' },
  { code: 'DOI', label: 'Dogri', native: 'डोगरी' },
  { code: 'BHO', label: 'Bhojpuri', native: 'भोजपुरी' },
];

export function SpokenLanguageSelector({ value, onChange, className = '' }) {
  return (
    <div className={`inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 px-2 py-1 rounded-md shadow-sm ${className}`}>
      <Globe className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
      <span className="font-medium text-[11px] text-slate-500 dark:text-slate-400 hidden sm:inline select-none">Spoken:</span>
      <select
        value={value || 'AUTO'}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent border-none text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none cursor-pointer p-0 pr-1"
        title="Select language you will speak into the microphone"
      >
        {STT_SPOKEN_LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 py-1">
            {lang.label} ({lang.native})
          </option>
        ))}
      </select>
    </div>
  );
}
