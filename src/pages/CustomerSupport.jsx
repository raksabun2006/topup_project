import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MessageSquare, Plus, ArrowLeft, Send, CheckCircle2, Clock,
  AlertCircle, ChevronRight, User, ShieldCheck, HelpCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/format';
import SEO from '../components/SEO';

const TICKETS_STORAGE_KEY = 'mart_support_tickets';

// Default initial support ticket for realistic experience
const DEFAULT_TICKETS = [
  {
    id: 'TCK-1001',
    subject: 'Bakong KHQR Payment Question',
    category: 'Payment',
    status: 'RESOLVED',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    orderNumber: 'ORD-98214',
    messages: [
      {
        id: 'msg_1',
        sender: 'customer',
        text: 'Hello, I paid using ABA KHQR and wanted to confirm if the delivery is scheduled for this afternoon?',
        time: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
      {
        id: 'msg_2',
        sender: 'support',
        text: 'Thank you for reaching out! Yes, your Bakong payment was confirmed and our rider has dispatched your package.',
        time: new Date(Date.now() - 86400000 * 1.9).toISOString(),
      },
    ],
  },
];

export default function CustomerSupport() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // TODO (Backend API Required): Customer support ticket persistence does not exist on Spring Boot backend.
  // We use browser localStorage ('mart_support_tickets') with full client-side state until /api/v1/customer/support-tickets is implemented.
  const [tickets, setTickets] = useState(() => {
    try {
      const raw = localStorage.getItem(TICKETS_STORAGE_KEY);
      return raw ? JSON.parse(raw) : DEFAULT_TICKETS;
    } catch {
      return DEFAULT_TICKETS;
    }
  });

  const [selectedTicketId, setSelectedTicketId] = useState(tickets[0]?.id || null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [replyText, setReplyText] = useState('');

  // New ticket form
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('Order Issue');
  const [orderNumber, setOrderNumber] = useState('');
  const [initialMessage, setInitialMessage] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem(TICKETS_STORAGE_KEY, JSON.stringify(tickets));
    } catch {
      // ignore
    }
  }, [tickets]);

  const selectedTicket = tickets.find((t) => t.id === selectedTicketId) || tickets[0];

  const handleCreateTicket = (e) => {
    e.preventDefault();
    if (!subject.trim() || !initialMessage.trim()) return;

    const newTicket = {
      id: `TCK-${Math.floor(1000 + Math.random() * 9000)}`,
      subject: subject.trim(),
      category,
      status: 'OPEN',
      createdAt: new Date().toISOString(),
      orderNumber: orderNumber.trim() || undefined,
      messages: [
        {
          id: `msg_${Date.now()}`,
          sender: 'customer',
          text: initialMessage.trim(),
          time: new Date().toISOString(),
        },
      ],
    };

    const updated = [newTicket, ...tickets];
    setTickets(updated);
    setSelectedTicketId(newTicket.id);
    setShowNewModal(false);
    setSubject('');
    setInitialMessage('');
    setOrderNumber('');
  };

  const handleSendReply = (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;

    const newMsg = {
      id: `msg_${Date.now()}`,
      sender: 'customer',
      text: replyText.trim(),
      time: new Date().toISOString(),
    };

    const updated = tickets.map((t) => {
      if (t.id === selectedTicket.id) {
        return {
          ...t,
          status: t.status === 'RESOLVED' ? 'OPEN' : t.status,
          messages: [...t.messages, newMsg],
        };
      }
      return t;
    });

    setTickets(updated);
    setReplyText('');

    // Optional simulated support bot acknowledgment
    setTimeout(() => {
      setTickets((curr) =>
        curr.map((t) => {
          if (t.id === selectedTicket.id) {
            return {
              ...t,
              status: 'IN_PROGRESS',
              messages: [
                ...t.messages,
                {
                  id: `msg_${Date.now() + 1}`,
                  sender: 'support',
                  text: 'Thank you! A Mart customer representative has received your update and will reply shortly.',
                  time: new Date().toISOString(),
                },
              ],
            };
          }
          return t;
        })
      );
    }, 2000);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'OPEN':
        return <span className="rounded-full bg-amber-100 dark:bg-amber-950 px-2.5 py-0.5 text-[10px] font-black text-amber-700 dark:text-amber-400">OPEN</span>;
      case 'IN_PROGRESS':
        return <span className="rounded-full bg-blue-100 dark:bg-blue-950 px-2.5 py-0.5 text-[10px] font-black text-blue-700 dark:text-blue-400">IN PROGRESS</span>;
      case 'RESOLVED':
        return <span className="rounded-full bg-emerald-100 dark:bg-emerald-950 px-2.5 py-0.5 text-[10px] font-black text-emerald-700 dark:text-emerald-400">RESOLVED</span>;
      default:
        return <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-[10px] font-black text-slate-600 dark:text-slate-400">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 pb-20 font-sans">
      <SEO
        title="Customer Support & Tickets | Mart System"
        description="Submit tickets, get help with orders, or chat with Mart support."
        canonical="/account/support"
      />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-6 sm:py-10 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/account')}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                សេវាបម្រើអតិថិជន (Customer Support)
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Send inquiries, track ticket progress, and receive order assistance
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowNewModal(true)}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 hover:bg-emerald-500 px-5 py-2.5 text-xs font-black text-white shadow-xs shadow-emerald-600/20 transition active:scale-95 cursor-pointer"
          >
            <Plus size={15} />
            <span>+ បង្កើតសំណើថ្មី (New Ticket)</span>
          </button>
        </div>

        {/* 2-Column Support Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          
          {/* Left: Ticket List */}
          <div className="md:col-span-4 rounded-3xl bg-[#F7F7F8] dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-4 space-y-3">
            <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider px-2">
              សំណើរបស់អ្នក ({tickets.length})
            </h2>

            <div className="space-y-2 max-h-[550px] overflow-y-auto pr-1">
              {tickets.map((ticket) => {
                const isSelected = selectedTicket?.id === ticket.id;
                return (
                  <div
                    key={ticket.id}
                    onClick={() => setSelectedTicketId(ticket.id)}
                    className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'border-emerald-600 dark:border-emerald-500 bg-white dark:bg-slate-800 shadow-xs ring-1 ring-emerald-600'
                        : 'border-slate-200/60 dark:border-slate-800/80 bg-white/60 dark:bg-slate-800/50 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-mono font-bold text-slate-400">{ticket.id}</span>
                      {getStatusBadge(ticket.status)}
                    </div>
                    <h3 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                      {ticket.subject}
                    </h3>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                      <span>{ticket.category}</span>
                      <span>{formatDate(ticket.createdAt)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Message Thread & Reply */}
          <div className="md:col-span-8 rounded-3xl bg-[#F7F7F8] dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-5 sm:p-6 space-y-4">
            {selectedTicket ? (
              <>
                <div className="border-b border-slate-200/60 dark:border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-400">{selectedTicket.id}</span>
                      <h2 className="text-base font-black text-slate-900 dark:text-white">
                        {selectedTicket.subject}
                      </h2>
                    </div>
                    {selectedTicket.orderNumber && (
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                        Related Order: <strong className="text-slate-700 dark:text-slate-300">{selectedTicket.orderNumber}</strong>
                      </p>
                    )}
                  </div>
                  <div>
                    {getStatusBadge(selectedTicket.status)}
                  </div>
                </div>

                {/* Messages Container */}
                <div className="space-y-3 min-h-[250px] max-h-[420px] overflow-y-auto pr-2">
                  {selectedTicket.messages.map((msg) => {
                    const isCustomer = msg.sender === 'customer';
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isCustomer ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-3.5 space-y-1 text-xs leading-relaxed ${
                            isCustomer
                              ? 'bg-emerald-600 text-white shadow-xs rounded-tr-none'
                              : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700 shadow-2xs rounded-tl-none'
                          }`}
                        >
                          <div className={`flex items-center gap-2 text-[10px] ${isCustomer ? 'text-emerald-100' : 'text-slate-400'}`}>
                            <span className="font-bold">{isCustomer ? 'You' : 'Mart Support'}</span>
                            <span>•</span>
                            <span>{formatDate(msg.time)}</span>
                          </div>
                          <p>{msg.text}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Reply Box */}
                <form onSubmit={handleSendReply} className="pt-3 border-t border-slate-200/60 dark:border-slate-800 flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="សរសេរសារឆ្លើយតប (Write your reply...)"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="flex-1 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 px-4 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-emerald-600"
                  />
                  <button
                    type="submit"
                    disabled={!replyText.trim()}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-600 hover:bg-emerald-500 text-white transition disabled:opacity-50 cursor-pointer shadow-xs"
                  >
                    <Send size={15} />
                  </button>
                </form>
              </>
            ) : (
              <div className="py-16 text-center text-xs text-slate-400">
                ជ្រើសរើសសំណើមួយដើម្បីមើលសារឆ្លើយឆ្លង
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Ticket Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-2xl space-y-4 animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                បង្កើតសំណើជំនួយថ្មី (New Support Ticket)
              </h3>
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                បិទ
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-3 text-xs">
              <div>
                <label className="mb-1 block font-bold text-slate-700 dark:text-slate-300">
                  ប្រធានបទ (Subject) *
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Delivery status inquiry"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-2.5 px-3 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block font-bold text-slate-700 dark:text-slate-300">
                    ប្រភេទបញ្ហា (Category)
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-2 px-3 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="Order Issue">Order Issue</option>
                    <option value="Payment">Payment (KHQR)</option>
                    <option value="Delivery">Delivery / Rider</option>
                    <option value="Product Quality">Product Quality</option>
                    <option value="General">General Inquiry</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block font-bold text-slate-700 dark:text-slate-300">
                    លេខបញ្ជាទិញ (Order # Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ORD-12345"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-2 px-3 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block font-bold text-slate-700 dark:text-slate-300">
                  សារលម្អិត (Your Message) *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Please describe what you need help with..."
                  value={initialMessage}
                  onChange={(e) => setInitialMessage(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-2 px-3 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="rounded-full px-4 py-2 font-bold text-slate-500 hover:text-slate-700 cursor-pointer"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-emerald-600 hover:bg-emerald-500 px-6 py-2.5 font-black text-white shadow-xs transition active:scale-95 cursor-pointer"
                >
                  ផ្ញើសំណើ (Submit Ticket)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
