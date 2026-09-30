import React from 'react';
import { DollarSign, ShoppingBag, Store, TrendingUp, Percent } from 'lucide-react';

export default function MetricsGrid({ stats }) {
  if (!stats) return null;

  const totalGMV = Number(stats.totalGMV || 0);
  const totalVendorPayouts = Number(stats.totalVendorPayouts || 0);
  const totalCommission = Number(stats.totalCommission || 0);
  const globalCommissionRate = stats.globalCommissionRate ?? 15;
  const totalOrders = stats.totalOrders || 0;
  const activeOrdersCount = stats.activeOrdersCount || 0;
  const activeRestaurants = stats.activeRestaurants || 0;
  const totalRestaurants = stats.totalRestaurants || 0;
  const conversionRate = stats.conversionRate ?? 0;

  const cards = [
    {
      title: 'Total Gross Volume (GMV)',
      value: `₹${totalGMV.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      subtitle: `Payouts: ₹${totalVendorPayouts.toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-emerald-500',
      textColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    },
    {
      title: 'Platform Commission Earned',
      value: `₹${totalCommission.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      subtitle: `Global Rate: ${globalCommissionRate}%`,
      icon: TrendingUp,
      color: 'bg-rose-500',
      textColor: 'text-rose-600',
      bgColor: 'bg-rose-50'
    },
    {
      title: 'Total Orders Processed',
      value: totalOrders,
      subtitle: `${activeOrdersCount} Currently Active`,
      icon: ShoppingBag,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Active Restaurants',
      value: `${activeRestaurants} / ${totalRestaurants}`,
      subtitle: 'Online Vendors',
      icon: Store,
      color: 'bg-amber-500',
      textColor: 'text-amber-600',
      bgColor: 'bg-amber-50'
    },
    {
      title: 'Fulfillment Rate',
      value: `${conversionRate}%`,
      subtitle: 'Delivered Ratio',
      icon: Percent,
      color: 'bg-indigo-500',
      textColor: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500">{card.title}</span>
              <div className={`p-2 rounded-xl ${card.bgColor} ${card.textColor}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-xl font-black text-gray-900">{card.value}</div>
              <div className="text-[11px] font-semibold text-gray-400 mt-0.5">{card.subtitle}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
