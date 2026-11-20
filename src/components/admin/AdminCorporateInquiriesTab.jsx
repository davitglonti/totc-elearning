import React, { useState } from 'react';
import { 
  Building2, Users, Mail, Phone, Calendar, Clock, 
  Search, Filter, CheckCircle2, AlertCircle, RefreshCw, 
  Trash2, Edit3, MessageSquare, Tag, Check, ChevronDown, 
  Save, Sparkles, Send, ExternalLink
} from 'lucide-react';
import { api } from '../../services/api';

const STATUS_CONFIG = {
  New: {
    label: 'ახალი მოთხოვნა',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
    dotClass: 'bg-amber-500 animate-pulse',
  },
  Contacted: {
    label: 'დაკავშირებული',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
    dotClass: 'bg-blue-500',
  },
  InDiscussion: {
    label: 'მოლაპარაკება',
    badgeClass: 'bg-purple-100 text-purple-800 border-purple-200',
    dotClass: 'bg-purple-500',
  },
  Closed: {
    label: 'დასრულებული / დახურული',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    dotClass: 'bg-emerald-500',
  },
};

export function AdminCorporateInquiriesTab({ inquiries = [], setInquiries, onReload, setActionMessage }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [editingNotesId, setEditingNotesId] = useState(null);
  const [notesDraft, setNotesDraft] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  // Status metrics
  const totalCount = inquiries.length;
  const newCount = inquiries.filter(i => (i.status || 'New') === 'New').length;
  const contactedCount = inquiries.filter(i => i.status === 'Contacted').length;
  const inDiscussionCount = inquiries.filter(i => i.status === 'InDiscussion').length;
  const closedCount = inquiries.filter(i => i.status === 'Closed').length;

  // Filtered list
  const filteredInquiries = inquiries.filter(item => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      (item.companyName && item.companyName.toLowerCase().includes(term)) ||
      (item.contactPerson && item.contactPerson.toLowerCase().includes(term)) ||
      (item.email && item.email.toLowerCase().includes(term)) ||
      (item.phone && item.phone.toLowerCase().includes(term)) ||
      (item.interests && item.interests.toLowerCase().includes(term));

    const itemStatus = item.status || 'New';
    const matchesStatus = statusFilter === 'ALL' || itemStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (inquiryId, newStatus) => {
    setUpdatingId(inquiryId);
    try {
      const current = inquiries.find(i => i.id === inquiryId);
      const res = await api.corporateInquiries.updateStatus(inquiryId, {
        status: newStatus,
        adminNotes: current?.adminNotes || null
      });

      setInquiries(prev => prev.map(i => i.id === inquiryId ? { ...i, status: newStatus } : i));
      if (setActionMessage) {
        setActionMessage({
          type: 'success',
          text: `სტატუსი განახლდა: ${STATUS_CONFIG[newStatus]?.label || newStatus}`
        });
      }
    } catch (err) {
      console.error('Failed to update inquiry status:', err);
      if (setActionMessage) {
        setActionMessage({
          type: 'error',
          text: 'სტატუსის განახლება ვერ მოხერხდა: ' + err.message
        });
      }
    } finally {
      setUpdatingId(null);
    }
  };

  const handleStartEditNotes = (inquiry) => {
    setEditingNotesId(inquiry.id);
    setNotesDraft(inquiry.adminNotes || '');
  };

  const handleSaveNotes = async (inquiryId) => {
    setUpdatingId(inquiryId);
    try {
      const current = inquiries.find(i => i.id === inquiryId);
      await api.corporateInquiries.updateStatus(inquiryId, {
        status: current?.status || 'New',
        adminNotes: notesDraft
      });

      setInquiries(prev => prev.map(i => i.id === inquiryId ? { ...i, adminNotes: notesDraft } : i));
      setEditingNotesId(null);
      if (setActionMessage) {
        setActionMessage({
          type: 'success',
          text: 'ადმინისტრატორის ჩანაწერი წარმატებით შეინახა.'
        });
      }
    } catch (err) {
      console.error('Failed to save admin notes:', err);
      if (setActionMessage) {
        setActionMessage({
          type: 'error',
          text: 'ჩანაწერის შენახვა ვერ მოხერხდა: ' + err.message
        });
      }
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (inquiryId, companyName) => {
    if (!window.confirm(`დარწმუნებული ხართ, რომ გსურთ კომპანიის „${companyName}“ მოთხოვნის წაშლა?`)) {
      return;
    }

    try {
      await api.corporateInquiries.delete(inquiryId);
      setInquiries(prev => prev.filter(i => i.id !== inquiryId));
      if (setActionMessage) {
        setActionMessage({
          type: 'success',
          text: `მოთხოვნა „${companyName}“ წარმატებით წაიშალა.`
        });
      }
    } catch (err) {
      console.error('Failed to delete corporate inquiry:', err);
      if (setActionMessage) {
        setActionMessage({
          type: 'error',
          text: 'მოთხოვნის წაშლა ვერ მოხერხდა: ' + err.message
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Telemetry KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-totc-teal/10 flex items-center justify-center text-totc-teal shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">სულ მოთხოვნა</p>
            <h3 className="font-poppins font-black text-2xl text-totc-navy">{totalCount}</h3>
            <p className="text-[10px] text-totc-gray font-medium">კორპორატიული & კამპუსი</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-amber-200/80 bg-amber-50/20 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">ახალი განსახილველი</p>
            <h3 className="font-poppins font-black text-2xl text-amber-600 flex items-center gap-2">
              <span>{newCount}</span>
              {newCount > 0 && (
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
              )}
            </h3>
            <p className="text-[10px] text-amber-700/80 font-medium">საჭიროებს დაკავშირებას</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
            <Phone className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">დაკავშირებული</p>
            <h3 className="font-poppins font-black text-2xl text-blue-600">{contactedCount}</h3>
            <p className="text-[10px] text-totc-gray font-medium">კომუნიკაცია დაწყებულია</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">მოლაპარაკება / დახურული</p>
            <h3 className="font-poppins font-black text-2xl text-purple-600">
              {inDiscussionCount + closedCount}
            </h3>
            <p className="text-[10px] text-emerald-600 font-bold">{closedCount} დასრულებული</p>
          </div>
        </div>
      </div>

      {/* Control Toolbar: Search & Status Filters */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="მოძებნეთ კომპანიის, საკონტაქტო პირის, ელ-ფოსტის ან ტელეფონის მიხედვით..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:outline-none focus:border-totc-teal transition-colors"
            />
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                statusFilter === 'ALL'
                  ? 'bg-totc-navy text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              ყველა ({totalCount})
            </button>
            <button
              onClick={() => setStatusFilter('New')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                statusFilter === 'New'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              ახალი ({newCount})
            </button>
            <button
              onClick={() => setStatusFilter('Contacted')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                statusFilter === 'Contacted'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
              }`}
            >
              დაკავშირებული ({contactedCount})
            </button>
            <button
              onClick={() => setStatusFilter('InDiscussion')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                statusFilter === 'InDiscussion'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
              }`}
            >
              მოლაპარაკება ({inDiscussionCount})
            </button>
            <button
              onClick={() => setStatusFilter('Closed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                statusFilter === 'Closed'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              დახურული ({closedCount})
            </button>
          </div>

        </div>
      </div>

      {/* Inquiries Cards List */}
      {filteredInquiries.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Building2 className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h4 className="font-poppins font-bold text-lg text-totc-navy">
              მოთხოვნები არ მოიძებნა
            </h4>
            <p className="text-xs text-totc-gray max-w-sm mx-auto">
              {searchTerm || statusFilter !== 'ALL'
                ? 'არჩეული ფილტრის ან ძებნის პარამეტრით შედეგები არ არის.'
                : 'ამ დროისთვის კორპორატიული შეთავაზების მოთხოვნები არ შემოსულა.'}
            </p>
          </div>
          {(searchTerm || statusFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('ALL');
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-totc-teal text-white hover:bg-totc-teal-dark transition-colors inline-block"
            >
              ფილტრების გასუფთავება
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredInquiries.map((inquiry) => {
            const currentStatus = inquiry.status || 'New';
            const statusMeta = STATUS_CONFIG[currentStatus] || STATUS_CONFIG.New;
            const isEditingNotes = editingNotesId === inquiry.id;

            const formattedDate = inquiry.createdAt
              ? new Date(inquiry.createdAt).toLocaleString('ka-GE', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'ახლახან';

            const interestTags = inquiry.interests
              ? inquiry.interests.split(',').map(s => s.trim()).filter(Boolean)
              : [];

            return (
              <div 
                key={inquiry.id}
                className={`bg-white rounded-2xl p-6 border transition-all duration-200 shadow-sm hover:shadow-md ${
                  currentStatus === 'New' 
                    ? 'border-amber-300 ring-2 ring-amber-100' 
                    : 'border-gray-200'
                }`}
              >
                {/* Header Row: Company Name, Team Size & Status */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-totc-navy text-white flex items-center justify-center shrink-0">
                        <Building2 className="w-5 h-5 text-totc-teal" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-poppins font-black text-lg text-totc-navy">
                            {inquiry.companyName}
                          </h3>
                          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold flex items-center gap-1">
                            <Users className="w-3 h-3 text-totc-teal" />
                            {inquiry.teamSize}
                          </span>
                        </div>
                        <p className="text-[11px] text-totc-gray flex items-center gap-1.5 mt-0.5">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>გამოგზავნილია: {formattedDate}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Status Dropdown & Actions */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-slate-500">სტატუსი:</span>
                      <div className="relative">
                        <select
                          value={currentStatus}
                          disabled={updatingId === inquiry.id}
                          onChange={(e) => handleStatusChange(inquiry.id, e.target.value)}
                          className={`appearance-none pl-3 pr-8 py-1.5 rounded-xl text-xs font-black border transition-all cursor-pointer focus:outline-none ${statusMeta.badgeClass}`}
                        >
                          <option value="New">ახალი მოთხოვნა</option>
                          <option value="Contacted">დაკავშირებული</option>
                          <option value="InDiscussion">მოლაპარაკება</option>
                          <option value="Closed">დასრულებული / დახურული</option>
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(inquiry.id, inquiry.companyName)}
                      className="w-8 h-8 rounded-lg bg-gray-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-colors"
                      title="მოთხოვნის წაშლა"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Details Grid: Contact info & Topics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4 border-b border-gray-100 text-xs">
                  
                  {/* Contact Person */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      საკონტაქტო პირი
                    </span>
                    <p className="font-bold text-totc-navy text-sm flex items-center gap-1.5">
                      <span>{inquiry.contactPerson}</span>
                    </p>
                  </div>

                  {/* Email */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      სამუშაო ელ-ფოსტა
                    </span>
                    <p>
                      <a 
                        href={`mailto:${inquiry.email}`}
                        className="font-bold text-totc-teal hover:underline flex items-center gap-1.5"
                      >
                        <Mail className="w-3.5 h-3.5 shrink-0" />
                        <span>{inquiry.email}</span>
                      </a>
                    </p>
                  </div>

                  {/* Phone */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      ტელეფონის ნომერი
                    </span>
                    <p>
                      <a 
                        href={`tel:${inquiry.phone}`}
                        className="font-bold text-slate-800 hover:text-totc-teal flex items-center gap-1.5"
                      >
                        <Phone className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                        <span>{inquiry.phone}</span>
                      </a>
                    </p>
                  </div>

                </div>

                {/* Training Interests & Requirements */}
                <div className="pt-4 space-y-3">
                  {interestTags.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] font-bold text-slate-500 mr-1 flex items-center gap-1">
                        <Tag className="w-3 h-3 text-slate-400" />
                        ინტერესები:
                      </span>
                      {interestTags.map((tag, tIdx) => (
                        <span 
                          key={tIdx}
                          className="px-2.5 py-0.5 rounded-lg bg-teal-50 text-totc-teal text-[11px] font-bold border border-teal-100"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Inquirer Message / Comments */}
                  {inquiry.message && (
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <MessageSquare className="w-3 h-3 text-slate-400" />
                        კომპანიის შეტყობინება / მოთხოვნა:
                      </span>
                      <p className="text-slate-700 italic leading-relaxed">
                        „{inquiry.message}“
                      </p>
                    </div>
                  )}

                  {/* Admin Internal Notes Section */}
                  <div className="mt-3 pt-3 border-t border-dashed border-gray-200">
                    {isEditingNotes ? (
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5">
                          <Edit3 className="w-3.5 h-3.5 text-totc-teal" />
                          <span>ადმინისტრატორის შიდა ჩანაწერი / კომენტარი:</span>
                        </label>
                        <textarea
                          rows={2}
                          value={notesDraft}
                          onChange={(e) => setNotesDraft(e.target.value)}
                          placeholder="მაგ: დავუკავშირდით HR მენეჯერს, გაეგზავნა პრეზენტაცია და ინდივიდუალური კომერციული წინადადება 30 თანამშრომელზე..."
                          className="w-full p-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:outline-none focus:border-totc-teal"
                        />
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            onClick={() => setEditingNotesId(null)}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                          >
                            გაუქმება
                          </button>
                          <button
                            onClick={() => handleSaveNotes(inquiry.id)}
                            disabled={updatingId === inquiry.id}
                            className="px-4 py-1.5 rounded-lg text-xs font-bold bg-totc-navy text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5 shadow-sm"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>შენახვა</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-4 text-xs">
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                            <Edit3 className="w-3 h-3 text-slate-400" />
                            შიდა ჩანაწერი:
                          </span>
                          <p className="text-slate-600 font-medium text-xs">
                            {inquiry.adminNotes ? (
                              <span className="text-slate-800">{inquiry.adminNotes}</span>
                            ) : (
                              <span className="text-slate-400 italic">ჩანაწერი არ არის დამატებული.</span>
                            )}
                          </p>
                        </div>
                        <button
                          onClick={() => handleStartEditNotes(inquiry)}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold text-totc-teal hover:bg-teal-50 transition-colors shrink-0 flex items-center gap-1"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>{inquiry.adminNotes ? 'რედაქტირება' : '+ ჩანაწერის დამატება'}</span>
                        </button>
                      </div>
                    )}
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}

export default AdminCorporateInquiriesTab;
