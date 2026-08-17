import { Hammer } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ComingSoon({ title, detail }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center bg-white px-4 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-indigo-50">
        <Hammer size={36} className="text-indigo-600" />
      </div>
      <h2 className="mb-2 text-2xl font-bold text-slate-900">{title}</h2>
      <p className="mb-8 max-w-md text-slate-500">{detail}</p>
      
      <Link
        to="/"
        className="rounded-lg bg-indigo-600 px-6 py-2.5 font-medium text-white shadow-sm transition hover:bg-indigo-700"
      >
        ត្រឡប់ទៅទំព័រដើម
      </Link>
    </div>
  );
}