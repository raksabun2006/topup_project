import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Code2,
  Server,
  Database,
  Layers,
  Sparkles,
  Mail,
  Send,
  CheckCircle2,
  ArrowRight,
  ShoppingBag,
  CreditCard,
  Bell,
  Box,
  Terminal,
  ExternalLink,
  Laptop,
  Check,
  Copy,
  MapPin,
  Lock,
  Workflow,
  Lightbulb,
  GraduationCap,
  Calendar,
  Award
} from 'lucide-react';
import SEO from '../components/SEO';

function GithubIcon({ size = 16, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

// Official authentic tech logos for visual excellence
function TechLogo({ name, className = 'h-3.5 w-3.5 shrink-0' }) {
  switch (name) {
    case 'Java':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none">
          <path d="M7 19.5c3.5 1 7.5 1 10 0M5 22c5 1.5 11 1.5 14 0" stroke="#E76F00" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M12 3c-1.5 2.5 1.5 4 0 7-1.5 3 0 4-1 6" stroke="#5382A1" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M15 4c-1 2 1 3 0 5-1 2 0 3-1 5" stroke="#E76F00" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case 'Spring Boot':
    case 'Spring Security':
      return (
        <img
          src="/images/springboot.png"
          alt="Spring Boot"
          className={`${className} object-contain`}
          onError={(e) => {
            e.currentTarget.src = '/springboot.png';
          }}
        />
      );
    case 'RESTful APIs':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none">
          <rect x="2" y="5" width="20" height="14" rx="3" stroke="#F59E0B" strokeWidth="1.8" />
          <path d="M6 12h4m4 0h4M10 9l3 3-3 3" stroke="#F59E0B" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'PostgreSQL':
      return (
        <img
          src="/images/postgresql.png"
          alt="PostgreSQL"
          className={`${className} object-contain`}
          onError={(e) => {
            e.currentTarget.src = '/postgresql.png';
          }}
        />
      );
    case 'JPA / Hibernate':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none">
          <ellipse cx="12" cy="6" rx="8" ry="3" fill="#BCAE79" opacity="0.2" stroke="#BCAE79" strokeWidth="1.7" />
          <path d="M4 6v6c0 1.66 3.58 3 8 3s8-1.34 8-3V6" stroke="#59666C" strokeWidth="1.7" />
          <path d="M4 12v6c0 1.66 3.58 3 8 3s8-1.34 8-3v-6" stroke="#BCAE79" strokeWidth="1.7" />
        </svg>
      );
    case 'MinIO Object Storage':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none">
          <path d="M3 17l9-5 9 5-9 5-9-5z" fill="#C72C48" opacity="0.3" stroke="#C72C48" strokeWidth="1.7" />
          <path d="M3 12l9-5 9 5M3 7l9-5 9 5" stroke="#C72C48" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'React':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none">
          <circle cx="12" cy="12" r="2.2" fill="#61DAFB" />
          <ellipse cx="12" cy="12" rx="10" ry="4" stroke="#61DAFB" strokeWidth="1.6" />
          <ellipse cx="12" cy="12" rx="10" ry="4" stroke="#61DAFB" strokeWidth="1.6" transform="rotate(60 12 12)" />
          <ellipse cx="12" cy="12" rx="10" ry="4" stroke="#61DAFB" strokeWidth="1.6" transform="rotate(120 12 12)" />
        </svg>
      );
    case 'JavaScript (ES6+)':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none">
          <rect width="24" height="24" rx="4" fill="#F7DF1E" />
          <path d="M7 17.5c0 1.5.8 2 2 2 1.5 0 2-1 2-2.5V11h-1.8" stroke="#000" strokeWidth="1.7" strokeLinecap="round" />
          <path d="M14.5 17c.5 1.5 1.8 2 3.2 2 1.8 0 2.8-1 2.8-2.2 0-1.5-1.2-2-2.5-2.5-1.2-.5-1.8-1-1.8-1.8 0-1 .8-1.5 2-1.5 1.2 0 1.8.5 2.2 1.5" stroke="#000" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      );
    case 'Tailwind CSS':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none">
          <path d="M6 12c.5-2 2-3 4-3 2.5 0 3 2 4.5 2 1.5 0 2.5-1 3.5-2.5-1 2-2.5 3-4.5 3-2.5 0-3-2-4.5-2-1.5 0-2.5 1-3 2.5zm-4 5c.5-2 2-3 4-3 2.5 0 3 2 4.5 2 1.5 0 2.5-1 3.5-2.5-1 2-2.5 3-4.5 3-2.5 0-3-2-4.5-2-1.5 0-2.5 1-3 2.5z" fill="#06B6D4" stroke="#06B6D4" strokeWidth="0.5" />
        </svg>
      );
    case 'Vite':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none">
          <path d="M21.5 4.5L12.5 21 3 4.5h18.5z" fill="#646CFF" opacity="0.2" />
          <path d="M21.5 4.5L12.5 21 3 4.5" stroke="#646CFF" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M14 3l-5.5 8.5H13L10.5 18 17 9.5h-4.5L14 3z" fill="#FFD62E" stroke="#FFD62E" strokeWidth="0.5" />
        </svg>
      );
    case 'Bakong KHQR Payments':
      return (
        <img
          src="/images/bakong.png"
          alt="Bakong"
          className={`${className} object-contain rounded-xs`}
          onError={(e) => {
            e.currentTarget.src = '/bakong.png';
          }}
        />
      );
    case 'Telegram Bot API':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none">
          <circle cx="12" cy="12" r="10" fill="#24A1DE" />
          <path d="M5.5 12l13-5-3.5 12-4-3.5-2.5 2.5V14.5L15 10l-7.5 4z" fill="#FFF" />
        </svg>
      );
    case 'JWT Authentication':
      return (
        <img
          src="/images/jwt.png"
          alt="JWT"
          className={`${className} object-contain`}
          onError={(e) => {
            e.currentTarget.src = '/jwt.png';
          }}
        />
      );
    case 'Docker':
      return (
        <img
          src="/images/docker.png"
          alt="Docker"
          className={`${className} object-contain`}
          onError={(e) => {
            e.currentTarget.src = '/docker.png';
          }}
        />
      );
    case 'Railway Cloud':
      return (
        <img
          src="/images/railway.png"
          alt="Railway"
          className={`${className} object-contain rounded-full`}
          onError={(e) => {
            e.currentTarget.src = '/railway.png';
          }}
        />
      );
    case 'Git / GitHub Workflow':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none">
          <circle cx="6" cy="6" r="2.5" stroke="#F05032" strokeWidth="1.8" />
          <circle cx="18" cy="8" r="2.5" stroke="#F05032" strokeWidth="1.8" />
          <circle cx="6" cy="18" r="2.5" stroke="#F05032" strokeWidth="1.8" />
          <path d="M6 8.5v7M18 10.5v1a4 4 0 0 1-4 4H8.5" stroke="#F05032" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="8" />
        </svg>
      );
  }
}

