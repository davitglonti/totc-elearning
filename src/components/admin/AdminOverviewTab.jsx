import React from 'react';
import { Users, DollarSign, ArrowUpRight } from 'lucide-react';

export function AdminOverviewTab({ stats, ordersList = [], setActiveTab }) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Role Distribution breakdown */}
        <div className="bg-white rounded-[28px] p-6 sm:p-8 border border-gray-100 shadow-sm space-y-5">
          <h3 className="font-poppins font-bold text-lg text-totc-navy flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            <span>პლატფორმის დემოგრაფია</span>
          </h3>

          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100/60 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-indigo-900">ჩარიცხული სტუდენტები</p>
                <p className="text-[11px] text-indigo-600">აქტიური მსმენელები კურსებზე წვდომით</p>
              </div>
              <span className="font-poppins font-black text-xl text-indigo-700">{stats?.totalStudents || 0}</span>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100/60 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-amber-900">⭐ Pro სრული წვდომის წევრები</p>
                <p className="text-[11px] text-amber-700">გამომწერები უნივერსალური წვდომით</p>
              </div>
              <span className="font-poppins font-black text-xl text-amber-700">{stats?.proSubscribers || 0}</span>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100/60 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-purple-900">სერტიფიცირებული ინსტრუქტორები</p>
                <p className="text-[11px] text-purple-600">კურსების ავტორები სტუდიის უფლებით</p>
              </div>
              <span className="font-poppins font-black text-xl text-purple-700">{stats?.totalInstructors || 0}</span>
            </div>
          </div>
        </div>

        {/* Recent Orders Overview */}
        <div className="lg:col-span-2 bg-white rounded-[28px] p-6 sm:p-8 border border-gray-100 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-poppins font-bold text-lg text-totc-navy flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              <span>ბოლო ფინანსური ტრანზაქციები</span>
            </h3>
            <button 
              onClick={() => setActiveTab('orders')}
              className="text-xs font-bold text-totc-teal hover:underline flex items-center gap-1"
            >
              <span>ყველას ნახვა ({ordersList.length})</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {ordersList.slice(0, 4).map(order => (
              <div key={order.id} className="p-4 bg-gray-50/80 rounded-2xl border border-gray-100 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-totc-navy truncate">{order.itemTitle}</p>
                  <p className="text-[11px] text-totc-gray truncate">
                    მყიდველი: <span className="text-totc-navy font-semibold">{order.userEmail}</span> • {new Date(order.createdAt).toLocaleDateString('ka-GE')}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-poppins font-black text-sm text-emerald-600">
                    ₾{Number(order.amount).toFixed(2)}
                  </span>
                  <div className="text-[10px] font-bold text-emerald-700 uppercase">
                    {order.paymentStatus}
                  </div>
                </div>
              </div>
            ))}

            {ordersList.length === 0 && (
              <div className="p-8 text-center text-totc-gray text-xs">
                ტრანზაქციების ჩანაწერები ჯერ არ არის.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default AdminOverviewTab;
