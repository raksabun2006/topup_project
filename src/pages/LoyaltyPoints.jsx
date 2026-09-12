import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Award, ArrowLeft, Gift, Star, Sparkles, CheckCircle2,
  Clock, ShoppingBag, ArrowRight, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDate } from '../utils/format';
import SEO from '../components/SEO';

const REWARDS = [
  { id: 'rew_1', name: 'Free Delivery Voucher', points: 80, value: '$1.50 off delivery', code: 'FREESHIP80' },
  { id: 'rew_2', name: '$1.00 Off Voucher', points: 50, value: '$1.00 off orders over $10', code: 'LOYALTY1' },
  { id: 'rew_3', name: '$3.00 Off Voucher', points: 150, value: '$3.00 off orders over $25', code: 'LOYALTY3' },
  { id: 'rew_4', name: 'VIP Super Saver 10%', points: 300, value: '10% off entire basket', code: 'VIP10' },
];

export default function LoyaltyPoints() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // User loyalty points (from user profile or fallback demonstration balance)
  const initialPoints = Number(user?.loyaltyPoint || user?.loyaltyPoints || 185);
  const [points, setPoints] = useState(initialPoints);
  const [redeemedCodes, setRedeemedCodes] = useState([]);
  const [redeemSuccess, setRedeemSuccess] = useState('');

  // Tier calculation: Silver (< 200), Gold (200 - 500), Platinum (500+)
  const tier = points >= 500 ? 'Platinum' : points >= 200 ? 'Gold' : 'Silver';
  const nextTierPoints = tier === 'Silver' ? 200 : tier === 'Gold' ? 500 : 1000;
  const progressPercent = Math.min(100, Math.round((points / nextTierPoints) * 100));

  const handleRedeem = (reward) => {
    if (points < reward.points) return;
    setPoints((prev) => prev - reward.points);
    setRedeemedCodes((prev) => [reward, ...prev]);
    setRedeemSuccess(`អបអរសាទរ! អ្នកបានប្តូរ ${reward.name} ដោយជោគជ័យ (Code: ${reward.code})`);
    setTimeout(() => setRedeemSuccess(''), 5000);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 pb-20 font-sans">
      <SEO
        title="Loyalty Points & Rewards | Mart System"
        description="Earn points on every purchase and redeem discount vouchers."
        canonical="/account/loyalty"
      />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-6 sm:py-10 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <button
            type="button"
            onClick={() => navigate('/account')}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              ពិន្ទុរង្វាន់អតិថិជន (Loyalty Points)
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Earn 1 point for every $1 spent via Bakong KHQR checkout
            </p>
          </div>
        </div>

        {redeemSuccess && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/40 p-4 text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>{redeemSuccess}</span>
          </div>
        )}

        {/* Tier Card */}
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-slate-900 via-slate-800 to-emerald-950 p-6 sm:p-8 text-white shadow-xl">
          <div className="relative z-10 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <Award size={22} />
                </div>
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-emerald-300 font-bold">Current Membership</span>
                  <h2 className="text-lg sm:text-xl font-black tracking-tight">{tier} Member</h2>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-400 uppercase font-bold">Total Balance</span>
                <p className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono tracking-tight">
                  {points} <span className="text-xs font-sans text-slate-300">pts</span>
                </p>
              </div>
            </div>

            {/* Progress to next tier */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-xs text-slate-300 font-semibold">
                <span>Progress to {tier === 'Silver' ? 'Gold (200 pts)' : tier === 'Gold' ? 'Platinum (500 pts)' : 'VIP Elite'}</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-700/60 overflow-hidden">
                <div
                  className="h-full rounded-full bg-linear-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400">
                {nextTierPoints - points > 0 ? `Need ${nextTierPoints - points} more points to reach the next tier.` : 'You have achieved the highest membership tier!'}
              </p>
            </div>
          </div>
        </div>

        {/* Redeemable Rewards Vouchers */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Gift size={16} className="text-emerald-600" />
              <span>ប្តូរយករង្វាន់ និងប័ណ្ណបញ្ចុះតម្លៃ (Redeem Rewards)</span>
            </h2>
            <span className="text-xs font-bold text-slate-400">
              Available Vouchers
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {REWARDS.map((reward) => {
              const canRedeem = points >= reward.points;
              return (
                <div
                  key={reward.id}
                  className="rounded-3xl bg-[#F7F7F8] dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-5 flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                        {reward.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">{reward.value}</p>
                    </div>
                    <span className="font-mono font-black text-xs px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 shrink-0">
                      {reward.points} pts
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRedeem(reward)}
                    disabled={!canRedeem}
                    className="w-full rounded-2xl py-2.5 text-xs font-black transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 active:scale-98 shadow-xs"
                  >
                    {canRedeem ? 'ប្តូរយករង្វាន់ (Redeem Now)' : `ត្រូវការបន្ថែម ${reward.points - points} ពិន្ទុទៀត`}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Redeemed Codes History */}
        {redeemedCodes.length > 0 && (
          <div className="rounded-3xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 p-5 space-y-3">
            <h3 className="text-xs font-black text-emerald-900 dark:text-emerald-300 uppercase tracking-wider">
              ប័ណ្ណដែលបានប្តូររួច (Your Active Voucher Codes)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {redeemedCodes.map((r, idx) => (
                <div key={idx} className="rounded-2xl bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-800 p-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">{r.name}</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{r.code}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(r.code);
                      alert(`Copied ${r.code}! Apply it at checkout.`);
                    }}
                    className="rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 text-[10px] font-bold"
                  >
                    Copy
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* How It Works */}
        <div className="rounded-3xl bg-[#F7F7F8] dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-6 space-y-4 text-xs">
          <h3 className="font-black text-slate-900 dark:text-white text-sm">
            របៀបសន្សំពិន្ទុ និងអត្ថប្រយោជន៍ (How Points Work)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-slate-600 dark:text-slate-400">
            <div className="space-y-1">
              <strong className="text-slate-900 dark:text-white block font-bold">1. ទិញទំនិញ (Shop & Pay)</strong>
              <p>ទទួលបាន ១ ពិន្ទុរាល់ការចំណាយ ១ ដុល្លារតាមរយៈ Bakong KHQR។</p>
            </div>
            <div className="space-y-1">
              <strong className="text-slate-900 dark:text-white block font-bold">2. សន្សំពិន្ទុ (Accumulate)</strong>
              <p>ពិន្ទុកើនឡើងដោយស្វ័យប្រវត្តិបន្ទាប់ពីការទូទាត់ត្រូវបានផ្ទៀងផ្ទាត់។</p>
            </div>
            <div className="space-y-1">
              <strong className="text-slate-900 dark:text-white block font-bold">3. ប្តូរយករង្វាន់ (Redeem)</strong>
              <p>ប្រើប្រាស់ពិន្ទុដើម្បីប្តូរយកកូប៉ុងដឹកជញ្ជូនឥតគិតថ្លៃ និងការបញ្ចុះតម្លៃបន្ថែម។</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
