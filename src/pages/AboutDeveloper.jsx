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
import { useLanguage } from '../context/LanguageContext';

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
  const { isKhmer } = useLanguage();
  const [copied, setCopied] = useState(false);

  const developerInfo = {
    name: 'Bun Raksa',
    khmerName: 'ប៊ុន រក្សា',
    titleEn: 'Backend / Full-Stack Developer',
    titleKm: 'អ្នកអភិវឌ្ឍន៍ Backend / Full-Stack Developer',
    locationEn: 'Phnom Penh, Cambodia',
    locationKm: 'រាជធានីភ្នំពេញ ប្រទេសកម្ពុជា',
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

  const content = {
    seoTitle: isKhmer
      ? 'អំពីអ្នកអភិវឌ្ឍន៍ | Mart System'
      : 'About the Developer | Mart System',
    seoDesc: isKhmer
      ? 'ស្វែងយល់អំពីអ្នកអភិវឌ្ឍន៍ប្រព័ន្ធ Mart System បច្ចេកវិទ្យាដែលបានប្រើប្រាស់ និងចក្ខុវិស័យនៃប្រព័ន្ធនេះ។'
      : 'Learn about the developer behind Mart System, the technologies used, and the vision behind the platform.',
    badgeMeet: 'MEET THE DEVELOPER',
    greeting: "Hello, I'm",
    nameDisplay: developerInfo.name,
    titleDisplay: developerInfo.titleEn,
    locationDisplay: isKhmer ? developerInfo.locationKm : developerInfo.locationEn,
    countryTag: 'Cambodia',
    heroBio: 'Building modern software solutions with passion, clean architecture, and practical engineering. I design end-to-end applications that bridge reliable backend services with seamless digital user experiences.',
    btnContact: 'Contact Me',
    btnBehind: 'Behind Mart System',
    btnGithub: 'GitHub',

    // Education
    eduTitle: isKhmer ? 'ការអប់រំ' : 'Education',
    eduSub: isKhmer ? 'ប្រវត្តិការសិក្សា' : 'Academic Background',
    eduBadge: isKhmer ? 'ដំណើរការសិក្សា' : 'Academic Path',
    eduStatus: isKhmer ? 'កំពុងបន្តការសិក្សា' : 'Active Studies',
    edu1School: isKhmer ? 'វិទ្យាល័យសំរោងពន្លៃ' : 'SAMRONG PONLEY HIGH SCHOOL',
    edu1Degree: isKhmer ? 'សញ្ញាបត្រមធ្យមសិក្សាទុតិយភូមិ (បាក់ឌុប)' : 'Diploma',
    edu1Time: isKhmer ? '2018 – 2024' : '2018 – 2024',
    edu2School: isKhmer ? 'សាកលវិទ្យាល័យភូមិន្ទភ្នំពេញ' : 'ROYAL UNIVERSITY OF PHNOM PENH',
    edu2Degree: isKhmer ? 'បរិញ្ញាបត្រវិទ្យាសាស្ត្រកុំព្យូទ័រ' : 'Bachelor of Computer Science',
    edu2Time: isKhmer ? '2025 – បច្ចុប្បន្ន' : '2025 – Present',
    edu3School: isKhmer ? 'វិទ្យាស្ថានបច្ចេកវិទ្យា ISTAD' : 'ISTAD',
    edu3Degree: isKhmer ? 'ជំនាញឯកទេស IT (IT Expert)' : 'IT Expert',
    edu3Time: isKhmer ? 'មីនា 2026 – បច្ចុប្បន្ន' : 'March 2026 – Present',

    // About Me Narrative (Kept in English)
    aboutBadge: 'About Me',
    aboutHeading: 'Passionate about building practical software for real-world needs.',
    aboutP1: 'I enjoy developing practical software that solves real-world challenges for businesses and end customers. My engineering approach focuses on creating reliable backend systems, clean RESTful APIs, robust authentication, and intuitive user experiences.',
    aboutP2: 'With Mart System, my goal was to engineer a unified platform combining physical store sales and online e-commerce shopping into one seamless ecosystem — backed by automated payments, Telegram alerts, and clear financial records.',
    aboutP3: 'I continuously seek to refine my engineering skills, explore modern architectural patterns, and write clean, maintainable code that stands the test of time.',
    aboutFooterNote: 'Focusing on high performance, scalability & developer velocity',

    // Tech Stack
    techBadge: isKhmer ? 'បច្ចេកវិទ្យាប្រើប្រាស់' : 'Tech Stack',
    techHeading: isKhmer ? 'បច្ចេកវិទ្យាដែលខ្ញុំប្រើប្រាស់' : 'Technologies I Work With',
    techSubtitle: isKhmer
      ? 'បច្ចេកវិទ្យាស្នូល និងឧបករណ៍ដែលកំពុងដំណើរការកម្មវិធីនេះ'
      : 'Core technologies and tools actively powering this application',
    techLabelCount: isKhmer ? 'បច្ចេកវិទ្យា' : 'techs',

    // Mindset
    mindsetBadge: isKhmer ? 'ផ្នត់គំនិតវិស្វកម្ម' : 'Engineering Mindset',
    mindsetHeading: isKhmer ? 'របៀបដែលខ្ញុំបង្កើតកម្មវិធី' : 'How I Build Software',
    mindsetSub: isKhmer
      ? 'គោលការណ៍ស្ថាបត្យកម្មណែនាំសម្រាប់ការបង្កើតកម្មវិធីដែលរឹងមាំ និងត្រៀមរួចរាល់សម្រាប់ផលិតកម្ម'
      : 'Guiding architectural principles for building reliable, production-ready applications',

    // Behind Project
    behindBadge: isKhmer ? 'ស្ថាបត្យកម្មគម្រោង' : 'Project Architecture',
    behindHeading: isKhmer ? 'ដំណើរការពីក្រោយ Mart System' : 'Behind Mart System',
    behindSub: isKhmer
      ? 'Mart System ត្រូវបានបង្កើតឡើងដើម្បីតភ្ជាប់ការទិញទំនិញប្រចាំថ្ងៃនៅហាង ជាមួយប្រព័ន្ធបញ្ជាទិញ និងគ្រប់គ្រងតាមអនឡាញដ៏ទំនើប។'
      : 'Mart System was engineered to bridge everyday retail shopping with a modern online ordering and management system.',
    milestonesHeading: isKhmer ? 'ដំណាក់កាលអភិវឌ្ឍន៍ និងការវិវត្តន៍' : 'Development Milestones & Evolution',

    // Values & Capabilities
    valuesBadge: isKhmer ? 'គោលការណ៍សំខាន់ៗ' : 'Core Principles',
    valuesHeading: isKhmer ? 'អ្វីដែលខ្ញុំយកចិត្តទុកដាក់បំផុត' : 'What Matters to Me',
    capHeading: isKhmer ? 'មុខងារ និងសមត្ថភាពដែលបានអនុវត្តក្នុងគម្រោង' : 'Implemented Project Capabilities',

    // Contact
    contactBadge: isKhmer ? 'ទំនាក់ទំនង' : "LET'S CONNECT",
    contactHeading: isKhmer
      ? 'មានគំនិតគម្រោង ឬចង់ពិភាក្សាអំពីវិស្វកម្មកម្មវិធី?'
      : 'Have a project idea or want to discuss software engineering?',
    contactSub: isKhmer
      ? 'សូមទាក់ទងមកខ្ញុំដោយផ្ទាល់តាមរយៈអ៊ីមែល ទូរស័ព្ទ ឬមើលកូដលើ GitHub repository របស់ខ្ញុំ។'
      : 'Feel free to reach out directly via email, phone, or explore my GitHub repository.',
    emailTitle: isKhmer ? 'អ៊ីមែល' : 'Email',
    sendEmailBtn: isKhmer ? 'ផ្ញើអ៊ីមែល' : 'Send Email',
    copiedTooltip: isKhmer ? 'បានចម្លង!' : 'Copied!',
    phoneTitle: isKhmer ? 'ទូរស័ព្ទ / តេឡេក្រាម' : 'Phone / Telegram',
    callBtn: isKhmer ? 'ទូរស័ព្ទផ្ទាល់' : 'Call Directly',
    repoTitle: isKhmer ? 'កូដប្រភពគម្រោង' : 'Source Repository',
    openGithubBtn: isKhmer ? 'ចូលមើល GitHub' : 'Open GitHub',
    returnToStore: isKhmer ? 'ត្រឡប់ទៅកាន់ហាងទំនិញ' : 'Return to Storefront Catalog',
  };

  const techStack = [
    {
      category: isKhmer ? 'រចនាសម្ព័ន្ធ Backend' : 'Backend Architecture',
      tag: isKhmer ? 'ម៉ាស៊ីនស្នូល' : 'Core Engine',
      description: isKhmer
        ? 'ក្របខ័ណ្ឌ Server-side ដ៏រឹងមាំសម្រាប់គ្រប់គ្រងដំណើរការអាជីវកម្ម និងសុវត្ថិភាពខ្ពស់។'
        : 'Robust server-side framework handling transactional business logic and secure authentication.',
      icon: Server,
      color: 'from-amber-500/15 to-orange-500/15 text-amber-600 dark:text-amber-400 border-amber-200/80 dark:border-amber-900/50',
      items: ['Spring Boot', 'JWT Authentication'],
    },
    {
      category: isKhmer ? 'មូលដ្ឋានទិន្នន័យ & ការផ្ទុកទិន្នន័យ' : 'Database & Persistence',
      tag: isKhmer ? 'ស្រទាប់ទិន្នន័យ' : 'Data Layer',
      description: isKhmer
        ? 'ការរៀបចំទិន្នន័យ Relational, Schema Migrations និងសុក្រឹតភាពនៃប្រតិបត្តិការទិន្នន័យជាមួយ PostgreSQL & JPA។'
        : 'Relational data modeling, schema migrations, and ACID transaction integrity with PostgreSQL & JPA.',
      icon: Database,
      color: 'from-blue-500/15 to-cyan-500/15 text-blue-600 dark:text-blue-400 border-blue-200/80 dark:border-blue-900/50',
      items: ['PostgreSQL', 'JPA / Hibernate'],
    },
    {
      category: isKhmer ? 'វិស្វកម្ម Frontend' : 'Frontend Engineering',
      tag: isKhmer ? 'ផ្ទៃមុខអ្នកប្រើប្រាស់' : 'Client UI',
      description: isKhmer
        ? 'រចនាសម្ព័ន្ធសមាសភាគទំនើប ផ្ដល់នូវភាពរហ័ស រចនាសម្ព័ន្ធបត់បែន និង UX ងាយស្រួលប្រើ។'
        : 'Modern component-driven architecture delivering fast reactivity, responsive design, and intuitive UX.',
      icon: Laptop,
      color: 'from-emerald-500/15 to-teal-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-200/80 dark:border-emerald-900/50',
      items: ['React', 'JavaScript (ES6+)', 'Tailwind CSS', 'Vite'],
    },
    {
      category: isKhmer ? 'Fintech, Cloud & DevOps' : 'Fintech, Cloud & DevOps',
      tag: isKhmer ? 'ការតភ្ជាប់ & ដាក់ដំណើរការ' : 'Integrations & Deploy',
      description: isKhmer
        ? 'ដំណើរការទូទាត់ Bakong KHQR, ការជូនដំណឹង Telegram ស្វ័យប្រវត្តិ និងការដាក់ដំណើរការលើ Cloud។'
        : 'Bakong KHQR payment processing, automated Telegram alerts, and containerized deployment.',
      icon: Terminal,
      color: 'from-violet-500/15 to-pink-500/15 text-violet-600 dark:text-violet-400 border-violet-200/80 dark:border-violet-900/50',
      items: ['Bakong KHQR Payments', 'Telegram Bot API', 'Docker', 'Railway Cloud', 'Git / GitHub Workflow'],
    },
  ];

  const buildPrinciples = [
    {
      icon: Layers,
      title: isKhmer ? 'រចនាសម្ព័ន្ធស្អាត (Clean Architecture)' : 'Clean Architecture',
      description: isKhmer
        ? 'ការរចនាស្រទាប់កូដដាច់ដោយឡែក ងាយស្រួលពង្រីក និងងាយស្រួលថែទាំនៅពេលអាជីវកម្មរីកចម្រើន។'
        : 'Designing modular, scalable, and decoupled layers that remain maintainable as business requirements evolve.',
    },
    {
      icon: Lock,
      title: isKhmer ? 'សុវត្ថិភាពជាចម្បង (Security First)' : 'Security First',
      description: isKhmer
        ? 'ការកំណត់សិទ្ធិប្រើប្រាស់ ការផ្ទៀងផ្ទាត់កូដសម្ងាត់ និងការផ្ទៀងផ្ទាត់ Token សម្រាប់ប្រតិបត្តិការប្រកបដោយសុវត្ថិភាព។'
        : 'Implementing robust role-based access control, cryptographic verification, and token authentication for safe transactions.',
    },
    {
      icon: Workflow,
      title: isKhmer ? 'ដំណោះស្រាយជាក់ស្ដែង (Real-World Solutions)' : 'Real-World Solutions',
      description: isKhmer
        ? 'ដោះស្រាយបញ្ហាជាក់ស្ដែងជាមួយលំហូរការងាររលូន — តភ្ជាប់ការទិញទំនិញ ស្តុក និងការទូទាត់ភ្លាមៗ។'
        : 'Solving concrete problems with streamlined workflows — bridging customer purchasing, inventory, and instant payments.',
    },
    {
      icon: Lightbulb,
      title: isKhmer ? 'ការរៀនសូត្រឥតឈប់ឈរ (Continuous Learning)' : 'Continuous Learning',
      description: isKhmer
        ? 'តែងតែវាស់ស្ទង់សមត្ថភាព កែលម្អរចនាសម្ព័ន្ធកូដ និងទទួលយកវិធីសាស្ត្រទំនើបៗដើម្បីកសាងប្រព័ន្ធដ៏រឹងមាំ។'
        : 'Constantly benchmarking, refining code structure, and adopting modern software practices to build resilient systems.',
    },
  ];

  const projectShowcase = [
    {
      title: isKhmer ? 'ប្រព័ន្ធ E-Commerce ទំនើប' : 'Modern E-Commerce Engine',
      description: isKhmer
        ? 'បទពិសោធន៍ទិញទំនិញពេញលេញជាមួយកាតាឡុកទំនិញ ការរក្សាទុកកន្ត្រក ការគណនាការបញ្ចុះតម្លៃ និងការគ្រប់គ្រងការដឹកជញ្ជូន។'
        : 'End-to-end shopping experience with product catalog, cart persistence, discount calculations, and delivery management.',
      icon: ShoppingBag,
      tag: isKhmer ? 'ហាងអនឡាញ' : 'Storefront',
    },
    {
      title: isKhmer ? 'ប្រព័ន្ធទូទាត់ Bakong KHQR' : 'Bakong KHQR Payment Flow',
      description: isKhmer
        ? 'ការបង្កើត QR កូដទូទាត់ និងការផ្ទៀងផ្ទាត់ការទូទាត់ស្វ័យប្រវត្តិតាមពេលវេលាជាក់ស្ដែង រួមជាមួយវិក្កយបត្រឌីជីថល។'
        : 'Seamless QR generation and automated payment polling with real-time verification and digital receipts.',
      icon: CreditCard,
      tag: isKhmer ? 'Fintech' : 'Fintech',
    },
    {
      title: isKhmer ? 'ការជូនដំណឹង Telegram ភ្លាមៗ' : 'Real-Time Telegram Alerts',
      description: isKhmer
        ? 'ការរួមបញ្ចូល Telegram Bot ស្វ័យប្រវត្តិដើម្បីផ្ញើដំណឹងការបញ្ជាទិញ ការទូទាត់ និងវិក្កយបត្រទៅកាន់បុគ្គលិកហាងភ្លាមៗ។'
        : 'Automated Telegram Bot integration that sends instant order notifications, payment updates, and customer receipts to store staff.',
      icon: Bell,
      tag: isKhmer ? 'ស្វ័យប្រវត្តិកម្ម' : 'Automation',
    },
    {
      title: isKhmer ? 'ផ្ទាំងលក់ POS & ការគ្រប់គ្រងស្តុក' : 'Inventory & POS Terminal',
      description: isKhmer
        ? 'ផ្ទាំងលក់ POS គាំទ្រការស្កេនបាកូដរហ័ស ជាមួយការតាមដានស្តុក ការចេញវិក្កយបត្រ និងការវិភាគចំណូល។'
        : 'Fast barcode-ready point-of-sale interface with stock tracking, invoice generation, and revenue analytics.',
      icon: Box,
      tag: isKhmer ? 'ការគ្រប់គ្រង' : 'Management',
    },
  ];

  const milestones = [
    { step: '01', title: isKhmer ? 'ការរចនាប្រព័ន្ធ' : 'System Design', desc: isKhmer ? 'រចនាសម្ព័ន្ធទិន្នន័យ & Model' : 'Domain modeling & schema' },
    { step: '02', title: isKhmer ? 'Backend APIs' : 'Backend APIs', desc: isKhmer ? 'សេវាកម្ម Spring Boot REST' : 'Spring Boot REST services' },
    { step: '03', title: isKhmer ? 'ប្រព័ន្ធ POS' : 'POS Engine', desc: isKhmer ? 'ស្កេនបាកូដ & លក់រហ័ស' : 'Barcode & quick cashier sales' },
    { step: '04', title: isKhmer ? 'E-Commerce' : 'E-Commerce', desc: isKhmer ? 'ហាងអនឡាញ & កន្ត្រកទំនិញ' : 'Customer storefront & cart' },
    { step: '05', title: isKhmer ? 'Fintech KHQR' : 'Fintech KHQR', desc: isKhmer ? 'ភ្ជាប់ប្រព័ន្ធទូទាត់បាគង' : 'Bakong payment integration' },
    { step: '06', title: isKhmer ? 'Telegram Bot' : 'Telegram Bot', desc: isKhmer ? 'ផ្ញើដំណឹងការបញ្ជាទិញភ្លាមៗ' : 'Real-time order dispatch' },
  ];

  const coreValues = [
    {
      title: isKhmer ? 'ភាពអាចទុកចិត្តបាននៃប្រព័ន្ធ' : 'System Reliability',
      text: isKhmer
        ? 'ការកសាងសេវាកម្មដែលអាចទុកចិត្តបាន ជាមួយការគ្រប់គ្រង State និងដោះស្រាយបញ្ហាបានត្រឹមត្រូវ។'
        : 'Building dependable services with predictable state management and solid error handling.',
    },
    {
      title: isKhmer ? 'ភាពសាមញ្ញ & ភាពច្បាស់លាស់' : 'Simplicity & Precision',
      text: isKhmer
        ? 'រក្សាកូដដែលមានភាពស្មុគស្មាញឱ្យមានរបៀប ងាយស្រួលអាន និងមានរចនាសម្ព័ន្ធច្បាស់លាស់។'
        : 'Keeping complex domain logic clean, readable, and structured for long-term maintainability.',
    },
    {
      title: isKhmer ? 'បទពិសោធន៍អ្នកប្រើប្រាស់' : 'User Experience',
      text: isKhmer
        ? 'បង្កើតផ្ទៃមុខកម្មវិធីដែលរហ័ស ឆ្លើយតបរលូន និងងាយស្រួលប្រើសម្រាប់ទាំងអតិថិជន និងអ្នកគ្រប់គ្រង។'
        : 'Creating fast, responsive, and intuitive interfaces for both customers and store administrators.',
    },
    {
      title: isKhmer ? 'សុក្រឹតភាពនៃទិន្នន័យ' : 'Data Integrity',
      text: isKhmer
        ? 'ធានានូវភាពត្រឹមត្រូវនៃប្រតិបត្តិការ ការផ្លាស់ប្ដូរស្ថានភាពទូទាត់សុវត្ថិភាព និងទិន្នន័យច្បាស់លាស់។'
        : 'Ensuring transaction consistency, safe payment status transitions, and reliable database schemas.',
    },
  ];

  const projectCapabilities = isKhmer
    ? [
        'ហាងទំនិញអនឡាញ (E-Commerce Storefront)',
        'គណនីអតិថិជន & ប្រព័ន្ធសុវត្ថិភាព JWT',
        'កាតាឡុកទំនិញ & ការចម្រាញ់តាមប្រភេទ',
        'កន្ត្រកទំនិញរក្សាទុក & ការទូទាត់ប្រាក់',
        'ការដឹកជញ្ជូនរហ័ស & មកយកផ្ទាល់នៅហាង',
        'ការតភ្ជាប់ប្រព័ន្ធទូទាត់ Bakong KHQR',
        'មូលដ្ឋានទិន្នន័យ Relational PostgreSQL',
        'ការផ្ញើដំណឹងការបញ្ជាទិញតាម Telegram Bot',
        'ផ្ទាំងលក់ POS & ប្រព័ន្ធចេញវិក្កយបត្រ',
        'Dark Mode & ផ្ទៃមុខបត់បែនតាមទូរស័ព្ទ',
      ]
    : [
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
        title={content.seoTitle}
        description={content.seoDesc}
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
                  
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs font-semibold px-2.5 py-1.5 rounded-xl bg-black/40 backdrop-blur-md border border-white/10">
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
                <span>{content.badgeMeet}</span>
              </div>

              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                  {content.greeting} <br className="hidden sm:inline" />
                  <span className="bg-gradient-to-r from-[#164E87] via-teal-600 to-emerald-600 bg-clip-text text-transparent">
                    {content.nameDisplay}
                  </span>
                </h1>
                <p className="text-base sm:text-lg font-bold text-slate-700 dark:text-slate-300 mt-2">
                  {content.titleDisplay}
                </p>
              </div>

              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl mx-auto md:mx-0">
                {content.heroBio}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
                <a
                  href="#contact"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#164E87] hover:bg-[#123E6C] text-white px-5 py-3 text-xs sm:text-sm font-bold shadow-md shadow-[#164E87]/20 transition active:scale-95 cursor-pointer"
                >
                  <Mail size={15} />
                  <span>{content.btnContact}</span>
                </a>

                <a
                  href="#behind-the-project"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 px-5 py-3 text-xs sm:text-sm font-bold shadow-2xs transition active:scale-95 cursor-pointer"
                >
                  <Layers size={15} />
                  <span>{content.btnBehind}</span>
                </a>

                <a
                  href={developerInfo.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 px-4 py-3 text-xs sm:text-sm font-bold shadow-2xs transition active:scale-95"
                  title="GitHub Profile"
                >
                  <GithubIcon size={15} />
                  <span>{content.btnGithub}</span>
                  <ExternalLink size={12} className="text-slate-400" />
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. ABOUT ME & EDUCATION SECTION */}
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
                        {content.eduTitle}
                      </h3>
                      <p className="text-[11px] text-slate-400 font-medium">{content.eduSub}</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900 text-[10px] font-bold text-[#164E87] dark:text-blue-300 uppercase tracking-wider">
                    {content.eduBadge}
                  </span>
                </div>

                {/* Timeline Items */}
                <div className="space-y-4 flex-1">
                  {/* Item 1: High School */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={12} className="text-[#164E87] dark:text-blue-400" />
                      <span className="text-xs font-bold text-[#164E87] dark:text-blue-400">
                        {content.edu1Time}
                      </span>
                    </div>
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-wide uppercase">
                      {content.edu1School}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 pl-0.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#164E87] dark:bg-blue-400"></span>
                      <span className="font-semibold">{content.edu1Degree}</span>
                    </div>
                  </div>

                  {/* Item 2: University */}
                  <div className="space-y-1 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={12} className="text-[#164E87] dark:text-blue-400" />
                      <span className="text-xs font-bold text-[#164E87] dark:text-blue-400">
                        {content.edu2Time}
                      </span>
                    </div>
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-wide uppercase">
                      {content.edu2School}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 pl-0.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#164E87] dark:bg-blue-400"></span>
                      <span className="font-semibold">{content.edu2Degree}</span>
                    </div>
                  </div>

                  {/* Item 3: ISTAD */}
                  <div className="space-y-1 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={12} className="text-[#164E87] dark:text-blue-400" />
                      <span className="text-xs font-bold text-[#164E87] dark:text-blue-400">
                        {content.edu3Time}
                      </span>
                    </div>
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-wide uppercase">
                      {content.edu3School}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 pl-0.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#164E87] dark:bg-blue-400"></span>
                      <span className="font-semibold">{content.edu3Degree}</span>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 font-medium">
                  <div className="flex items-center gap-1.5">
                    <MapPin size={13} className="text-rose-500 shrink-0" />
                    <span>{content.locationDisplay}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    <Award size={13} className="text-emerald-500" />
                    <span>{content.eduStatus}</span>
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
                      {content.aboutBadge}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-snug">
                    {content.aboutHeading}
                  </h2>
                </div>
                
                <div className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  <p>{content.aboutP1}</p>
                  <p>{content.aboutP2}</p>
                  <p>{content.aboutP3}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <Sparkles size={14} className="text-amber-500 shrink-0" />
                  <span className="font-medium">{content.aboutFooterNote}</span>
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
              {content.techBadge}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {content.techHeading}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {content.techSubtitle}
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
                        {tech.items.length} {content.techLabelCount}
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
              {content.mindsetBadge}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {content.mindsetHeading}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {content.mindsetSub}
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
              {content.behindBadge}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {content.behindHeading}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              {content.behindSub}
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
              {content.milestonesHeading}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
              {milestones.map((m, i) => (
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
                {content.valuesBadge}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {content.valuesHeading}
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
              {content.capHeading}
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
                <span>{content.contactBadge}</span>
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight">
                {content.contactHeading}
              </h2>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                {content.contactSub}
              </p>
            </div>

            {/* Direct Contact Cards */}
            <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Email */}
              <div className="rounded-2xl bg-white/10 backdrop-blur-md p-4 border border-white/15 flex flex-col justify-between space-y-2">
                <div>
                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block">{content.emailTitle}</span>
                  <p className="text-xs font-mono font-bold truncate mt-0.5">{developerInfo.email}</p>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <a
                    href={`mailto:${developerInfo.email}`}
                    className="flex-1 text-center py-1.5 rounded-lg bg-white text-[#164E87] text-xs font-bold hover:bg-slate-100 transition cursor-pointer"
                  >
                    {content.sendEmailBtn}
                  </a>
                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition cursor-pointer"
                    title={copied ? content.copiedTooltip : 'Copy Email'}
                  >
                    {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              {/* Phone */}
              <div className="rounded-2xl bg-white/10 backdrop-blur-md p-4 border border-white/15 flex flex-col justify-between space-y-2">
                <div>
                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block">{content.phoneTitle}</span>
                  <p className="text-xs font-mono font-bold mt-0.5">{developerInfo.phone}</p>
                </div>
                <a
                  href={`tel:${developerInfo.phoneRaw}`}
                  className="text-center py-1.5 rounded-lg bg-white text-[#164E87] text-xs font-bold hover:bg-slate-100 transition cursor-pointer"
                >
                  {content.callBtn}
                </a>
              </div>

              {/* GitHub */}
              <div className="rounded-2xl bg-white/10 backdrop-blur-md p-4 border border-white/15 flex flex-col justify-between space-y-2">
                <div>
                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block">{content.repoTitle}</span>
                  <p className="text-xs font-mono font-bold truncate mt-0.5">github.com/raksabun2006</p>
                </div>
                <a
                  href={developerInfo.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold shadow-xs transition cursor-pointer"
                >
                  <span>{content.openGithubBtn}</span>
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
                <span>{content.returnToStore}</span>
                <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
