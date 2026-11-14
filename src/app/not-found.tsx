import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
      <h2 className="text-3xl font-black text-[#0f1f38] mb-2">Page Not Found</h2>
      <p className="text-slate-600 text-sm mb-6">Could not find requested resource on LPU Residences.</p>
      <Link
        href="/"
        className="bg-[#f37021] text-white px-6 py-2.5 rounded-xl font-bold text-xs"
      >
        Return to Home
      </Link>
    </div>
  );
}