export default function AboutDeveloper() {
  const [copied, setCopied] = useState(false);

  const developerInfo = {
    name: 'Bun Raksa',
    khmerName: 'ប៊ុន រក្សា',
    title: 'Backend / Full-Stack Developer',
    location: 'Phnom Penh, Cambodia',
    email: 'raksabun2006@gmail.com',
    phone: '096 878 2196',
    phoneRaw: '+855968782196',
    github: 'https://github.com/raksabun2006',
    image: '/images/developer.jpg',
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(developerInfo.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const techStack = [
    {
      category: 'Backend Architecture',
      tag: 'Core Engine',
      description: 'Robust server-side framework handling transactional business logic and secure authentication.',
      icon: Server,
      color: 'from-amber-500/15 to-orange-500/15 text-amber-600 dark:text-amber-400 border-amber-200/80 dark:border-amber-900/50',
      items: ['Spring Boot', 'JWT Authentication'],
    },
    {
      category: 'Database & Persistence',
      tag: 'Data Layer',
      description: 'Relational data modeling, schema migrations, and ACID transaction integrity with PostgreSQL & JPA.',
      icon: Database,
      color: 'from-blue-500/15 to-cyan-500/15 text-blue-600 dark:text-blue-400 border-blue-200/80 dark:border-blue-900/50',
      items: ['PostgreSQL', 'JPA / Hibernate'],
    },
    {
      category: 'Frontend Engineering',
      tag: 'Client UI',
      description: 'Modern component-driven architecture delivering fast reactivity, responsive design, and intuitive UX.',
      icon: Laptop,
      color: 'from-emerald-500/15 to-teal-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-200/80 dark:border-emerald-900/50',
      items: ['React', 'JavaScript (ES6+)', 'Tailwind CSS', 'Vite'],
    },
    {
      category: 'Fintech, Cloud & DevOps',
      tag: 'Integrations & Deploy',
      description: 'Bakong KHQR payment processing, automated Telegram alerts, and containerized deployment.',
      icon: Terminal,
      color: 'from-violet-500/15 to-pink-500/15 text-violet-600 dark:text-violet-400 border-violet-200/80 dark:border-violet-900/50',
      items: ['Bakong KHQR Payments', 'Telegram Bot API', 'Docker', 'Railway Cloud', 'Git / GitHub Workflow'],
    },
  ];

  const buildPrinciples = [
    {
      icon: Layers,
      title: 'Clean Architecture',
      description: 'Designing modular, scalable, and decoupled layers that remain maintainable as business requirements evolve.',
    },
    {
      icon: Lock,
      title: 'Security First',
      description: 'Implementing robust role-based access control, cryptographic verification, and token authentication for safe transactions.',
    },
    {
      icon: Workflow,
      title: 'Real-World Solutions',
      description: 'Solving concrete problems with streamlined workflows — bridging customer purchasing, inventory, and instant payments.',
    },
    {
      icon: Lightbulb,
      title: 'Continuous Learning',
      description: 'Constantly benchmarking, refining code structure, and adopting modern software practices to build resilient systems.',
    },
  ];

  const projectShowcase = [
    {
      title: 'Modern E-Commerce Engine',
      description: 'End-to-end shopping experience with product catalog, cart persistence, discount calculations, and delivery management.',
      icon: ShoppingBag,
      tag: 'Storefront',
    },
    {
      title: 'Bakong KHQR Payment Flow',
      description: 'Seamless QR generation and automated payment polling with real-time verification and digital receipts.',
      icon: CreditCard,
      tag: 'Fintech',
    },
    {
      title: 'Real-Time Telegram Alerts',
      description: 'Automated Telegram Bot integration that sends instant order notifications, payment updates, and customer receipts to store staff.',
      icon: Bell,
      tag: 'Automation',
    },
    {
      title: 'Inventory & POS Terminal',
      description: 'Fast barcode-ready point-of-sale interface with stock tracking, invoice generation, and revenue analytics.',
      icon: Box,
      tag: 'Management',
    },
  ];

  const coreValues = [
    {
      title: 'System Reliability',
      text: 'Building dependable services with predictable state management and solid error handling.',
    },
    {
      title: 'Simplicity & Precision',
      text: 'Keeping complex domain logic clean, readable, and structured for long-term maintainability.',
    },
    {
      title: 'User Experience',
      text: 'Creating fast, responsive, and intuitive interfaces for both customers and store administrators.',
    },
    {
      title: 'Data Integrity',
      text: 'Ensuring transaction consistency, safe payment status transitions, and reliable database schemas.',
    },
  ];

  const projectCapabilities = [
    'Online E-Commerce Storefront',
    'Customer Accounts & JWT Security',
    'Product Catalog & Category Filtering',
    'Persistent Shopping Cart & Checkout',
    'Express Delivery & Store Pickup',
    'Bakong KHQR Payment Integration',
    'PostgreSQL Relational Database',
    'Telegram Bot Order Dispatching',
    'POS Terminal with Receipt Engine',
    'Dark Mode & Mobile-First Responsive UI',
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 transition-colors">
      <SEO
        title="About the Developer | Mart System"
        description="Learn about the developer behind Mart System, the technologies used, and the vision behind the platform."
        canonical="/about"
      />

      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden border-b border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 pt-10 pb-16 sm:py-20">
        {/* Ambient Gradient Background Glow */}
        <div className="absolute top-0 right-1/4 -mt-16 w-96 h-96 rounded-full bg-blue-500/10 dark:bg-blue-500/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 sm:gap-12 items-center">
            
            {/* Developer Portrait Image Column */}
            <div className="md:col-span-5 flex justify-center">
              <div className="relative group">
                {/* Decorative Frame Glow */}
                <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-[#164E87] via-teal-500 to-emerald-500 opacity-30 group-hover:opacity-60 blur-lg transition duration-500" />
                
                <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border-2 border-white dark:border-slate-800 bg-slate-100 dark:bg-slate-800 shadow-xl max-w-[280px] sm:max-w-[320px] aspect-[4/5]">
                  <img
                    src={developerInfo.image}
                    alt={developerInfo.name}
                    className="h-full w-full object-cover object-center transition duration-500 group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.src = '/mart.jpg';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                  
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs font-semibold px-2 py-1.5 rounded-xl bg-black/40 backdrop-blur-md border border-white/10">
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>{developerInfo.name}</span>
                    </span>
                    <span className="text-[10px] text-slate-300 font-mono">Cambodia</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Introduction Text Column */}
            <div className="md:col-span-7 space-y-5 text-center md:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 dark:border-blue-900/60 bg-blue-50 dark:bg-blue-950/50 px-3.5 py-1 text-xs font-bold text-[#164E87] dark:text-blue-300">
                <Sparkles size={13} />
                <span>MEET THE DEVELOPER</span>
              </div>

              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                  Hello, I'm <br className="hidden sm:inline" />
                  <span className="bg-gradient-to-r from-[#164E87] via-teal-600 to-emerald-600 bg-clip-text text-transparent">
                    {developerInfo.name}
                  </span>
                </h1>
                <p className="text-base sm:text-lg font-bold text-slate-700 dark:text-slate-300 mt-2">
                  {developerInfo.title}
                </p>
              </div>

              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl mx-auto md:mx-0">
                Building modern software solutions with passion, clean architecture, and practical engineering. I design end-to-end applications that bridge reliable backend services with seamless digital user experiences.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
                <a
                  href="#contact"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#164E87] hover:bg-[#123E6C] text-white px-5 py-3 text-xs sm:text-sm font-bold shadow-md shadow-[#164E87]/20 transition active:scale-95 cursor-pointer"
                >
                  <Mail size={15} />
                  <span>Contact Me</span>
                </a>

                <a
                  href="#behind-the-project"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 px-5 py-3 text-xs sm:text-sm font-bold shadow-2xs transition active:scale-95 cursor-pointer"
                >
                  <Layers size={15} />
                  <span>Behind Mart System</span>
                </a>

                <a
                  href={developerInfo.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 px-4 py-3 text-xs sm:text-sm font-bold shadow-2xs transition active:scale-95"
                  title="GitHub Profile"
                >
                  <GithubIcon size={15} />
                  <span>GitHub</span>
                  <ExternalLink size={12} className="text-slate-400" />
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. ABOUT ME SECTION */}
      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            
            {/* Education Timeline Left Card */}
            <div className="md:col-span-5 h-full">
              <div className="h-full rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-xs space-y-5 flex flex-col justify-between">
                {/* Header */}
                <div className="pb-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#164E87] dark:text-blue-400 border border-blue-100 dark:border-blue-900/50">
                      <GraduationCap size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white tracking-wide uppercase">
                        Education
                      </h3>
                      <p className="text-[11px] text-slate-400 font-medium">Academic Background</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900 text-[10px] font-bold text-[#164E87] dark:text-blue-300 uppercase tracking-wider">
                    Academic Path
                  </span>
                </div>

                {/* Timeline Items */}
                <div className="space-y-4 flex-1">
                  {/* Item 1: High School */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={12} className="text-[#164E87] dark:text-blue-400" />
                      <span className="text-xs font-bold text-[#164E87] dark:text-blue-400">
                        2018 – 2024
                      </span>
                    </div>
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-wide uppercase">
                      SAMRONG PONLEY HIGH SCHOOL
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 pl-0.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#164E87] dark:bg-blue-400"></span>
                      <span className="font-semibold">Diploma</span>
                    </div>
                  </div>

                  {/* Item 2: University */}
                  <div className="space-y-1 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={12} className="text-[#164E87] dark:text-blue-400" />
                      <span className="text-xs font-bold text-[#164E87] dark:text-blue-400">
                        2025 – Present
                      </span>
                    </div>
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-wide uppercase">
                      ROYAL UNIVERSITY OF PHNOM PENH
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 pl-0.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#164E87] dark:bg-blue-400"></span>
                      <span className="font-semibold">Bachelor of Computer Science</span>
                    </div>
                  </div>

                  {/* Item 3: ISTAD */}
                  <div className="space-y-1 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={12} className="text-[#164E87] dark:text-blue-400" />
                      <span className="text-xs font-bold text-[#164E87] dark:text-blue-400">
                        March 2026 – Present
                      </span>
                    </div>
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-wide uppercase">
                      ISTAD
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 pl-0.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#164E87] dark:bg-blue-400"></span>
                      <span className="font-semibold">IT Expert</span>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 font-medium">
                  <div className="flex items-center gap-1.5">
                    <MapPin size={13} className="text-rose-500 shrink-0" />
                    <span>{developerInfo.location}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    <Award size={13} className="text-emerald-500" />
                    <span>Active Studies</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Narrative Right Card */}
            <div className="md:col-span-7 h-full">
              <div className="h-full rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-4 flex flex-col justify-between">
                <div>
                  <div className="inline-flex items-center gap-1.5 mb-2">
                    <span className="text-xs font-bold text-[#164E87] dark:text-blue-400 uppercase tracking-widest">
                      About Me
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-snug">
                    Passionate about building practical software for real-world needs.
                  </h2>
                </div>
                
                <div className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  <p>
                    I enjoy developing practical software that solves real-world challenges for businesses and end customers. My engineering approach focuses on creating reliable backend systems, clean RESTful APIs, robust authentication, and intuitive user experiences.
                  </p>
                  <p>
                    With Mart System, my goal was to engineer a unified platform combining physical store sales and online e-commerce shopping into one seamless ecosystem — backed by automated payments, Telegram alerts, and clear financial records.
                  </p>
                  <p>
                    I continuously seek to refine my engineering skills, explore modern architectural patterns, and write clean, maintainable code that stands the test of time.
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <Sparkles size={14} className="text-amber-500" />
                  <span className="font-medium">Focusing on high performance, scalability & developer velocity</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. TECHNOLOGIES SECTION */}
      <section className="py-14 sm:py-20 bg-white dark:bg-slate-900 border-y border-slate-200/80 dark:border-slate-800">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto space-y-2 mb-10 sm:mb-12">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
              Tech Stack
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Technologies I Work With
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Core technologies and tools actively powering this application
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            {techStack.map((tech, idx) => {
              const IconComp = tech.icon;
              return (
                <div
                  key={idx}
                  className="rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 space-y-4 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${tech.color} border shadow-2xs group-hover:scale-105 transition-transform`}>
                          <IconComp size={20} />
                        </div>
                        <div>
                          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                            {tech.category}
                          </h3>
                          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                            {tech.tag}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-750">
                        {tech.items.length} techs
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed pt-1">
                      {tech.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                    {tech.items.map((it, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200/90 dark:border-slate-700/90 bg-slate-50/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 shadow-2xs hover:shadow-xs hover:border-slate-300 dark:hover:border-slate-600 transition-all active:scale-95"
                      >
                        <TechLogo name={it} className="h-4 w-4 shrink-0" />
                        <span>{it}</span>
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. HOW I BUILD SOFTWARE */}
      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto space-y-2 mb-10 sm:mb-12">
            <span className="text-xs font-bold text-[#164E87] dark:text-blue-400 uppercase tracking-widest">
              Engineering Mindset
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              How I Build Software
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Guiding architectural principles for building reliable, production-ready applications
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {buildPrinciples.map((principle, idx) => {
              const IconComp = principle.icon;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-3 shadow-2xs hover:shadow-md transition"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#164E87] dark:text-blue-400">
                    <IconComp size={18} />
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    {principle.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {principle.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. BEHIND MART SYSTEM */}
      <section id="behind-the-project" className="py-14 sm:py-20 bg-white dark:bg-slate-900 border-y border-slate-200/80 dark:border-slate-800">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
              Project Architecture
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Behind Mart System
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Mart System was engineered to bridge everyday retail shopping with a modern online ordering and management system.
            </p>
          </div>

          {/* Project Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {projectShowcase.map((card, idx) => {
              const IconComp = card.icon;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 p-5 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                      <IconComp size={17} />
                    </div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 px-2 py-0.5 rounded-full bg-slate-200/50 dark:bg-slate-800">
                      {card.tag}
                    </span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                    {card.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {card.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Conceptual Architecture Journey */}
          <div className="rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-gradient-to-r from-blue-50/50 via-slate-50/50 to-emerald-50/50 dark:from-slate-800/40 dark:via-slate-800/30 dark:to-slate-800/40 p-6 sm:p-8">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mb-4 text-center sm:text-left">
              Development Milestones &amp; Evolution
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
              {[
                { step: '01', title: 'System Design', desc: 'Domain modeling & schema' },
                { step: '02', title: 'Backend APIs', desc: 'Spring Boot REST services' },
                { step: '03', title: 'POS Engine', desc: 'Barcode & quick cashier sales' },
                { step: '04', title: 'E-Commerce', desc: 'Customer storefront & cart' },
                { step: '05', title: 'Fintech KHQR', desc: 'Bakong payment integration' },
                { step: '06', title: 'Telegram Bot', desc: 'Real-time order dispatch' },
              ].map((m, i) => (
                <div key={i} className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-2xs space-y-1">
                  <span className="font-mono text-[10px] font-black text-emerald-600 dark:text-emerald-400">{m.step}</span>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{m.title}</h4>
                  <p className="text-[10px] text-slate-400">{m.desc}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* 6. WHAT MATTERS TO ME & CAPABILITIES */}
      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 space-y-12">
          
          {/* Core Values */}
          <div>
            <div className="text-center max-w-xl mx-auto space-y-1.5 mb-8">
              <span className="text-xs font-bold text-[#164E87] dark:text-blue-400 uppercase tracking-widest">
                Core Principles
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                What Matters to Me
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {coreValues.map((val, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-2 shadow-2xs"
                >
                  <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                    {val.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {val.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Capabilities Checklist */}
          <div className="rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm">
            <h3 className="text-base font-black text-slate-900 dark:text-white mb-4">
              Implemented Project Capabilities
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {projectCapabilities.map((cap, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                    <Check size={12} />
                  </span>
                  <span>{cap}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* 7. LET'S CONNECT / CONTACT CTA */}
      <section id="contact" className="py-14 sm:py-20 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="rounded-3xl bg-gradient-to-br from-[#164E87] via-[#123E6C] to-slate-900 p-8 sm:p-12 text-white shadow-xl space-y-8 relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

            <div className="relative space-y-3 text-center sm:text-left max-w-xl">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-emerald-300 backdrop-blur-sm">
                <Send size={12} />
                <span>LET'S CONNECT</span>
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight">
                Have a project idea or want to discuss software engineering?
              </h2>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                Feel free to reach out directly via email, phone, or explore my GitHub repository.
              </p>
            </div>

            {/* Direct Contact Cards */}
            <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Email */}
              <div className="rounded-2xl bg-white/10 backdrop-blur-md p-4 border border-white/15 flex flex-col justify-between space-y-2">
                <div>
                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block">Email</span>
                  <p className="text-xs font-mono font-bold truncate mt-0.5">{developerInfo.email}</p>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <a
                    href={`mailto:${developerInfo.email}`}
                    className="flex-1 text-center py-1.5 rounded-lg bg-white text-[#164E87] text-xs font-bold hover:bg-slate-100 transition"
                  >
                    Send Email
                  </a>
                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition cursor-pointer"
                    title="Copy Email"
                  >
                    {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              {/* Phone */}
              <div className="rounded-2xl bg-white/10 backdrop-blur-md p-4 border border-white/15 flex flex-col justify-between space-y-2">
                <div>
                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block">Phone / Telegram</span>
                  <p className="text-xs font-mono font-bold mt-0.5">{developerInfo.phone}</p>
                </div>
                <a
                  href={`tel:${developerInfo.phoneRaw}`}
                  className="text-center py-1.5 rounded-lg bg-white text-[#164E87] text-xs font-bold hover:bg-slate-100 transition"
                >
                  Call Directly
                </a>
              </div>

              {/* GitHub */}
              <div className="rounded-2xl bg-white/10 backdrop-blur-md p-4 border border-white/15 flex flex-col justify-between space-y-2">
                <div>
                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block">Source Repository</span>
                  <p className="text-xs font-mono font-bold truncate mt-0.5">github.com/raksabun2006</p>
                </div>
                <a
                  href={developerInfo.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold shadow-xs transition"
                >
                  <span>Open GitHub</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>

            {/* Back to store link */}
            <div className="pt-2 text-center sm:text-left">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white transition group"
              >
                <ShoppingBag size={14} />
                <span>Return to Storefront Catalog</span>
                <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
