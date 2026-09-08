import { Link } from 'react-router-dom';
import { Layers, ArrowRight, Package, Sparkles } from 'lucide-react';
import { useCategories } from '../hooks/useCategories';
import { getCategoryIcon } from '../utils/categoryIcons';
import SEO from '../components/SEO';

export default function Categories() {
  const { categories, loading } = useCategories();

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 pb-20">
      <SEO
        title="Browse Grocery & Lifestyle Categories | Mart System Cambodia"
        description="Explore fresh vegetables, drinks, meat, dairy, snacks, and everyday items organized by category in Mart System Online Store with $1.50 express delivery."
        keywords="Mart Categories, Grocery Categories Cambodia, Drinks, Snacks, Fresh Food Phnom Penh, Online Mart Catalog"
        canonical="/categories"
        ogImage="/mart.jpg"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Categories', url: '/categories' },
        ]}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          'name': 'Browse Grocery & Lifestyle Categories | Mart System Cambodia',
          'description': 'Explore fresh vegetables, drinks, meat, dairy, snacks, and everyday items organized by category in Mart System Online Store.',
          'url': 'https://martsystemkh.software/categories',
        }}
      />

      <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12 space-y-10">
        {/* Header Title */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-800 px-3.5 py-1 text-xs font-bold text-slate-700 dark:text-slate-300">
            <Layers size={14} className="text-emerald-600" />
            <span>Store Catalog</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Browse by Category
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
            Explore everyday essentials, fresh groceries, drinks, and snacks organized for fast shopping.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6 animate-pulse">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-square rounded-3xl bg-slate-100 dark:bg-slate-800" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
            {categories.map((cat) => {
              const catName = typeof cat === 'string' ? cat : cat?.name;
              const catId = typeof cat === 'string' ? cat : cat?.id || catName;
              if (!catName) return null;
              const Icon = getCategoryIcon(catName);

              return (
                <Link
                  key={catId}
                  to={`/shop?category=${encodeURIComponent(catName)}`}
                  className="group relative flex flex-col items-center justify-center gap-4 rounded-3xl bg-[#F7F7F8] dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-6 sm:p-8 text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer"
                >
                  <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs group-hover:scale-110 transition-transform">
                    <Icon size={32} />
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
                      {catName}
                    </h3>
                    <p className="text-xs font-semibold text-slate-400 flex items-center justify-center gap-1 group-hover:text-slate-700 dark:group-hover:text-slate-200">
                      <span>Explore products</span>
                      <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
