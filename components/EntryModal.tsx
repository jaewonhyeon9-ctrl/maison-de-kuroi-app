
import React, { useState, useEffect, useRef } from 'react';
import { EntryType, PLEntry, CategoryType, Staff, Vendor, FixedExpenseItem, ReceiptProduct } from '../types';
import { analyzeReceipt } from '../services/geminiService';
import { CustomConfirm } from './ToastContainer';

interface EntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: any) => void;
  onDelete?: (id: string) => void;
  staffList: Staff[];
  vendorList: Vendor[];
  fixedExpenseItems: FixedExpenseItem[];
  initialData?: PLEntry | null;
  selectedDateStr?: string;
}

const CATEGORIES: CategoryType[] = ['식자재', '인건비', '월세', '관리비', '비고정지출', '판매수수료', '기타매출'];

const EntryModal: React.FC<EntryModalProps> = ({ isOpen, onClose, onSave, onDelete, staffList, vendorList, fixedExpenseItems, initialData, selectedDateStr }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; message: string; onConfirm: () => void } | null>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    category: '식자재',
    type: '지출' as EntryType,
    amount: '',
    date: selectedDateStr || new Date().toISOString().split('T')[0],
    description: '',
    selectedStaffId: '',
    selectedVendorId: '',
    selectedFixedExpenseId: '',
    hours: '',
    newVendorName: '',
    products: [] as ReceiptProduct[]
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          category: initialData.category,
          type: initialData.type,
          amount: initialData.amount.toString(),
          date: initialData.date,
          description: initialData.description,
          selectedStaffId: initialData.staffId || '',
          selectedVendorId: initialData.vendorId || '',
          selectedFixedExpenseId: initialData.fixedExpenseId || '',
          hours: '',
          newVendorName: '',
          products: initialData.products || []
        });
      } else {
        setFormData({
          category: '식자재',
          type: '지출',
          amount: '',
          date: selectedDateStr || new Date().toISOString().split('T')[0],
          description: '',
          selectedStaffId: '',
          selectedVendorId: '',
          selectedFixedExpenseId: '',
          hours: '',
          newVendorName: '',
          products: []
        });
      }
    }
  }, [isOpen, initialData, selectedDateStr]);

  useEffect(() => {
    if (formData.category === '인건비' && formData.selectedStaffId) {
      const staff = staffList.find(s => s.id === formData.selectedStaffId);
      if (staff && staff.type === '알바' && formData.hours) {
        const calculatedAmount = staff.basePay * Number(formData.hours);
        setFormData(prev => ({ ...prev, amount: calculatedAmount.toString() }));
      }
    }
  }, [formData.selectedStaffId, formData.hours, formData.category, staffList]);

  if (!isOpen) return null;

  const handleReceiptScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Data = (reader.result as string).split(',')[1];
          const result = await analyzeReceipt(base64Data, file.type);
          
          if (result) {
            let matchedVendorId = '';
            if (result.vendorName) {
              const matched = vendorList.find(v => v.name.includes(result.vendorName) || result.vendorName.includes(v.name));
              if (matched) matchedVendorId = matched.id;
            }

            let processedProducts: ReceiptProduct[] = [];
            if (result.products && Array.isArray(result.products)) {
              processedProducts = result.products.map((p: any) => {
                let pricePer10g;
                if (p.weightInGrams && p.weightInGrams > 0) {
                  pricePer10g = Math.round((p.totalPrice / p.weightInGrams) * 10);
                }
                return {
                  name: p.name,
                  quantity: p.quantity || 1,
                  totalPrice: p.totalPrice || 0,
                  weightInGrams: p.weightInGrams,
                  pricePer10g
                };
              });
            }

            setFormData(prev => ({
              ...prev,
              amount: result.amount.toString(),
              date: result.date || prev.date,
              category: result.category || prev.category,
              description: result.description || '',
              type: (result.type as EntryType) || '지출',
              selectedVendorId: matchedVendorId,
              newVendorName: !matchedVendorId && result.vendorName ? result.vendorName : '',
              products: processedProducts
            }));
          }
        } catch (error: any) {
          console.error("Receipt Scan Error:", error);
          alert(error.message || "영수증을 인식하는 데 실패했습니다. 다시 시도해주세요.");
        } finally {
          setIsScanning(false);
          if (cameraInputRef.current) cameraInputRef.current.value = '';
          if (galleryInputRef.current) galleryInputRef.current.value = '';
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("File Read Error:", error);
      alert("파일을 읽는 데 실패했습니다.");
      setIsScanning(false);
      if (cameraInputRef.current) cameraInputRef.current.value = '';
      if (galleryInputRef.current) galleryInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let finalDescription = formData.description;
    if (formData.category === '인건비' && formData.selectedStaffId) {
      const staff = staffList.find(s => s.id === formData.selectedStaffId);
      finalDescription = `${staff?.name} ${formData.hours}시간 근무`;
    } else if (formData.category === '식자재' && formData.selectedVendorId) {
      const vendor = vendorList.find(v => v.id === formData.selectedVendorId);
      finalDescription = `${vendor?.name} 매입 - ${formData.description || '정기 납품'}`;
    } else if (formData.category === '식자재' && formData.newVendorName) {
      finalDescription = `${formData.newVendorName} 매입 - ${formData.description || '신규 거래처'}`;
    } else if (['월세', '관리비', '비고정지출'].includes(formData.category) && formData.selectedFixedExpenseId) {
      const item = fixedExpenseItems.find(i => i.id === formData.selectedFixedExpenseId);
      finalDescription = `${item?.name} 납부 - ${formData.description || '정기 지출'}`;
    }

    onSave({
      id: initialData?.id,
      category: formData.category,
      type: formData.type,
      amount: parseFloat(formData.amount) || 0,
      date: formData.date,
      description: finalDescription,
      staffId: formData.selectedStaffId,
      vendorId: formData.selectedVendorId,
      fixedExpenseId: formData.selectedFixedExpenseId,
      newVendorName: formData.newVendorName,
      products: formData.products
    });
    
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto custom-scrollbar animate-in zoom-in duration-300">
        <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center sticky top-0 z-10">
          <h2 className="text-xl font-black text-slate-800 tracking-tight">지출/매출 상세 기록</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="flex bg-slate-100 p-1 rounded-2xl relative">
            <button
              type="button"
              onClick={() => setFormData({...formData, type: '매출', category: '홀매출'})}
              className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${formData.type === '매출' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
            >
              매출 (+)
            </button>
            <button
              type="button"
              onClick={() => setFormData({...formData, type: '지출', category: '식자재'})}
              className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${formData.type === '지출' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-400'}`}
            >
              지출 (-)
            </button>
          </div>

          {/* 영수증 스캔 섹션 */}
          {formData.type === '지출' && (
            <div className="relative flex gap-2">
              <input 
                type="file" 
                accept="image/*" 
                capture="environment"
                className="hidden" 
                ref={cameraInputRef}
                onChange={handleReceiptScan}
              />
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                ref={galleryInputRef}
                onChange={handleReceiptScan}
              />
              <button 
                type="button"
                disabled={isScanning}
                onClick={() => cameraInputRef.current?.click()}
                className={`flex-1 py-4 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all ${isScanning ? 'bg-slate-100 border-slate-200 cursor-not-allowed' : 'bg-indigo-50 border-indigo-200 text-indigo-600 hover:bg-indigo-100'}`}
              >
                {isScanning ? (
                  <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                )}
                <span className="text-xs font-black">{isScanning ? '분석 중...' : '카메라 촬영'}</span>
              </button>
              <button 
                type="button"
                disabled={isScanning}
                onClick={() => galleryInputRef.current?.click()}
                className={`flex-1 py-4 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all ${isScanning ? 'bg-slate-100 border-slate-200 cursor-not-allowed' : 'bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100'}`}
              >
                {isScanning ? (
                  <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                )}
                <span className="text-xs font-black">{isScanning ? '분석 중...' : '사진첩 선택'}</span>
              </button>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">분류 선택</label>
            <div className="grid grid-cols-3 gap-2">
              {(formData.type === '지출' ? CATEGORIES.filter(c => c !== '기타매출') : ['홀매출', '배달매출', '기타매출']).map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFormData({...formData, category: cat})}
                  className={`py-3 rounded-xl text-[10px] font-bold border transition-all ${formData.category === cat ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {formData.category === '식자재' && (
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-3">
              <label className="block text-[10px] font-black text-emerald-400 uppercase">거래처 선택</label>
              <select 
                value={formData.selectedVendorId}
                onChange={e => setFormData({...formData, selectedVendorId: e.target.value})}
                className="w-full px-4 py-2 rounded-xl bg-white border border-emerald-200 outline-none text-sm font-bold"
              >
                <option value="">거래처 선택 (선택사항)</option>
                {vendorList.map(v => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
            </div>
          )}

          {['월세', '관리비', '비고정지출'].includes(formData.category) && (
            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 space-y-3">
              <label className="block text-[10px] font-black text-blue-400 uppercase">고정비 항목 선택</label>
              <select 
                value={formData.selectedFixedExpenseId}
                onChange={e => {
                  const item = fixedExpenseItems.find(i => i.id === e.target.value);
                  setFormData({
                    ...formData, 
                    selectedFixedExpenseId: e.target.value,
                    amount: item ? item.monthlyAmount.toString() : formData.amount,
                    description: item ? item.name : formData.description
                  });
                }}
                className="w-full px-4 py-2 rounded-xl bg-white border border-blue-200 outline-none text-sm font-bold"
              >
                <option value="">고정비 항목 선택 (선택사항)</option>
                {fixedExpenseItems.filter(i => i.defaultCategory === formData.category).map(i => (
                  <option key={i.id} value={i.id}>{i.name} ({i.monthlyAmount.toLocaleString()}원)</option>
                ))}
              </select>
            </div>
          )}

          {formData.category === '인건비' && (
            <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100 space-y-3">
              <label className="block text-[10px] font-black text-orange-400 uppercase">급여 자동 계산</label>
              <select 
                value={formData.selectedStaffId}
                onChange={e => setFormData({...formData, selectedStaffId: e.target.value})}
                className="w-full px-4 py-2 rounded-xl bg-white border border-orange-200 outline-none text-sm font-bold"
              >
                <option value="">대상 직원 선택</option>
                {staffList.filter(s => s.type === '알바').map(s => (
                  <option key={s.id} value={s.id}>{s.name} (시급: {s.basePay.toLocaleString()}원)</option>
                ))}
              </select>
              <div className="flex gap-2 items-center">
                <input 
                  type="number" 
                  step="0.5"
                  placeholder="시간" 
                  value={formData.hours}
                  onChange={e => setFormData({...formData, hours: e.target.value})}
                  className="w-24 px-4 py-2 rounded-xl bg-white border border-orange-200 outline-none text-sm font-bold"
                />
                <span className="text-xs font-bold text-orange-600">시간 근무</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 mb-1">금액 (원)</label>
              <input
                type="number"
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-black text-slate-800"
                value={formData.amount}
                onChange={e => setFormData({...formData, amount: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 mb-1">발생 날짜</label>
              <input
                type="date"
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
              />
            </div>
          </div>

          <input
            placeholder="상세 내역 (예: 야채 청과물 매입)"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
          />

          {formData.products.length > 0 && (
            <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
              <h4 className="text-[10px] font-black text-indigo-400 uppercase mb-2">인식된 구매 품목</h4>
              <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar">
                {formData.products.map((p, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-white p-2 rounded-lg border border-indigo-50">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-700">{p.name} <span className="text-indigo-400">x{p.quantity}</span></span>
                      {p.pricePer10g && <span className="text-[10px] font-black text-rose-500">10g당 {p.pricePer10g.toLocaleString()}원</span>}
                    </div>
                    <span className="text-xs font-black text-slate-800">{p.totalPrice.toLocaleString()}원</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            {initialData && onDelete && (
              <button 
                type="button" 
                onClick={() => {
                  setConfirmDialog({
                    isOpen: true,
                    message: '이 기록을 삭제하시겠습니까?',
                    onConfirm: () => {
                      onDelete(initialData.id);
                      onClose();
                    }
                  });
                }}
                className="px-6 bg-rose-50 text-rose-600 rounded-2xl font-black text-sm hover:bg-rose-100 transition-all"
              >
                삭제
              </button>
            )}
            <button type="submit" disabled={isScanning} className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black shadow-xl hover:bg-black transition-all disabled:opacity-50">
              {initialData ? '수정 내용 저장하기' : '데이터 저장하기'}
            </button>
          </div>
        </form>
      </div>
      <CustomConfirm 
        isOpen={confirmDialog?.isOpen || false}
        message={confirmDialog?.message || ''}
        onConfirm={() => {
          confirmDialog?.onConfirm();
          setConfirmDialog(null);
        }}
        onCancel={() => setConfirmDialog(null)}
      />
    </div>
  );
};

export default EntryModal;
