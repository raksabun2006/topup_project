import { useState } from 'react';
import { Calendar, Check } from 'lucide-react';
import { DATE_PRESETS, getDateRangeForPreset, formatToDateString } from '../../utils/dateFilter';

export default function ReportDateFilter({
  currentPreset = 'today',
  fromDate = '',
  toDate = '',
  onChange,
  className = '',
}) {
  const [selectedPreset, setSelectedPreset] = useState(currentPreset);
  const [customFrom, setCustomFrom] = useState(fromDate || formatToDateString(new Date()));
  const [customTo, setCustomTo] = useState(toDate || formatToDateString(new Date()));

  const handleSelectPreset = (presetId) => {
    setSelectedPreset(presetId);
    if (presetId !== 'custom') {
      const range = getDateRangeForPreset(presetId);
      setCustomFrom(range.from);
      setCustomTo(range.to);
      if (onChange) {
        onChange({ preset: presetId, from: range.from, to: range.to });
      }
    }
  };

  const handleCustomApply = () => {
    if (onChange) {
      onChange({ preset: 'custom', from: customFrom, to: customTo });
    }
  };

  return (
    <div className={`flex flex-col gap-2.5 sm:gap-3 ${className}`}>
      {/* Preset Pills */}
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
        {DATE_PRESETS.map((preset) => {
          const isActive = selectedPreset === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleSelectPreset(preset.id)}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all active:scale-95 cursor-pointer ${
                isActive
                  ? 'bg-[#009F6B] text-white shadow-xs'
                  : 'border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-[#667085] dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-[#172033] dark:hover:text-white'
              }`}
            >
              {isActive && <Check size={12} />}
              <span>{preset.label}</span>
            </button>
          );
        })}
      </div>

      {/* Custom Range Picker */}
      {selectedPreset === 'custom' && (
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 shadow-2xs animate-fade-in">
          <div className="flex items-center gap-1.5 text-xs text-[#667085] dark:text-slate-400">
            <Calendar size={14} className="text-[#009F6B]" />
            <span className="font-semibold">ចាប់ពី៖</span>
          </div>
          <input
            type="date"
            value={customFrom}
            onChange={(e) => setCustomFrom(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 text-xs font-semibold text-[#172033] dark:text-white focus:border-[#009F6B] focus:outline-none"
          />

          <span className="text-xs text-[#667085] dark:text-slate-400 font-semibold">ដល់៖</span>
          <input
            type="date"
            value={customTo}
            onChange={(e) => setCustomTo(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 text-xs font-semibold text-[#172033] dark:text-white focus:border-[#009F6B] focus:outline-none"
          />

          <button
            type="button"
            onClick={handleCustomApply}
            className="rounded-xl bg-[#009F6B] px-3 py-1 text-xs font-bold text-white shadow-2xs hover:bg-[#00845A] transition active:scale-95 cursor-pointer"
          >
            អនុវត្ត
          </button>
        </div>
      )}
    </div>
  );
}
