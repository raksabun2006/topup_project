import { Link } from 'react-router-dom';
import { Home, Hammer } from 'lucide-react';

/**
 * កន្លែងដាក់បណ្តោះអាសន្នសម្រាប់ទំព័រដែលមិនទាន់សាងសង់។
 * អនុញ្ញាតឱ្យគ្រប់ route នាំផ្លូវបានដោយមិនគាំង ខណៈកំពុងសាងសង់ម្តងមួយៗ។
 */
export default function ComingSoon({ title, detail }) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <Hammer size={28} className="text-emerald-600 dark:text-emerald-400" />
      </div>
      <h1 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">{title}</h1>
      <p className="mt-2 max-w-sm text-slate-500 dark:text-slate-400">
        ទំព័រនេះកំពុងសាងសង់។
        {detail && <><br />{detail}</>}
      </p>

      <Link
        to="/"
        className="mt-8 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-medium text-white shadow-sm transition hover:bg-emerald-500"
      >
        <Home size={18} />
        ទំព័រដើម
      </Link>
    </div>
  );
}
