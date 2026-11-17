import React from 'react';

export function AdminOrdersTab({ stats, ordersList }) {
  return (
    <div className="bg-white rounded-[28px] p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-poppins font-bold text-xl text-totc-navy">ფინანსური რეესტრი და შეკვეთები</h3>
          <p className="text-xs text-totc-gray">ყველა დაფიქსირებული შესყიდვა, გადახდა და Pro გამოწერა.</p>
        </div>

        <div className="text-right">
          <span className="text-xs font-bold text-totc-gray">სულ დამუშავებული: </span>
          <span className="font-poppins font-black text-lg text-emerald-600">
            ₾{stats ? Number(stats.totalRevenue).toLocaleString() : '0'}
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-gray-100 text-totc-gray font-bold uppercase tracking-wider text-[10px]">
              <th className="py-3 px-4">ტრანზაქციის ID</th>
              <th className="py-3 px-4">მომხმარებელი</th>
              <th className="py-3 px-4">პროდუქტი / პაკეტი</th>
              <th className="py-3 px-4">ტიპი</th>
              <th className="py-3 px-4">თანხა</th>
              <th className="py-3 px-4">სტატუსი</th>
              <th className="py-3 px-4 text-right">თარიღი</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {ordersList.map(order => (
              <tr key={order.id} className="hover:bg-slate-50/60 transition-colors">
                <td className="py-3.5 px-4 font-mono text-[11px] text-totc-gray">
                  {order.transactionId ? order.transactionId.substring(0, 14) + '...' : order.id.substring(0, 8)}
                </td>

                <td className="py-3.5 px-4">
                  <p className="font-bold text-totc-navy">{order.userFullName}</p>
                  <p className="text-[10px] text-totc-gray">{order.userEmail}</p>
                </td>

                <td className="py-3.5 px-4 font-semibold text-totc-navy max-w-xs truncate">
                  {order.itemTitle}
                </td>

                <td className="py-3.5 px-4">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    order.orderType === 'Subscription' 
                      ? 'bg-amber-100 text-amber-800' 
                      : 'bg-indigo-50 text-indigo-700'
                  }`}>
                    {order.orderType}
                  </span>
                </td>

                <td className="py-3.5 px-4 font-poppins font-black text-emerald-600 text-sm">
                  ₾{Number(order.amount).toFixed(2)}
                </td>

                <td className="py-3.5 px-4">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black uppercase">
                    {order.paymentStatus}
                  </span>
                </td>

                <td className="py-3.5 px-4 text-right text-totc-gray">
                  {new Date(order.createdAt).toLocaleString('ka-GE')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {ordersList.length === 0 && (
          <div className="py-12 text-center text-totc-gray text-xs">
            შეკვეთები ჯერ არ დაფიქსირებულა.
          </div>
        )}
      </div>
    </div>
  );
}
export default AdminOrdersTab;
