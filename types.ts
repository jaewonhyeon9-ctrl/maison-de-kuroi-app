
export type EntryType = '매출' | '지출';

export type CategoryType = '식자재' | '인건비' | '월세' | '관리비' | '비고정지출' | '판매수수료' | '기타매출';

export type StaffType = '정규직' | '알바';

export interface User {
  id: string;
  userId: string;
  name: string;
  role: 'admin' | 'staff';
  staffId?: string;
  password?: string; // In a real app, this would be hashed
}

export interface Staff {
  id: string;
  name: string;
  type: StaffType;
  basePay: number; // 월급 또는 시급
  role?: '홀' | '주방';
}

export interface Vendor {
  id: string;
  name: string;
  contact?: string;
}

export interface FixedExpenseItem {
  id: string;
  name: string;
  defaultCategory: '월세' | '관리비' | '비고정지출';
  monthlyAmount: number; // 월 고정 금액 추가
}

export interface ReceiptProduct {
  name: string;
  quantity: number;
  totalPrice: number;
  weightInGrams?: number;
  pricePer10g?: number;
}

export interface PLEntry {
  id: string;
  category: string;
  type: EntryType;
  amount: number;
  date: string;
  description: string;
  staffId?: string;
  vendorId?: string;
  fixedExpenseId?: string;
  products?: ReceiptProduct[];
}

export interface PLSummary {
  totalRevenue: number;
  totalExpense: number;
  netProfit: number;
  foodCostRatio: number;
  laborCostRatio: number;
}

export interface Task {
  id: string;
  title: string;
  time?: string;
  completions: Record<string, string>;
  role?: '홀' | '주방' | '공통';
}

export interface InventoryItem {
  id: string;
  name: string;
  vendorId: string;
  currentStock: number;
  minimumStock: number;
  unit: string;
  pricePer10g?: number;
}

export interface OrderItem {
  itemId: string;
  quantity: number;
}

export interface Order {
  id: string;
  vendorId: string;
  date: string;
  items: OrderItem[];
  status: 'pending' | 'completed';
}

export interface Attendance {
  id: string;
  staffId: string;
  date: string;
  clockInTime: string;
  clockOutTime?: string;
}

export interface StoreSettings {
  latitude: number;
  longitude: number;
  radius: number; // meters
}
