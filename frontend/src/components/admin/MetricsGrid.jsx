import React from 'react';
import { DollarSign, ShoppingBag, Store, TrendingUp, Percent } from 'lucide-react';

export default function MetricsGrid({ stats }) {
  if (!stats) return null;

  const cards = [
    {
      title: 'Total Gross Volume (GMV)',
      value: `₹${stats.totalGMV.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      subtitle: `Payouts: ₹${stats.totalVendorPayouts.toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-emerald-500',
      textColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    },
    {
      title: 'Platform Commission Earned',
      value: `₹${stats.totalCommission.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      subtitle: `Global Rate: ${stats.globalCommissionRate}%`,
      icon: TrendingUp,
      color: 'bg-rose-500',
      textColor: 'text-rose-600',
      bgColor: 'bg-rose-50'
    },
    {
      title: 'Total Orders Processed',
      value: stats.totalOrders,
      subtitle: `${stats.activeOrdersCount} Currently Active`,
      icon: ShoppingBag,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Active Restaurants',
      value: `${stats.activeRestaurants} / ${stats.totalRestaurants}`,
      subtitle: 'Online Vendors',
      icon: Store,
      color: 'bg-amber-500',
      textColor: 'text-amber-600',
      bgColor: 'bg-amber-50'
    },
    {
      title: 'Fulfillment Rate',
      value: `${stats.conversionRate}%`,
      subtitle: 'Delivered Ratio',
      icon: Percent,
      color: 'bg-indigo-500',
      textColor: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div key={idx} className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] sm:text-xs font-extrabold text-gray-400 uppercase tracking-wider line-clamp-1">{card.title}</span>
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl ${card.bgColor} ${card.textColor} flex items-center justify-center font-bold flex-shrink-0`}>
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>
            <div className="text-lg sm:text-2xl font-black text-gray-900 tracking-tight">{card.value}</div>
            <div className="text-[10px] sm:text-xs font-semibold text-gray-400 mt-0.5 truncate">{card.subtitle}</div>
          </div>
        );
      })}
    </div>
  );
}
