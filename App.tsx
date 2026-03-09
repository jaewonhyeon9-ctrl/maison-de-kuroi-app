
import React, { useState, useMemo, useEffect } from 'react';
import { PLEntry, Staff, Vendor, FixedExpenseItem, User, Task, InventoryItem, Order, OrderItem, Attendance, StoreSettings } from './types';
import EntryModal from './components/EntryModal';
import { analyzeFinancials } from './services/geminiService';

const INITIAL_STAFF: Staff[] = [
  { id: 's1', name: '김주방', type: '정규직', basePay: 3500000, role: '주방' },
  { id: 's2', name: '이서빙', type: '알바', basePay: 10500, role: '홀' },
];

const INITIAL_VENDORS: Vendor[] = [
  { id: 'v1', name: '프레시웨이' },
  { id: 'v2', name: '마켓보로' },
];

const INITIAL_FIXED_EXPENSES: FixedExpenseItem[] = [
  { id: 'f1', name: '매장 월세', defaultCategory: '월세', monthlyAmount: 3200000 },
  { id: 'f2', name: '공과금 통합', defaultCategory: '관리비', monthlyAmount: 650000 },
  { id: 'f3', name: '보안/인터넷', defaultCategory: '비고정지출', monthlyAmount: 120000 },
];

const INITIAL_ENTRIES: PLEntry[] = [
  { id: '1', category: '홀매출', type: '매출', amount: 1850000, date: new Date().toISOString().split('T')[0], description: '금일 점심 만석' },
  { id: '2', category: '식자재', type: '지출', amount: 320000, date: new Date().toISOString().split('T')[0], description: '야채/청과 추가 매입', vendorId: 'v1' },
];

const INITIAL_TASKS: Task[] = [
  // Morning Preparation
  { id: 't1', title: '유니폼 착용', time: '09:00', completions: {}, role: '홀' },
  { id: 't2', title: '깔끔한 머리/모자', time: '09:00', completions: {}, role: '홀' },
  { id: 't3', title: '전체적인 옷 매무새', time: '09:00', completions: {}, role: '홀' },
  { id: 't4', title: '손톱길이', time: '09:00', completions: {}, role: '홀' },
  { id: 't5', title: '출근자 근태일지 작성', time: '09:00', completions: {}, role: '홀' },
  { id: 't6', title: '전등/TV켜서 유투브로 음악틀기(일본음악, 지브리 또는 일본 최신음악)', time: '09:05', completions: {}, role: '홀' },
  { id: 't7', title: '매장 포스 전원켜고, 시스템 접속하기(켜지는동안 포스 닦기)', time: '09:05', completions: {}, role: '홀' },
  { id: 't8', title: '보조배터리체크및 장착, 테이블오더 전원 키면서 테이블/의자와 함께 닦아주기', time: '09:10', completions: {}, role: '홀' },
  { id: 't9', title: '네이버 예약 확인 및 예약일지 확인', time: '09:15', completions: {}, role: '홀' },
  { id: 't10', title: '1-1. 네이버 예약자 체크 단톡방 체크', time: '09:15', completions: {}, role: '홀' },
  { id: 't11', title: '1-2. 네이버 예약 리뷰고객 10% 할인쿠폰 발송/발송대장 기입', time: '09:15', completions: {}, role: '홀' },
  { id: 't12', title: '2. 네이버 영수증 리뷰 검토', time: '09:20', completions: {}, role: '홀' },
  { id: 't13', title: '3. 네이버 블로그/카페 리뷰 검토 (블로그 최신으로 검색)', time: '09:20', completions: {}, role: '홀' },
  { id: 't14', title: '리뷰中 불편사항/개선사항/칭찬사항 캡쳐후 카톡방에 공유', time: '09:25', completions: {}, role: '홀' },
  { id: 't15', title: '전일 영업특이사항 공유, 금일 영업중점사항 공유', time: '09:25', completions: {}, role: '홀' },
  { id: 't16', title: '전일 영업일보 내용 확인하여 놓친 것은 없는 검토', time: '09:25', completions: {}, role: '홀' },
  { id: 't17', title: '전날 남은 국물 맛보고 주방에 보고 (돈카츠에 나가는 국물)', time: '09:30', completions: {}, role: '홀' },
  { id: 't18', title: '꼬들배기, 명이나물, 단무지, 무말랭이, 궁채나물( 부족한거 채우기)', time: '09:30', completions: {}, role: '홀' },
  { id: 't19', title: '밥 짓기 (쌀 3컵, 밥솥2개 다 짓기)', time: '09:35', completions: {}, role: '홀' },

  // 10:30 (Hall Opening)
  { id: 't20', title: '주방 야채실, 냉동고 온도 체크', time: '10:30', completions: {}, role: '홀' },
  { id: 't21', title: '테이블 및 의자(더러운 부분 확인) 닦기', time: '10:30', completions: {}, role: '홀' },
  { id: 't22', title: '테이블 위 앞접시,종지,종이컵 8개씩 채우기/종이컵재고 체크', time: '10:35', completions: {}, role: '홀' },
  { id: 't23', title: '말돈소금, 돈까스소스, 한라봉 드레싱, 트러플오일 채우기', time: '10:35', completions: {}, role: '홀' },
  { id: 't24', title: '메뉴판 닦고 테이블에 비치하기 특히 3번,6번 테이블', time: '10:40', completions: {}, role: '홀' },
  { id: 't25', title: '수저, 젓가락, 냅킨, 물티슈, 오프너 채우기및 재고체크', time: '10:40', completions: {}, role: '홀' },
  { id: 't26', title: '이쑤시개, 체크', time: '10:45', completions: {}, role: '홀' },
  { id: 't27', title: '카운터 정리정돈, 포스메인 및 고객용 액정, 전화기, 소형 POP닦기', time: '10:45', completions: {}, role: '홀' },
  { id: 't28', title: '메뉴판 배너, 유리창 전체 닦기', time: '10:50', completions: {}, role: '홀' },
  { id: 't29', title: '예약노트 오늘날짜로 되어있는지 확인 및 볼펜 비치 여부 재확인하기', time: '10:50', completions: {}, role: '홀' },
  { id: 't30', title: '바닥 더러운곳 체크및 닦기', time: '10:50', completions: {}, role: '홀' },
  { id: 't31', title: '홀및 서빙존 안에 냉장고 정리및 청소', time: '10:55', completions: {}, role: '홀' },
  { id: 't32', title: '배달 나갈 반찬 미리 담아두기/ 돈카츠10개 단무지,꼬들배기10개씩', time: '10:55', completions: {}, role: '홀' },
  { id: 't33', title: '배달용기 필요할때 바로 찾을수 있게 정리', time: '10:55', completions: {}, role: '홀' },
  { id: 't34', title: '서빙존 필요 토핑 체크및 보고 / 김가루,새싹,간무, 와사비 체크', time: '11:00', completions: {}, role: '홀' },
  { id: 't35', title: '종류별로 반찬 미리 만들기 (월~목 : 30개, 금~일 : 50개)', time: '11:00', completions: {}, role: '홀' },

  // 11:00 (Business Preparation - Phase 1)
  { id: 't36', title: '점심영업 첫발주시 돈까츠 국물맛 1차 확인', time: '11:00', completions: {}, role: '홀' },
  { id: 't37', title: '크린콜(소주) 분무기에 크린콜 채우기', time: '11:05', completions: {}, role: '홀' },
  { id: 't38', title: '주류/음료(디스펜서)/빨대 채우기', time: '11:05', completions: {}, role: '홀' },
  { id: 't39', title: '토닉워터및 에이드/하이볼 원액 잔량 확인', time: '11:10', completions: {}, role: '홀' },
  { id: 't40', title: '말통에 물 받고 물 채우기', time: '11:10', completions: {}, role: '홀' },
  { id: 't41', title: '영업中 수시로 돌아다녀 식사 고객 불편한점 체크', time: '11:30', completions: {}, role: '홀' },

  // 14:00~14:30
  { id: 't42', title: '국물맛 2차 확인', time: '14:00', completions: {}, role: '홀' },
  { id: 't43', title: '셀프바 반찬 채우기', time: '14:00', completions: {}, role: '홀' },
  { id: 't44', title: '음료 채우기', time: '14:05', completions: {}, role: '홀' },
  { id: 't45', title: '분리수거 쓰레기통 비우기', time: '14:05', completions: {}, role: '홀' },
  { id: 't46', title: '테이블 및 바닥 체크해서 더러운곳 체크', time: '14:10', completions: {}, role: '홀' },
  { id: 't47', title: '음식물 쓰레기통에 넣기', time: '14:10', completions: {}, role: '홀' },
  { id: 't48', title: '물 재고 채우기, 말통까지 채우기', time: '14:15', completions: {}, role: '홀' },
  { id: 't49', title: '소스류 및 반찬류 재고 파악 후 채우기', time: '14:15', completions: {}, role: '홀' },
  { id: 't50', title: '수저,젓가락, 냅킨, 오프너 채우기', time: '14:20', completions: {}, role: '홀' },
  { id: 't51', title: '테이블 세팅(앞접시, 종지, 등등) 채우기', time: '14:20', completions: {}, role: '홀' },
  { id: 't52', title: '금일 사용한 행주 빨기', time: '14:25', completions: {}, role: '홀' },

  // 21:30 (Business Closing)
  { id: 't53', title: '15:30 라스트오더 안내하기 / 기본멘트) 15:30 라스트오더이니 마지막 주문 부탁드리겠습니다 ^^ / 영업은 16:00 까지니 편하게 식사하세요~~ ^^', time: '15:30', completions: {}, role: '홀' },
  { id: 't54', title: '냉풍기 전원끄고 세척 후 물 받기', time: '21:30', completions: {}, role: '홀' },
  { id: 't55', title: '음료 냉장고/서빙존 냉장고 정리 하기', time: '21:30', completions: {}, role: '홀' },
  { id: 't56', title: '반찬냉장고 뚜껑닫고 주변정리하기, 집게통 세척하기', time: '21:35', completions: {}, role: '홀' },
  { id: 't57', title: '행주 빨고 널기', time: '21:35', completions: {}, role: '홀' },
  { id: 't58', title: '밥 폐기 후 밥통 뚜껑, 외부, 내솥 세척하기', time: '21:40', completions: {}, role: '홀' },
  { id: 't59', title: '테이블 오더 보조 배터리 충전하기', time: '21:40', completions: {}, role: '홀' },
  { id: 't60', title: '쓰레기통 비우기', time: '21:45', completions: {}, role: '홀' },

  // 21:50
  { id: 't61', title: '고객님께 영업마감 안내하기', time: '21:50', completions: {}, role: '홀' },

  // 22:00
  { id: 't62', title: '손님 퇴장 후 쓸고 닦기', time: '22:00', completions: {}, role: '홀' },
  { id: 't63', title: '매장포스 매출 일치한지 확인하기', time: '22:05', completions: {}, role: '홀' },
  { id: 't64', title: '테이블오더 전원끄고 충전 시키기', time: '22:05', completions: {}, role: '홀' },
  { id: 't65', title: '포스 마감 영수증 단톡방에 올리기', time: '22:10', completions: {}, role: '홀' },
  { id: 't66', title: '손익계산서 작성', time: '22:10', completions: {}, role: '홀' },
  { id: 't67', title: '포스 영업마감', time: '22:15', completions: {}, role: '홀' },
  { id: 't68', title: '손익계산서/근태일지/포스마감빌지/체크리스트/고객관리일지 잔디로 회신하기', time: '22:15', completions: {}, role: '홀' },
  { id: 't69', title: '중간주방 주방 가스차단기, 우동국물통 튀김기, 찐만두 기계 전원OFF 인지 확인', time: '22:20', completions: {}, role: '홀' },

  // Kitchen Tasks - Morning Preparation
  { id: 'k1', title: '1. 전원켜기: 가스밸브열기, 튀김기, 식기세척기, 면 삶는 기계, 화구 전원 켜기', time: '09:30', completions: {}, role: '주방' },
  { id: 'k2', title: '2. 육수체크: 돈꼬츠 라멘 육수, 소유라멘육수/카레, 돈지루', time: '09:35', completions: {}, role: '주방' },
  { id: 'k3', title: '3. 냉 모밀 육수 상태 확인: 전날 남은 냉모밀육수 맛보기/살얼음 상태 체크', time: '09:40', completions: {}, role: '주방' },
  { id: 'k4', title: '4. 숙성육류 상태 확인: 상등심, 등심, 안심, 치즈, 치킨 재고 체크/ 라드유체크', time: '09:45', completions: {}, role: '주방' },
  { id: 'k5', title: '15. 기름세팅: 튀김기 기름 세팅', time: '09:50', completions: {}, role: '주방' },
  { id: 'k6', title: '16. 밸브열기: 면 삶는 기계 물데우기', time: '09:50', completions: {}, role: '주방' },
  { id: 'k7', title: '12. 돈까츠고기손질: 상등심, 등심, 안심, 치킨 200G 맞추어 손질, 치즈카츠', time: '09:55', completions: {}, role: '주방' },
  { id: 'k8', title: '13. 돈까츠 밀계: 부위별 1회 20인분', time: '10:00', completions: {}, role: '주방' },
  { id: 'k9', title: '9. 야채손질: 목이버섯, 대파, 양파, 양배추, 무우, 당근, 감자, 우엉, 가지, 토마토, 오이', time: '10:05', completions: {}, role: '주방' },
  { id: 'k10', title: '10. 고기손질: 챠슈 /순대 체크/ 돈지루 카레용( 돈까스고기 자투리)', time: '10:10', completions: {}, role: '주방' },
  { id: 'k11', title: '14. 카레만들기: 양파,고기 카레', time: '10:15', completions: {}, role: '주방' },
  { id: 'k12', title: '5. 사이드메뉴 체크: 교자만두, 가라아게, 새우튀김, 전쟁이튀김', time: '10:20', completions: {}, role: '주방' },
  { id: 'k13', title: '11. 돈지루 만들기: 연근, 당근, 무, 고기 참기름으로 볶아서 미림, 소주 넣고 볶아서넣기', time: '10:20', completions: {}, role: '주방' },
  { id: 'k14', title: '6. 계란삶기: 15개 구멍뚫어서 끓는물에 7분간 삶기', time: '10:25', completions: {}, role: '주방' },
  { id: 'k15', title: '7. 계란풀기: 10개 풀어놓기(가츠동/계란말이용)', time: '10:25', completions: {}, role: '주방' },
  { id: 'k16', title: '8. 계란말이만들기', time: '10:25', completions: {}, role: '주방' },

  // Kitchen Tasks - Business Start
  { id: 'k17', title: '주방 태블릿 체크: 재시작 및 프린터 용지 체크', time: '10:30', completions: {}, role: '주방' },
  { id: 'k18', title: '모든재료 재고파악후 주문', time: '10:30', completions: {}, role: '주방' },

  // Kitchen Tasks - Tomorrow Prep & Closing
  { id: 'k19', title: '익일 오전 영업분 고기 손질 후 숙성하기', time: '19:30', completions: {}, role: '주방' },
  { id: 'k20', title: '익일 오전 영업분 베타믹스, 빵가루 준비하기', time: '19:30', completions: {}, role: '주방' },
  { id: 'k21', title: '익일 오전 영업분 필요한 식자재 확인 후 해동하기', time: '19:30', completions: {}, role: '주방' },

  { id: 'k22', title: '마감준비1: 기본고명(계란, 목이버섯) 물 교체하기', time: '21:05', completions: {}, role: '주방' },
  { id: 'k23', title: '마감준비2: 냉장고 벽면 및 바닥 청소하기', time: '21:05', completions: {}, role: '주방' },
  { id: 'k24', title: '마감준비3: 쓰레기통 비우고 버리기', time: '21:05', completions: {}, role: '주방' },
  { id: 'k25', title: '마감준비4: 화구 쪽 청소하기 (후드, 벽면 및 주변정리)', time: '21:05', completions: {}, role: '주방' },
  { id: 'k26', title: '마감준비5: 튀김기 청소후 영상 인스타 업로드', time: '21:05', completions: {}, role: '주방' },

  { id: 'k27', title: '음식물 버리기: 음식물 버리기', time: '21:30', completions: {}, role: '주방' },
  { id: 'k28', title: '마감하기1: 면 삶는 기계 닦고 익일 사용 할 물 받아 놓기', time: '21:30', completions: {}, role: '주방' },
  { id: 'k29', title: '마감하기2: 튀김기 전원끄고 주변 정리정돈', time: '21:30', completions: {}, role: '주방' },
  { id: 'k30', title: '마감하기3: 화구 전원 끄고, 가스밸브 잠그고, 주변 정리하기', time: '21:30', completions: {}, role: '주방' },
  { id: 'k31', title: '마감하기4: 작업대 선반 닦고 지정된 위치로 정리하기', time: '21:30', completions: {}, role: '주방' },
  { id: 'k32', title: '마감하기5: 금일 사용한 도구 세척하기', time: '21:30', completions: {}, role: '주방' },
  { id: 'k33', title: '마감하기7', time: '21:30', completions: {}, role: '주방' },
  { id: 'k34', title: '전원끄기: 화구,튀김기,세척기, 가스밸브 꺼져있는지 한번더 확인 하기', time: '21:30', completions: {}, role: '주방' },
  { id: 'k35', title: '온도확인: 냉장고, 냉동고 온도 확인 후 잔디회신 적정온도 : 냉장고(3.5도), 냉동고(-18도)', time: '21:30', completions: {}, role: '주방' },
];

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [authForm, setAuthForm] = useState({ userId: '', password: '', name: '' });
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const [users, setUsers] = useState<User[]>([]);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  const [entries, setEntries] = useState<PLEntry[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [vendorList, setVendorList] = useState<Vendor[]>([]);
  const [fixedExpenseItems, setFixedExpenseItems] = useState<FixedExpenseItem[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [attendanceList, setAttendanceList] = useState<Attendance[]>([]);
  const [storeSettings, setStoreSettings] = useState<StoreSettings | null>(null);
  const [appMode, setAppMode] = useState<'admin' | 'staff_select' | 'staff_dashboard'>('admin');
  const [activeStaff, setActiveStaff] = useState<Staff | null>(null);
  const [staffTab, setStaffTab] = useState<'checklist' | 'inventory' | 'order'>('checklist');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<PLEntry | null>(null);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [isFixedExpenseModalOpen, setIsFixedExpenseModalOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [syncCode, setSyncCode] = useState('');
  const [editingInventory, setEditingInventory] = useState<InventoryItem | null>(null);

  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [periodTab, setPeriodTab] = useState<'day' | 'month' | 'year'>('month');

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  const getLocalISODate = (d: Date) => {
    const offset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - offset).toISOString().split('T')[0];
  };

  const todayStr = getLocalISODate(selectedDate);
  const thisMonthStr = todayStr.slice(0, 7);
  const currentDayOfMonth = selectedDate.getDate();
  const daysInMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate();

  const taskStats = useMemo(() => {
    if (tasks.length === 0) return { weekly: 0, monthly: 0 };
    const today = selectedDate;
    let weeklyCompletions = 0;
    let monthlyCompletions = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dStr = getLocalISODate(d);
      tasks.forEach(t => { if (t.completions[dStr]) weeklyCompletions++; });
    }
    const daysInMonth = today.getDate();
    for (let i = 0; i < daysInMonth; i++) {
      const d = new Date(today.getFullYear(), today.getMonth(), i + 1);
      const dStr = getLocalISODate(d);
      tasks.forEach(t => { if (t.completions[dStr]) monthlyCompletions++; });
    }
    return {
      weekly: (weeklyCompletions / (tasks.length * 7)) * 100,
      monthly: (monthlyCompletions / (tasks.length * daysInMonth)) * 100
    };
  }, [tasks, selectedDate]);

  const periodAnalysis = useMemo(() => {
    const prefix = periodTab === 'day' ? todayStr : periodTab === 'month' ? thisMonthStr : todayStr.slice(0, 4);
    const periodEntries = entries.filter(e => e.date.startsWith(prefix) && e.type === '지출');
    const totalExp = periodEntries.reduce((sum, e) => sum + e.amount, 0);
    
    const vendorStats = periodEntries.reduce((acc, e) => {
      const vName = e.vendorId ? vendorList.find(v => v.id === e.vendorId)?.name || '기타' : '기타';
      if (!acc[vName]) acc[vName] = { amount: 0, products: [] as any[] };
      acc[vName].amount += e.amount;
      if (e.products && e.products.length > 0) acc[vName].products.push(...e.products);
      return acc;
    }, {} as Record<string, {amount: number, products: any[]}>);

    const sortedVendors = Object.entries(vendorStats)
      .map(([name, data]) => ({ 
        name, 
        amount: (data as any).amount, 
        products: [...new Set(((data as any).products as any[]).map(p => p.name))] as string[], 
        ratio: totalExp > 0 ? ((data as any).amount / totalExp) * 100 : 0 
      }))
      .sort((a, b) => b.amount - a.amount);

    return { totalExp, vendors: sortedVendors };
  }, [entries, periodTab, vendorList, todayStr, thisMonthStr]);

  // 1. 로그인 시 사용자 데이터 로드 로직 강화 (서버 연동)
  useEffect(() => {
    if (currentUser) {
      const loadData = async () => {
        try {
          const response = await fetch(`/api/data/${currentUser.userId}`);
          const result = await response.json();
          
          if (result.success && result.data) {
            const parsed = result.data;
            setEntries(parsed.entries || []);
            let loadedStaff = parsed.staffList || INITIAL_STAFF;
            loadedStaff = loadedStaff.map((s: Staff) => {
              if (!s.role) {
                if (s.name.includes('주방')) return { ...s, role: '주방' };
                if (s.name.includes('서빙') || s.name.includes('홀')) return { ...s, role: '홀' };
                return { ...s, role: '홀' };
              }
              return s;
            });
            setStaffList(loadedStaff);

            setVendorList(parsed.vendorList || INITIAL_VENDORS);
            setFixedExpenseItems(parsed.fixedExpenseItems || INITIAL_FIXED_EXPENSES);
            
            let loadedTasks = parsed.tasks || [];
            
            // Update existing tasks with roles if they match INITIAL_TASKS
            loadedTasks = loadedTasks.map((t: Task) => {
              const initialTask = INITIAL_TASKS.find(it => it.title === t.title);
              if (initialTask && !t.role) {
                return { ...t, role: initialTask.role };
              }
              return t;
            });

            if (!loadedTasks.some((t: Task) => t.title === '유니폼 착용') || !loadedTasks.some((t: Task) => t.title.includes('가스밸브열기'))) {
              const existingTitles = new Set(loadedTasks.map((t: Task) => t.title));
              const newTasks = INITIAL_TASKS.filter(t => !existingTitles.has(t.title)).map(t => ({
                ...t,
                id: `t-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
              }));
              loadedTasks = [...loadedTasks, ...newTasks];
            }
            setTasks(loadedTasks);
            
            setInventory(parsed.inventory || []);
            setOrders(parsed.orders || []);
            setAttendanceList(parsed.attendanceList || []);
            setStoreSettings(parsed.storeSettings || null);
          } else {
            // 완전 처음인 경우만 초기 데이터 할당
            setEntries(INITIAL_ENTRIES);
            setStaffList(INITIAL_STAFF);
            setVendorList(INITIAL_VENDORS);
            setFixedExpenseItems(INITIAL_FIXED_EXPENSES);
            setTasks(INITIAL_TASKS);
          }
        } catch (e) {
          console.error('Failed to load data from server:', e);
          alert('데이터를 불러오는 중 오류가 발생했습니다.');
        } finally {
          setIsDataLoaded(true);
        }
      };
      loadData();
    } else {
      setIsDataLoaded(false);
    }
  }, [currentUser]);

  // 2. 데이터 변경 시 자동 저장 (서버 연동)
  useEffect(() => {
    if (currentUser && isDataLoaded) {
      const saveData = async () => {
        try {
          const dataToSave = { entries, staffList, vendorList, fixedExpenseItems, tasks, inventory, orders, attendanceList, storeSettings };
          await fetch(`/api/data/${currentUser.userId}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(dataToSave),
          });
        } catch (e) {
          console.error('Failed to save data to server:', e);
        }
      };
      
      // 디바운싱을 적용하여 너무 잦은 API 호출 방지
      const timeoutId = setTimeout(saveData, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [entries, staffList, vendorList, fixedExpenseItems, tasks, inventory, orders, attendanceList, storeSettings, currentUser, isDataLoaded]);

  const handleRunAnalysis = async () => {
    if (entries.length === 0) {
      alert('분석할 데이터가 없습니다.');
      return;
    }
    setIsAnalyzing(true);
    try {
      const result = await analyzeFinancials(entries);
      setAiAnalysis(result);
    } catch (error: any) {
      console.error('AI Analysis failed:', error);
      alert(error.message || 'AI 분석 중 오류가 발생했습니다.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/users');
      const result = await response.json();
      const currentUsers = result.success && result.data ? result.data : [];
      setUsers(currentUsers);

      if (isLoginMode) {
        const foundUser = currentUsers.find((u: any) => u.userId === authForm.userId && u.password === authForm.password);
        if (foundUser) {
          setCurrentUser(foundUser);
          if (foundUser.role === 'staff') {
            if (foundUser.staffId) {
              const staff = staffList.find(s => s.id === foundUser.staffId);
              if (staff) {
                setActiveStaff(staff);
                setAppMode('staff_dashboard');
                setStaffTab('checklist');
              } else {
                // staffId가 있지만 해당 직원을 찾을 수 없는 경우
                const staffByName = staffList.find(s => s.name === foundUser.name);
                if (staffByName) {
                  setActiveStaff(staffByName);
                  setAppMode('staff_dashboard');
                  setStaffTab('checklist');
                } else {
                  alert('연결된 직원 정보를 찾을 수 없습니다. 관리자에게 문의하세요.');
                  setAppMode('staff_select');
                }
              }
            } else {
              // staffId가 없는 경우 이름으로 매칭 시도
              const staff = staffList.find(s => s.name === foundUser.name);
              if (staff) {
                setActiveStaff(staff);
                setAppMode('staff_dashboard');
                setStaffTab('checklist');
              } else {
                setAppMode('staff_select');
              }
            }
          } else {
            setAppMode('admin');
          }
        } else {
          alert('아이디 또는 비밀번호가 일치하지 않습니다.');
        }
      } else {
        if (currentUsers.find((u: any) => u.userId === authForm.userId)) {
          alert('이미 존재하는 아이디입니다.');
          return;
        }
        
        const isFirstUser = currentUsers.length === 0;
        const newUser: User = { 
          id: `u-${Date.now()}`, 
          userId: authForm.userId, 
          password: authForm.password, 
          name: authForm.name,
          role: isFirstUser ? 'admin' : 'staff' 
        };
        
        const updatedUsers = [...currentUsers, newUser];
        
        await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedUsers)
        });
        
        alert('회원가입이 완료되었습니다. 로그인해주세요!');
        setIsLoginMode(true);
        setUsers(updatedUsers);
      }
    } catch (error) {
      console.error('Authentication error:', error);
      alert('인증 처리 중 오류가 발생했습니다.');
    }
  };

  const handleLogout = () => {
    if (window.confirm('로그아웃 하시겠습니까? 데이터는 이 기기에 안전하게 보관됩니다.')) {
      setCurrentUser(null);
      setEntries([]);
      setStaffList([]);
      setVendorList([]);
      setFixedExpenseItems([]);
      setIsDataLoaded(false);
    }
  };

  const generateSyncCode = () => {
    const data = { entries, staffList, vendorList, fixedExpenseItems };
    try {
      // Use a more robust way to handle Unicode in base64
      const jsonString = JSON.stringify(data);
      const utf8Bytes = new TextEncoder().encode(jsonString);
      const binaryString = Array.from(utf8Bytes).map(b => String.fromCharCode(b)).join('');
      const code = btoa(binaryString);
      
      setSyncCode(code);
      navigator.clipboard.writeText(code);
      alert('동기화 코드가 복사되었습니다! 다른 기기에서 불러오기 하세요.');
    } catch (e) {
      console.error('Sync code generation failed:', e);
      alert('코드 생성 중 오류가 발생했습니다.');
    }
  };

  const applySyncCode = (code: string) => {
    try {
      const binaryString = atob(code);
      const utf8Bytes = new Uint8Array(binaryString.split('').map(c => c.charCodeAt(0)));
      const jsonString = new TextDecoder().decode(utf8Bytes);
      const decoded = JSON.parse(jsonString);
      
      if (window.confirm('현재 데이터가 모두 교체됩니다. 계속하시겠습니까?')) {
        setEntries(decoded.entries || []);
        setStaffList(decoded.staffList || INITIAL_STAFF);
        setVendorList(decoded.vendorList || INITIAL_VENDORS);
        setFixedExpenseItems(decoded.fixedExpenseItems || INITIAL_FIXED_EXPENSES);
        setIsSyncModalOpen(false);
        alert('동기화 완료!');
      }
    } catch (e) {
      console.error('Sync code application failed:', e);
      alert('코드가 올바르지 않거나 손상되었습니다.');
    }
  };

  const monthlyLaborFixed = useMemo(() => staffList.filter(s => s.type === '정규직').reduce((acc, curr) => acc + curr.basePay, 0), [staffList]);
  const monthlyFixedCostOnly = useMemo(() => fixedExpenseItems.reduce((acc, curr) => acc + curr.monthlyAmount, 0), [fixedExpenseItems]);

  const calculateStats = (filteredEntries: PLEntry[], days: number, isMonth: boolean = false) => {
    const rev = filteredEntries.filter(e => e.type === '매출').reduce((acc, curr) => acc + curr.amount, 0);
    const actualExp = filteredEntries.filter(e => e.type === '지출').reduce((acc, curr) => acc + curr.amount, 0);
    
    // 고정비 안분 계산 (누적 기준)
    const laborFixedPart = (monthlyLaborFixed / daysInMonth) * days;
    const fixedExpensePart = (monthlyFixedCostOnly / daysInMonth) * days;
    
    // 전체 월 고정비 (비교용)
    const fullMonthLabor = monthlyLaborFixed;
    const fullMonthFixed = monthlyFixedCostOnly;

    const foodEntries = filteredEntries.filter(e => e.category === '식자재');
    const laborEntries = filteredEntries.filter(e => e.category === '인건비');
    const fixedManualEntries = filteredEntries.filter(e => ['월세', '관리비'].includes(e.category));
    const otherEntries = filteredEntries.filter(e => e.type === '지출' && !['식자재', '인건비', '월세', '관리비'].includes(e.category));
    const revenueEntries = filteredEntries.filter(e => e.type === '매출');
    
    const foodCost = foodEntries.reduce((acc, curr) => acc + curr.amount, 0);
    const variableLabor = laborEntries.reduce((acc, curr) => acc + curr.amount, 0);
    const manualFixed = fixedManualEntries.reduce((acc, curr) => acc + curr.amount, 0);
    const variableOthers = otherEntries.reduce((acc, curr) => acc + curr.amount, 0);
    
    const totalLabor = laborFixedPart + variableLabor;
    const totalFixed = fixedExpensePart + manualFixed;
    const totalExp = actualExp + laborFixedPart + fixedExpensePart;

    return {
      rev, 
      exp: totalExp, 
      profit: rev - totalExp, 
      foodCost, 
      laborCost: totalLabor, 
      fixedCost: totalFixed, 
      variableOthers,
      foodRatio: rev > 0 ? (foodCost / rev) * 100 : 0, 
      laborRatio: rev > 0 ? (totalLabor / rev) * 100 : 0, 
      fixedRatio: rev > 0 ? (totalFixed / rev) * 100 : 0, 
      othersRatio: rev > 0 ? (variableOthers / rev) * 100 : 0,
      fullMonthFixed: fullMonthLabor + fullMonthFixed,
      categories: { 
        revenue: { items: revenueEntries, total: rev },
        food: { items: foodEntries, total: foodCost }, 
        labor: { items: laborEntries, total: totalLabor, auto: laborFixedPart }, 
        fixed: { items: fixedManualEntries, total: totalFixed, auto: fixedExpensePart }, 
        others: { items: otherEntries, total: variableOthers } 
      }
    };
  };

  const dashboardStats = useMemo(() => {
    const todayEntries = entries.filter(e => e.date === todayStr);
    const monthEntries = entries.filter(e => e.date.startsWith(thisMonthStr));
    return { 
      today: calculateStats(todayEntries, 1), 
      month: calculateStats(monthEntries, currentDayOfMonth, true) 
    };
  }, [entries, todayStr, thisMonthStr, currentDayOfMonth, monthlyLaborFixed, monthlyFixedCostOnly, daysInMonth]);

  const handleSaveEntry = (entryData: any) => {
    let finalVendorId = entryData.vendorId;
    
    if (entryData.newVendorName) {
      const newVendor = { id: `v-${Date.now()}`, name: entryData.newVendorName };
      setVendorList(prev => [...prev, newVendor]);
      finalVendorId = newVendor.id;
    }

    const newEntry: PLEntry = {
      id: entryData.id || Math.random().toString(36).substr(2, 9),
      category: entryData.category,
      type: entryData.type,
      amount: entryData.amount,
      date: entryData.date,
      description: entryData.description,
      staffId: entryData.staffId,
      vendorId: finalVendorId,
      fixedExpenseId: entryData.fixedExpenseId,
      products: entryData.products
    };

    if (entryData.id) {
      setEntries(prev => prev.map(e => e.id === entryData.id ? newEntry : e));
    } else {
      setEntries(prev => [...prev, newEntry]);
      
      // 재고 자동 업데이트 (새로운 내역일 때만)
      if (entryData.products && entryData.products.length > 0) {
        setInventory(prevInventory => {
          const updatedInventory = [...prevInventory];
          entryData.products.forEach((p: any) => {
            const existingItemIndex = updatedInventory.findIndex(i => i.name === p.name && i.vendorId === finalVendorId);
            if (existingItemIndex >= 0) {
              updatedInventory[existingItemIndex] = {
                ...updatedInventory[existingItemIndex],
                currentStock: Number(updatedInventory[existingItemIndex].currentStock) + Number(p.quantity),
                pricePer10g: p.pricePer10g || updatedInventory[existingItemIndex].pricePer10g
              };
            } else {
              updatedInventory.push({
                id: `i-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                name: p.name,
                vendorId: finalVendorId,
                currentStock: Number(p.quantity),
                minimumStock: 0,
                unit: '개',
                pricePer10g: p.pricePer10g
              });
            }
          });
          return updatedInventory;
        });
        alert(`${entryData.products.length}개의 품목이 재고에 자동 등록/업데이트 되었습니다.`);
      }
    }
  };

  const openEditModal = (entry: PLEntry) => {
    setEditingEntry(entry);
    setIsModalOpen(true);
  };

  const openNewModal = () => {
    setEditingEntry(null);
    setIsModalOpen(true);
  };

  const handleDeleteEntry = (id: string) => {
    if (window.confirm('삭제하시겠습니까?')) {
      setEntries(prev => prev.filter(e => e.id !== id));
    }
  };

  if (currentUser && appMode === 'staff_select') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-[3rem] p-10 shadow-2xl">
          <h2 className="text-3xl font-black mb-2 text-center text-slate-900">직원 로그인</h2>
          <p className="text-center text-slate-500 font-bold mb-8">본인의 이름을 선택해주세요.</p>
          <div className="grid grid-cols-2 gap-4">
            {staffList.map(staff => (
              <button key={staff.id} onClick={() => { setActiveStaff(staff); setAppMode('staff_dashboard'); setStaffTab('checklist'); }} className="p-6 bg-slate-50 border border-slate-100 rounded-2xl font-black text-lg text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm">
                {staff.name}
              </button>
            ))}
          </div>
          <button onClick={() => setAppMode('admin')} className="mt-8 w-full py-4 text-slate-400 font-bold text-sm hover:text-slate-600">관리자 모드로 돌아가기</button>
        </div>
      </div>
    );
  }

  if (currentUser && appMode === 'staff_dashboard' && activeStaff) {
    const todayAttendance = attendanceList.find(a => a.staffId === activeStaff.id && a.date === todayStr);

    return (
      <div className="min-h-screen bg-[#f8f9fc] text-slate-900 pb-32">
        <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-2xl border-b border-slate-100 px-6 py-4">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black">{activeStaff.name.charAt(0)}</div>
              <div>
                <h1 className="text-lg font-black tracking-tighter">{activeStaff.name}님 환영합니다</h1>
                <span className="text-[10px] font-bold text-slate-400">{todayStr} 업무 대시보드</span>
              </div>
            </div>
            <button onClick={() => { setActiveStaff(null); setAppMode('staff_select'); }} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-black">로그아웃</button>
          </div>
        </nav>
        <main className="max-w-3xl mx-auto px-6 pt-8 space-y-8">
          {/* Attendance Section */}
          <section className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
            <h3 className="text-lg font-black text-slate-900 mb-4">근태 관리</h3>
            {!todayAttendance ? (
              <button 
                onClick={() => {
                  if (storeSettings) {
                    if (!navigator.geolocation) {
                      alert('위치 정보를 사용할 수 없습니다.');
                      return;
                    }
                    navigator.geolocation.getCurrentPosition((position) => {
                      const dist = getDistanceFromLatLonInKm(
                        storeSettings.latitude, storeSettings.longitude,
                        position.coords.latitude, position.coords.longitude
                      );
                      if (dist > storeSettings.radius) {
                        alert(`매장 근처에서만 출근 가능합니다. (현재 거리: ${Math.round(dist)}m)`);
                        return;
                      }
                      const now = new Date();
                      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
                      setAttendanceList(prev => [...prev, {
                        id: `att-${Date.now()}`,
                        staffId: activeStaff.id,
                        date: todayStr,
                        clockInTime: timeStr
                      }]);
                      alert(`${timeStr}에 출근 처리되었습니다.`);
                    }, (error) => {
                      alert('위치 정보를 가져올 수 없습니다: ' + error.message);
                    });
                  } else {
                    const now = new Date();
                    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
                    setAttendanceList(prev => [...prev, {
                      id: `att-${Date.now()}`,
                      staffId: activeStaff.id,
                      date: todayStr,
                      clockInTime: timeStr
                    }]);
                    alert(`${timeStr}에 출근 처리되었습니다.`);
                  }
                }}
                className="w-full py-4 bg-indigo-500 text-white rounded-2xl font-black text-lg shadow-lg shadow-indigo-200 hover:bg-indigo-600 transition-all"
              >
                출근하기
              </button>
            ) : !todayAttendance.clockOutTime ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                  <span className="text-indigo-900 font-bold">출근 시간</span>
                  <span className="text-2xl font-black text-indigo-600">{todayAttendance.clockInTime}</span>
                </div>
                <button 
                  onClick={() => {
                    if (storeSettings) {
                      if (!navigator.geolocation) {
                        alert('위치 정보를 사용할 수 없습니다.');
                        return;
                      }
                      navigator.geolocation.getCurrentPosition((position) => {
                        const dist = getDistanceFromLatLonInKm(
                          storeSettings.latitude, storeSettings.longitude,
                          position.coords.latitude, position.coords.longitude
                        );
                        if (dist > storeSettings.radius) {
                          alert(`매장 근처에서만 퇴근 가능합니다. (현재 거리: ${Math.round(dist)}m)`);
                          return;
                        }
                        const now = new Date();
                        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
                        setAttendanceList(prev => prev.map(a => a.id === todayAttendance.id ? { ...a, clockOutTime: timeStr } : a));
                        alert(`${timeStr}에 퇴근 처리되었습니다. 오늘도 고생하셨습니다!`);
                      }, (error) => {
                        alert('위치 정보를 가져올 수 없습니다: ' + error.message);
                      });
                    } else {
                      const now = new Date();
                      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
                      setAttendanceList(prev => prev.map(a => a.id === todayAttendance.id ? { ...a, clockOutTime: timeStr } : a));
                      alert(`${timeStr}에 퇴근 처리되었습니다. 오늘도 고생하셨습니다!`);
                    }
                  }}
                  className="w-full py-4 bg-rose-500 text-white rounded-2xl font-black text-lg shadow-lg shadow-rose-200 hover:bg-rose-600 transition-all"
                >
                  퇴근하기
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-slate-500 text-xs font-bold mb-1">출근</span>
                  <span className="text-xl font-black text-slate-900">{todayAttendance.clockInTime}</span>
                </div>
                <div className="flex flex-col items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-slate-500 text-xs font-bold mb-1">퇴근</span>
                  <span className="text-xl font-black text-slate-900">{todayAttendance.clockOutTime}</span>
                </div>
                <div className="col-span-2 text-center py-2 text-emerald-600 font-bold text-sm bg-emerald-50 rounded-xl">
                  오늘 업무가 종료되었습니다.
                </div>
              </div>
            )}
          </section>

          <div className="flex bg-slate-200/50 p-1.5 rounded-2xl">
            <button onClick={() => setStaffTab('checklist')} className={`flex-1 py-3 rounded-xl text-sm font-black transition-all ${staffTab === 'checklist' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>일일 체크리스트</button>
            <button onClick={() => setStaffTab('inventory')} className={`flex-1 py-3 rounded-xl text-sm font-black transition-all ${staffTab === 'inventory' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>재고 파악</button>
            <button onClick={() => setStaffTab('order')} className={`flex-1 py-3 rounded-xl text-sm font-black transition-all ${staffTab === 'order' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>발주 요청</button>
          </div>

          {staffTab === 'checklist' && (
            <div className="space-y-0">
              {tasks.filter(t => !t.role || t.role === '공통' || t.role === activeStaff.role).sort((a, b) => (a.time || '00:00').localeCompare(b.time || '00:00')).map((task, index, arr) => {
                const isCompleted = !!task.completions[todayStr];
                const isLast = index === arr.length - 1;
                return (
                  <div key={task.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-4 h-4 rounded-full mt-6 z-10 ring-4 ring-[#f8f9fc] ${isCompleted ? 'bg-indigo-500' : 'bg-slate-300'}`}></div>
                      {!isLast && <div className="w-0.5 h-full bg-slate-200 -mt-2"></div>}
                    </div>
                    <div className="flex-1 pb-6">
                      <div className={`p-5 rounded-2xl border flex items-center justify-between transition-all ${isCompleted ? 'bg-indigo-50 border-indigo-100' : 'bg-white border-slate-100 shadow-sm'}`}>
                        <div className="flex flex-col">
                          <span className={`text-xs font-black mb-1 ${isCompleted ? 'text-indigo-400' : 'text-slate-400'}`}>{task.time || '시간미정'}</span>
                          <span className={`font-bold text-lg ${isCompleted ? 'text-indigo-400 line-through' : 'text-slate-700'}`}>{task.title}</span>
                        </div>
                        <button onClick={() => {
                          setTasks(prev => prev.map(t => {
                            if (t.id === task.id) {
                              const newCompletions = { ...t.completions };
                              if (isCompleted) delete newCompletions[todayStr];
                              else newCompletions[todayStr] = activeStaff.id;
                              return { ...t, completions: newCompletions };
                            }
                            return t;
                          }));
                        }} className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${isCompleted ? 'bg-indigo-500 border-indigo-500 text-white shadow-lg shadow-indigo-200' : 'border-slate-200 text-transparent hover:border-indigo-300'}`}>
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
              {tasks.filter(t => !t.role || t.role === '공통' || t.role === activeStaff.role).length === 0 && <div className="text-center py-12 text-slate-400 font-bold">등록된 업무가 없습니다.</div>}
            </div>
          )}

          {staffTab === 'inventory' && (
            <div className="space-y-4">
              {inventory.map(item => (
                <div key={item.id} className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                  <div>
                    <h3 className="font-black text-slate-800 text-lg">{item.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-bold text-slate-400">적정 재고: {item.minimumStock}{item.unit}</span>
                      {item.pricePer10g && <span className="text-[10px] font-black bg-rose-50 text-rose-500 px-2 py-0.5 rounded-md">10g당 {item.pricePer10g.toLocaleString()}원</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setInventory(prev => prev.map(i => i.id === item.id ? { ...i, currentStock: Math.max(0, i.currentStock - 1) } : i))} className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 font-black text-xl flex items-center justify-center">-</button>
                    <span className="w-12 text-center font-black text-xl text-indigo-600">{item.currentStock}</span>
                    <button onClick={() => setInventory(prev => prev.map(i => i.id === item.id ? { ...i, currentStock: i.currentStock + 1 } : i))} className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 font-black text-xl flex items-center justify-center">+</button>
                  </div>
                </div>
              ))}
              {inventory.length === 0 && <div className="text-center py-12 text-slate-400 font-bold">등록된 재고 항목이 없습니다.</div>}
            </div>
          )}

          {staffTab === 'order' && (
            <div className="space-y-8">
              {vendorList.map(vendor => {
                const vendorItems = inventory.filter(i => i.vendorId === vendor.id);
                if (vendorItems.length === 0) return null;
                const lowStockItems = vendorItems.filter(i => i.currentStock <= i.minimumStock);
                return (
                  <div key={vendor.id} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                      <h3 className="font-black text-lg text-slate-800">{vendor.name}</h3>
                      <span className="text-xs font-bold text-rose-500 bg-rose-50 px-3 py-1 rounded-lg">부족 재고 {lowStockItems.length}건</span>
                    </div>
                    <div className="p-6 space-y-4">
                      {vendorItems.map(item => (
                        <div key={item.id} className="flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-700">{item.name}</span>
                            <span className={`text-[10px] font-black ${item.currentStock <= item.minimumStock ? 'text-rose-500' : 'text-slate-400'}`}>현재: {item.currentStock}{item.unit} / 기준: {item.minimumStock}{item.unit}</span>
                          </div>
                          <input 
                            type="number" 
                            placeholder="발주수량" 
                            id={`order-${item.id}`}
                            defaultValue={item.currentStock <= item.minimumStock ? item.minimumStock - item.currentStock + 1 : ''}
                            className="w-24 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-center font-black outline-none focus:border-indigo-500"
                          />
                        </div>
                      ))}
                      <button onClick={() => {
                        const orderItems: OrderItem[] = [];
                        vendorItems.forEach(item => {
                          const input = document.getElementById(`order-${item.id}`) as HTMLInputElement;
                          const qty = parseInt(input.value);
                          if (qty > 0) orderItems.push({ itemId: item.id, quantity: qty });
                        });
                        if (orderItems.length === 0) { alert('발주 수량을 입력해주세요.'); return; }
                        setOrders(prev => [...prev, {
                          id: `o-${Date.now()}`,
                          vendorId: vendor.id,
                          date: todayStr,
                          items: orderItems,
                          status: 'pending'
                        }]);
                        alert(`${vendor.name} 발주 요청이 저장되었습니다.`);
                        vendorItems.forEach(item => {
                          const input = document.getElementById(`order-${item.id}`) as HTMLInputElement;
                          if(input) input.value = '';
                        });
                      }} className="w-full mt-4 py-4 bg-indigo-600 text-white rounded-xl font-black shadow-lg hover:bg-indigo-700 transition-colors">
                        발주 요청 전송
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-20">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500 rounded-full blur-[120px]"></div>
        </div>
        <div className="w-full max-w-md bg-white/10 backdrop-blur-3xl rounded-[3rem] border border-white/20 p-12 shadow-2xl relative z-10">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-slate-900 mx-auto mb-6">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter">Smart P&L Analyst</h1>
            <p className="text-slate-400 text-sm mt-2 font-medium">안전한 개별 계정으로 시작하세요.</p>
          </div>
          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {!isLoginMode && <input type="text" required placeholder="사용자 이름" className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:ring-2 focus:ring-indigo-500" value={authForm.name} onChange={e => setAuthForm({...authForm, name: e.target.value})} />}
            <input type="text" required placeholder="아이디" className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none" value={authForm.userId} onChange={e => setAuthForm({...authForm, userId: e.target.value})} />
            <input type="password" required placeholder="비밀번호" className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none" value={authForm.password} onChange={e => setAuthForm({...authForm, password: e.target.value})} />
            <button type="submit" className="w-full bg-white text-slate-900 py-5 rounded-2xl font-black hover:bg-slate-100">{isLoginMode ? '로그인' : '가입하기'}</button>
          </form>
          <div className="mt-8 text-center">
            <button onClick={() => setIsLoginMode(!isLoginMode)} className="text-slate-400 text-xs font-bold hover:text-white underline">{isLoginMode ? '새 계정 만들기' : '이미 계정이 있으신가요? 로그인'}</button>
          </div>
        </div>
      </div>
    );
  }

  const getStaffMonthlyCost = (staffId: string, type: string, basePay: number) => {
    if (type === '정규직') {
      return Math.floor((basePay / daysInMonth) * currentDayOfMonth);
    }
    const staffEntries = entries.filter(e => e.category === '인건비' && e.staffId === staffId && e.date.startsWith(thisMonthStr));
    return staffEntries.reduce((sum, e) => sum + e.amount, 0);
  };

  const getDistanceFromLatLonInKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d * 1000; // Distance in meters
  };

  const CategoryAnalysisCard = ({ title, total, ratio, items, autoValue, colorClass, isExpense = true }: { title: string, total: number, ratio: number, items: PLEntry[], autoValue?: number, colorClass: string, isExpense?: boolean }) => (
    <div className="flex flex-col bg-white rounded-[2.5rem] border border-black/5 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
      <div className={`p-8 border-b border-slate-50 ${colorClass} bg-opacity-10`}>
        <div className="flex justify-between items-start mb-4">
          <span className="text-[12px] font-black uppercase text-slate-900 tracking-widest">{title}</span>
          <div className="flex flex-col items-end">
            <span className="text-[13px] font-black text-slate-900 bg-white px-4 py-1.5 rounded-full border border-slate-100 shadow-sm">
              {ratio.toFixed(0)}%
            </span>
          </div>
        </div>
        <div className="text-3xl font-black text-slate-900 tracking-tight whitespace-nowrap">
          {total.toLocaleString()}
          <span className="text-base ml-1 font-bold text-slate-900">원</span>
        </div>
      </div>
      <div className="p-6 flex-1 overflow-y-auto max-h-[300px] space-y-4 custom-scrollbar bg-slate-50/30">
        {autoValue && autoValue > 0 && (
          <div className="px-5 py-4 bg-indigo-50/80 rounded-2xl border border-dashed border-indigo-200 flex justify-between items-center text-[12px] font-bold text-indigo-600">
            <div className="flex flex-col">
              <span>시스템 안분 고정비</span>
              <span className="text-[10px] opacity-60">월 고정비의 일할 계산분</span>
            </div>
            <span className="font-black text-indigo-700">-{Math.round(autoValue).toLocaleString()}</span>
          </div>
        )}
        {items.length > 0 ? items.map(item => (
          <div key={item.id} className="flex items-center justify-between p-5 bg-white rounded-2xl border border-slate-100 group hover:border-indigo-300 hover:shadow-md transition-all">
            <div className="flex flex-col min-w-0">
              <span className="text-[11px] font-black text-slate-900 uppercase tracking-tighter">
                {item.date.slice(8)}일 • {item.category}
              </span>
              <span className="text-[14px] font-black text-slate-900 truncate leading-tight mt-1">
                {item.description}
              </span>
            </div>
            <div className="flex items-center gap-2 ml-2">
              <span className={`text-[14px] font-black ${isExpense ? 'text-rose-500' : 'text-emerald-500'} whitespace-nowrap`}>{isExpense ? '-' : '+'}{item.amount.toLocaleString()}</span>
              <div className="flex items-center gap-1">
                <button onClick={() => openEditModal(item)} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                </button>
                <button onClick={() => handleDeleteEntry(item.id)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>
          </div>
        )) : (!autoValue && <div className="text-center py-16 text-slate-300 font-bold text-sm">기록된 내역이 없습니다.</div>)}
      </div>
    </div>
  );

  const AnalysisReport = ({ stats, title, subtitle, isMonth = false }: { stats: any, title: string, subtitle: string, isMonth?: boolean }) => (
    <section className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-2">
        <div>
          <h2 className="text-5xl font-black tracking-tighter text-slate-900 leading-none">{title}</h2>
          <p className="text-slate-900 text-lg font-medium mt-3">{subtitle}</p>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-black/5 shadow-sm flex items-center gap-6">
          <div className="text-right border-r border-slate-100 pr-6">
            <span className="text-[10px] font-black text-slate-900 uppercase block mb-1">수익율</span>
            <span className={`text-2xl font-black ${stats.rev > 0 ? 'text-emerald-500' : 'text-slate-900'}`}>
              {(stats.rev > 0 ? (stats.profit / stats.rev) * 100 : 0).toFixed(0)}%
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-black text-slate-900 uppercase block mb-1">매출 대비 지출</span>
            <span className="text-2xl font-black text-slate-900">
              {(stats.rev > 0 ? (stats.exp / stats.rev) * 100 : 0).toFixed(0)}%
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
        <CategoryAnalysisCard title="매출 상세" total={stats.rev} ratio={100} items={stats.categories.revenue.items} colorClass="bg-indigo-500" isExpense={false} />
        <CategoryAnalysisCard title="식자재 지출" total={stats.foodCost} ratio={stats.foodRatio} items={stats.categories.food.items} colorClass="bg-emerald-500" />
        <CategoryAnalysisCard title="인건비 지출" total={stats.laborCost} ratio={stats.laborRatio} items={stats.categories.labor.items} autoValue={stats.categories.labor.auto} colorClass="bg-orange-500" />
        <CategoryAnalysisCard title="고정운영비" total={stats.fixedCost} ratio={stats.fixedRatio} items={stats.categories.fixed.items} autoValue={stats.categories.fixed.auto} colorClass="bg-blue-500" />
        <CategoryAnalysisCard title="비고정/기타" total={stats.variableOthers} ratio={stats.othersRatio} items={stats.categories.others.items} colorClass="bg-slate-500" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-10 rounded-[3rem] text-slate-900 flex flex-col justify-center shadow-2xl relative overflow-hidden group min-h-[180px]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
          <span className="text-[11px] font-black uppercase text-slate-900 mb-2 tracking-widest relative z-10">총 매출액</span>
          <div className="text-3xl md:text-4xl lg:text-5xl font-black text-indigo-600 relative z-10 whitespace-nowrap">
            {stats.rev.toLocaleString()}
            <span className="text-lg ml-1 text-slate-900">원</span>
          </div>
        </div>
        
        <div className="bg-white p-10 rounded-[3rem] border border-black/5 flex flex-col justify-center shadow-sm relative overflow-hidden group min-h-[180px]">
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full -mr-16 -mb-16 group-hover:scale-150 transition-transform duration-700"></div>
          <span className="text-[11px] font-black uppercase text-slate-900 mb-2 tracking-widest relative z-10">총 지출 (고정비 포함)</span>
          <div className="text-3xl md:text-4xl font-black text-rose-500 relative z-10 whitespace-nowrap">
            -{stats.exp.toLocaleString()}
            <span className="text-lg ml-1 text-slate-300">원</span>
          </div>
        </div>

        <div className={`p-10 rounded-[3rem] flex flex-col justify-center shadow-2xl transition-all duration-500 relative overflow-hidden group min-h-[180px] ${stats.profit >= 0 ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
          <span className="text-[11px] font-black uppercase opacity-60 mb-2 tracking-widest relative z-10">영업 이익</span>
          <div className="text-3xl md:text-4xl lg:text-5xl font-black relative z-10 whitespace-nowrap">
            {stats.profit.toLocaleString()}
            <span className="text-lg ml-1 opacity-60">원</span>
          </div>
          {isMonth && (
            <div className="mt-4 pt-4 border-t border-white/20 relative z-10">
              <span className="text-[10px] font-bold opacity-80">월말 예상 고정비: {stats.fullMonthFixed.toLocaleString()}원</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );

  return (
    <div className="min-h-screen bg-brand-orange text-slate-900 pb-32">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-2xl border-b border-black/5 px-6 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-900 shadow-lg">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter leading-none text-slate-900">메종드 쿠로이</h1>
              <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest mt-1 block">Smart P&L Analyst</span>
            </div>
          </div>
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-4 pr-8 border-r border-slate-200">
              <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-sm font-black text-slate-600 shadow-inner">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-black text-slate-800">{currentUser.name} 사장님</span>
                <button onClick={handleLogout} className="text-[10px] font-bold text-rose-500 text-left hover:underline">로그아웃</button>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => setAppMode('staff_select')} className="px-5 py-3 rounded-2xl bg-slate-800 text-white text-xs font-black flex items-center gap-2 hover:bg-black transition-colors shadow-lg">
                직원 모드
              </button>
              <button onClick={() => setIsSyncModalOpen(true)} className="px-5 py-3 rounded-2xl border border-slate-200 bg-white text-xs font-black flex items-center gap-2 hover:bg-slate-50 transition-colors shadow-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>
                데이터 연동
              </button>
              <button onClick={() => {
                if (!navigator.geolocation) {
                  alert('위치 정보를 사용할 수 없습니다.');
                  return;
                }
                navigator.geolocation.getCurrentPosition((position) => {
                  setStoreSettings({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    radius: 100 // 100m
                  });
                  alert('현재 위치가 매장 위치로 설정되었습니다. (반경 100m)');
                }, (error) => {
                  alert('위치 정보를 가져올 수 없습니다: ' + error.message);
                });
              }} className="px-5 py-3 rounded-2xl border border-slate-200 bg-white text-xs font-black flex items-center gap-2 hover:bg-slate-50 transition-colors shadow-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                매장 위치 설정
              </button>
              <button onClick={openNewModal} className="px-8 py-3 rounded-2xl bg-indigo-600 text-white text-sm font-black shadow-xl hover:bg-indigo-700 transition-all hover:scale-105 active:scale-95">
                신규 기록
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-16 space-y-32">
        {/* AI Insight Section */}
        <section className="bg-white rounded-[4rem] p-16 text-slate-900 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-2/3 h-full opacity-5 pointer-events-none transition-transform duration-1000 group-hover:scale-110">
             <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none"><path d="M0 100 C 20 0 50 0 100 100 Z" fill="currentColor" /></svg>
          </div>
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12 mb-16">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 text-[11px] font-black uppercase tracking-widest mb-6">
                  <span className="w-2.5 h-2.5 bg-indigo-600 rounded-full animate-pulse shadow-[0_0_10px_rgba(79,70,229,0.3)]"></span>
                  AI Financial Consultant
                </div>
                <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-none mb-6">AI 경영 인사이트</h2>
                <p className="text-slate-900 text-xl font-medium leading-relaxed">Gemini 3.1 Pro가 당신의 매장 데이터를 정밀 분석하여 수익성 개선 방안을 제시합니다.</p>
              </div>
              <button 
                onClick={handleRunAnalysis}
                disabled={isAnalyzing}
                className={`px-12 py-6 rounded-3xl font-black text-xl transition-all shadow-2xl ${isAnalyzing ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-black hover:scale-105 active:scale-95'}`}
              >
                {isAnalyzing ? (
                  <div className="flex items-center gap-4">
                    <div className="w-6 h-6 border-3 border-slate-300 border-t-transparent rounded-full animate-spin"></div>
                    분석 중...
                  </div>
                ) : '분석 시작하기'}
              </button>
            </div>

            {aiAnalysis ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="space-y-8">
          <div className="p-8 rounded-[2rem] bg-slate-50 border border-slate-100">
            <h3 className="text-indigo-600 font-black text-xs uppercase tracking-widest mb-4">Executive Summary</h3>
            <p className="text-lg font-bold leading-relaxed text-slate-900">{aiAnalysis.executiveSummary}</p>
          </div>
                  <div className="p-8 rounded-[2rem] bg-rose-50 border border-rose-100">
                    <h3 className="text-rose-600 font-black text-xs uppercase tracking-widest mb-4">Risk Factors</h3>
                    <ul className="space-y-3">
                      {aiAnalysis.riskFactors.map((risk: string, i: number) => (
                        <li key={i} className="flex gap-3 text-slate-900 font-bold">
                          <span className="text-rose-500 font-black">!</span>
                          {risk}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="space-y-8">
                  <div className="p-8 rounded-[2rem] bg-emerald-50 border border-emerald-100">
                    <h3 className="text-emerald-600 font-black text-xs uppercase tracking-widest mb-4">Key Insights</h3>
                    <ul className="space-y-4">
                      {aiAnalysis.keyInsights.map((insight: string, i: number) => (
                        <li key={i} className="flex gap-4 items-start">
                          <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-600 text-xs font-black shrink-0">{i+1}</div>
                          <p className="text-slate-900 font-bold leading-snug">{insight}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-8 rounded-[2rem] bg-indigo-50 border border-indigo-100">
                    <h3 className="text-indigo-600 font-black text-xs uppercase tracking-widest mb-4">Optimization Tips</h3>
                    <ul className="space-y-4">
                      {aiAnalysis.optimizationTips.map((tip: string, i: number) => (
                        <li key={i} className="flex gap-4 items-start">
                          <div className="w-6 h-6 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-600 text-xs font-black shrink-0">{i+1}</div>
                          <p className="text-slate-900 font-bold leading-snug">{tip}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ) : !isAnalyzing && (
              <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-[3rem]">
                <p className="text-slate-900 font-bold">데이터를 기반으로 맞춤형 분석을 받아보세요.</p>
              </div>
            )}
          </div>
        </section>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pt-20 border-t border-white/20">
          <div>
            <h2 className="text-5xl font-black tracking-tighter text-white drop-shadow-sm">대시보드 기준일 설정</h2>
            <p className="text-white/80 text-xl font-medium mt-3">선택한 날짜를 기준으로 손익 및 누적 데이터를 실시간 분석합니다.</p>
          </div>
          <input 
            type="date" 
            value={todayStr}
            onChange={(e) => {
              if (!e.target.value) return;
              const [y, m, d] = e.target.value.split('-');
              setSelectedDate(new Date(Number(y), Number(m) - 1, Number(d)));
            }}
            className="px-10 py-6 bg-white border-none rounded-[2rem] font-black text-slate-900 outline-none focus:ring-8 focus:ring-white/10 shadow-2xl text-xl min-w-[240px]"
          />
        </div>

        {/* Financial Performance Section */}
        <div className="bg-white/95 backdrop-blur-3xl rounded-[4rem] p-16 shadow-2xl border border-white/20 space-y-32">
          <AnalysisReport stats={dashboardStats.today} title={`${selectedDate.getMonth() + 1}월 ${selectedDate.getDate()}일 실적`} subtitle="선택하신 날짜의 상세 매출 비중 리포트입니다." />
          <div className="pt-32 border-t border-slate-100">
            <AnalysisReport stats={dashboardStats.month} title={`${selectedDate.getMonth() + 1}월 누적 성과`} subtitle="이번 달 현재까지의 통합 성과 리포트입니다." isMonth={true} />
          </div>
        </div>

        {/* Expenses & Vendors Section */}
        <div className="bg-white/95 backdrop-blur-3xl rounded-[4rem] p-16 shadow-2xl border border-white/20 space-y-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 px-2">
            <div>
              <h2 className="text-5xl font-black tracking-tighter text-slate-900 leading-none">지출 분석</h2>
              <p className="text-slate-900 text-lg font-medium mt-4">거래처별 지출 비중과 상세 내역을 확인하세요.</p>
            </div>
            <div className="flex bg-slate-100 p-2 rounded-2xl">
              <button onClick={() => setPeriodTab('day')} className={`px-8 py-3 rounded-xl text-xs font-black transition-all ${periodTab === 'day' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-900'}`}>일간</button>
              <button onClick={() => setPeriodTab('month')} className={`px-8 py-3 rounded-xl text-xs font-black transition-all ${periodTab === 'month' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-900'}`}>월간</button>
              <button onClick={() => setPeriodTab('year')} className={`px-8 py-3 rounded-xl text-xs font-black transition-all ${periodTab === 'year' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-900'}`}>연간</button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {periodAnalysis.vendors.length > 0 ? periodAnalysis.vendors.map((v, i) => (
              <div key={i} className="bg-white rounded-[3rem] border border-black/5 p-10 shadow-sm hover:shadow-xl transition-all group">
                <div className="flex justify-between items-start mb-8">
                  <div className="w-16 h-16 bg-slate-50 rounded-[1.5rem] flex items-center justify-center text-slate-900 font-black text-2xl group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors">
                    {v.name.charAt(0)}
                  </div>
                  <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-4 py-2 rounded-full">
                    {v.ratio.toFixed(0)}%
                  </span>
                </div>
                <h3 className="text-2xl font-black text-slate-800 mb-2">{v.name}</h3>
                <div className="text-3xl font-black text-slate-900 mb-8 whitespace-nowrap">{v.amount.toLocaleString()}<span className="text-base ml-1 font-bold text-slate-900">원</span></div>
                <div className="flex flex-wrap gap-2">
                  {v.products.map((p, j) => (
                    <span key={j} className="bg-slate-50 border border-slate-100 text-slate-900 px-4 py-2 rounded-2xl text-[11px] font-bold">{p}</span>
                  ))}
                </div>
              </div>
            )) : (
              <div className="col-span-full py-32 text-center text-slate-300 font-bold border-2 border-dashed border-slate-100 rounded-[4rem]">
                해당 기간에 기록된 지출 내역이 없습니다.
              </div>
            )}
          </div>
        </div>

        {/* Task & Orders Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Task Analytics */}
          <div className="bg-white/95 backdrop-blur-3xl rounded-[4rem] p-16 shadow-2xl border border-white/20">
            <h3 className="font-black text-slate-900 text-4xl tracking-tighter mb-12">직원 업무 달성률</h3>
            <div className="space-y-16">
              <div className="group">
                <div className="flex justify-between mb-6">
                  <span className="text-base font-black text-slate-900 uppercase tracking-widest">주간 달성률 (최근 7일)</span>
                  <span className="font-black text-indigo-600 text-3xl whitespace-nowrap">{taskStats.weekly.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-8 overflow-hidden shadow-inner">
                  <div className="bg-indigo-500 h-8 rounded-full transition-all duration-1000 shadow-[0_0_20px_rgba(99,102,241,0.4)]" style={{width: `${taskStats.weekly}%`}}></div>
                </div>
              </div>
              <div className="group">
                <div className="flex justify-between mb-6">
                  <span className="text-base font-black text-slate-900 uppercase tracking-widest">월간 달성률 (이번 달)</span>
                  <span className="font-black text-emerald-600 text-3xl whitespace-nowrap">{taskStats.monthly.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-8 overflow-hidden shadow-inner">
                  <div className="bg-emerald-500 h-8 rounded-full transition-all duration-1000 shadow-[0_0_20px_rgba(16,185,129,0.4)]" style={{width: `${taskStats.monthly}%`}}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Pending Orders */}
          <div className="bg-white/95 backdrop-blur-3xl rounded-[4rem] p-16 shadow-2xl border border-white/20 flex flex-col">
            <div className="flex justify-between items-center mb-12">
              <h3 className="font-black text-slate-900 text-4xl tracking-tighter">발주 요청 현황</h3>
              <span className="bg-rose-50 text-rose-600 px-6 py-3 rounded-2xl text-sm font-black shadow-sm">
                대기 {orders.filter(o => o.status === 'pending').length}건
              </span>
            </div>
            <div className="flex-1 overflow-y-auto max-h-[450px] space-y-8 custom-scrollbar pr-6">
              {orders.filter(o => o.status === 'pending').map(order => {
                const vendor = vendorList.find(v => v.id === order.vendorId);
                return (
                  <div key={order.id} className="p-8 bg-slate-50 rounded-[3rem] border border-slate-100 group hover:border-indigo-200 transition-all">
                    <div className="flex justify-between items-center mb-6">
                      <span className="font-black text-slate-800 text-2xl">{vendor?.name || '알 수 없는 거래처'}</span>
                      <span className="text-xs font-black text-slate-900">{order.date}</span>
                    </div>
                    <div className="flex flex-wrap gap-3 mb-8">
                      {order.items.map((oi, idx) => {
                        const item = inventory.find(i => i.id === oi.itemId);
                        return <span key={idx} className="bg-white border border-slate-200 px-4 py-2 rounded-2xl text-xs font-bold text-slate-600">{item?.name} {oi.quantity}{item?.unit}</span>;
                      })}
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: 'completed' } : o))} className="flex-1 py-5 bg-white border border-slate-200 text-slate-600 rounded-2xl text-sm font-black hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all shadow-sm">
                        입고 완료 처리
                      </button>
                      <button onClick={() => {
                        if (window.confirm('이 발주 요청을 삭제하시겠습니까?')) {
                          setOrders(prev => prev.filter(o => o.id !== order.id));
                        }
                      }} className="px-6 bg-rose-50 text-rose-500 rounded-2xl text-sm font-black hover:bg-rose-100 transition-all">
                        삭제
                      </button>
                    </div>
                  </div>
                );
              })}
              {orders.filter(o => o.status === 'pending').length === 0 && (
                <div className="text-center py-24 text-slate-300 font-bold text-lg border-2 border-dashed border-slate-100 rounded-[3rem]">
                  현재 대기 중인 발주 요청이 없습니다.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Management Section */}
        <section className="space-y-16 pb-32">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 px-2">
            <div>
              <h2 className="text-6xl font-black tracking-tighter text-white leading-none">경영 관리</h2>
              <p className="text-slate-900 text-xl font-medium mt-4">매장의 기초 환경 및 고정 지출을 관리합니다.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            <div className="lg:col-span-2 space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="p-12 rounded-[3.5rem] bg-white border border-black/5 shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 rounded-full -mr-24 -mt-24 group-hover:scale-150 transition-transform duration-700"></div>
                  <div className="flex justify-between items-start relative z-10">
                    <div className="min-w-0">
                      <span className="text-xs font-black text-indigo-600 uppercase block mb-4 tracking-widest">총 고정비 (월간)</span>
                      <h4 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tighter whitespace-nowrap text-slate-900">
                        {(monthlyLaborFixed + monthlyFixedCostOnly).toLocaleString()}
                        <span className="text-xl ml-1 text-slate-300">원</span>
                      </h4>
                    </div>
                    <button onClick={() => setIsFixedExpenseModalOpen(true)} className="bg-slate-900 hover:bg-black px-6 py-3 rounded-2xl text-white font-black text-sm transition-colors shrink-0 ml-4">수정</button>
                  </div>
                </div>
                <div className="p-12 rounded-[3.5rem] bg-white border border-black/5 shadow-sm flex flex-col justify-center relative overflow-hidden group">
                  <div className="absolute bottom-0 right-0 w-48 h-48 bg-slate-50 rounded-full -mr-24 -mb-24 group-hover:scale-150 transition-transform duration-700"></div>
                  <div className="relative z-10">
                    <span className="text-xs font-black text-slate-900 uppercase block mb-4 tracking-widest">등록된 직원</span>
                    <div className="flex items-center justify-between gap-4">
                      <h4 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter whitespace-nowrap">
                        {staffList.length}
                        <span className="text-xl ml-1 text-slate-300">명</span>
                      </h4>
                      <button onClick={() => setIsStaffModalOpen(true)} className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-sm hover:bg-black transition-colors shrink-0">관리</button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <button onClick={() => setIsVendorModalOpen(true)} className="p-12 rounded-[4rem] bg-white border border-black/5 shadow-sm hover:shadow-2xl transition-all flex items-center justify-between group">
                  <div className="flex items-center gap-8">
                    <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-[2rem] flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all duration-500">
                      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                    </div>
                    <div className="text-left">
                      <h4 className="text-2xl font-black text-slate-800">거래처 관리</h4>
                      <p className="text-sm font-bold text-slate-900 mt-2">{vendorList.length}개의 거래처 등록됨</p>
                    </div>
                  </div>
                  <svg className="w-8 h-8 text-slate-200 group-hover:text-slate-900 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
                </button>

                <button onClick={() => setIsTaskModalOpen(true)} className="p-12 rounded-[4rem] bg-white border border-black/5 shadow-sm hover:shadow-2xl transition-all flex items-center justify-between group">
                  <div className="flex items-center gap-8">
                    <div className="w-20 h-20 bg-orange-50 text-orange-500 rounded-[2rem] flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-all duration-500">
                      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                    </div>
                    <div className="text-left">
                      <h4 className="text-2xl font-black text-slate-800">업무 타임라인</h4>
                      <p className="text-sm font-bold text-slate-900 mt-2">{tasks.length}개의 일일 업무 등록됨</p>
                    </div>
                  </div>
                  <svg className="w-8 h-8 text-slate-200 group-hover:text-slate-900 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
                </button>

                <button onClick={() => setIsUserModalOpen(true)} className="p-12 rounded-[4rem] bg-white border border-black/5 shadow-sm hover:shadow-2xl transition-all flex items-center justify-between group md:col-span-2">
                  <div className="flex items-center gap-8">
                    <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-[2rem] flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-all duration-500">
                      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                    </div>
                    <div className="text-left">
                      <h4 className="text-2xl font-black text-slate-800">사용자 권한 관리</h4>
                      <p className="text-sm font-bold text-slate-900 mt-2">{users.length}명의 사용자 등록됨</p>
                    </div>
                  </div>
                  <svg className="w-8 h-8 text-slate-200 group-hover:text-slate-900 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-[4rem] p-16 text-slate-900 shadow-2xl flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-full h-full opacity-5 pointer-events-none">
                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none"><path d="M0 0 L 100 100 L 100 0 Z" fill="currentColor" /></svg>
              </div>
              <div className="relative z-10">
                <span className="text-xs font-black text-indigo-600 uppercase block mb-8 tracking-widest">Quick Actions</span>
                <h3 className="text-4xl font-black tracking-tighter mb-10 leading-tight">데이터를 안전하게<br/>관리하고 연동하세요.</h3>
                <div className="space-y-6">
                  <button onClick={generateSyncCode} className="w-full py-6 bg-slate-100 hover:bg-slate-200 rounded-[2rem] text-base font-black transition-all flex items-center justify-center gap-4">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    동기화 코드 생성
                  </button>
                  <button onClick={() => setIsInventoryModalOpen(true)} className="w-full py-6 bg-indigo-600 hover:bg-indigo-700 rounded-[2rem] text-base font-black transition-all shadow-xl flex items-center justify-center gap-4 text-white">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                    재고 품목 설정
                  </button>
                </div>
              </div>
              <div className="mt-16 pt-10 border-t border-slate-100 relative z-10">
                <p className="text-xs font-bold text-slate-900 leading-relaxed">모든 데이터는 실시간으로 클라우드에 안전하게 저장됩니다. 기기 변경 시 동기화 코드를 사용하세요.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {isSyncModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/80 backdrop-blur-2xl p-6">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl p-12">
            <div className="flex justify-between items-center mb-10"><div><h2 className="text-3xl font-black tracking-tighter">데이터 동기화 (Sync)</h2></div><button onClick={() => setIsSyncModalOpen(false)} className="bg-slate-100 p-3 rounded-2xl"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg></button></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100"><h3 className="font-black mb-2">1. 데이터 내보내기</h3><p className="text-[11px] text-slate-500 mb-4">현재 데이터를 코드로 생성하여 복사합니다.</p><button onClick={generateSyncCode} className="w-full bg-slate-900 text-white py-4 rounded-2xl text-xs font-black">코드 생성 & 복사</button></div>
              <div className="p-6 bg-indigo-50/50 rounded-[2rem] border border-indigo-100"><h3 className="font-black text-indigo-900 mb-2">2. 데이터 불러오기</h3><p className="text-[11px] text-indigo-600/70 mb-4">복사한 코드를 아래에 붙여넣으세요.</p><textarea className="w-full h-24 bg-white border border-indigo-100 rounded-xl p-3 text-[9px] outline-none mb-3" placeholder="여기에 코드를 붙여넣으세요..." onChange={(e) => setSyncCode(e.target.value)} /><button onClick={() => applySyncCode(syncCode)} className="w-full bg-indigo-600 text-white py-4 rounded-2xl text-xs font-black">데이터 불러오기</button></div>
            </div>
          </div>
        </div>
      )}

      {isFixedExpenseModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-xl p-4">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-lg p-12">
            <div className="flex justify-between items-center mb-10"><h2 className="text-3xl font-black tracking-tighter">고정 지출 설정</h2><button onClick={() => setIsFixedExpenseModalOpen(false)} className="bg-slate-100 p-3 rounded-2xl"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg></button></div>
            <form onSubmit={(e) => { e.preventDefault(); const formData = new FormData(e.currentTarget as HTMLFormElement); setFixedExpenseItems(prev => [...prev, { id: `fixed-${Date.now()}`, name: formData.get('name') as string, defaultCategory: formData.get('category') as any, monthlyAmount: Number(formData.get('amount')) }]); (e.target as HTMLFormElement).reset(); }} className="space-y-5 mb-10">
              <div className="grid grid-cols-2 gap-4"><input name="name" required placeholder="항목명" className="w-full px-5 py-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm" /><select name="category" className="w-full px-5 py-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm"><option value="월세">월세</option><option value="관리비">관리비</option><option value="비고정지출">기타 고정비</option></select></div>
              <input name="amount" type="number" required placeholder="월 고정 금액 (원)" className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none font-black text-xl" /><button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black">시스템 등록</button>
            </form>
            <div className="space-y-3 max-h-48 overflow-y-auto custom-scrollbar">{fixedExpenseItems.map(item => (<div key={item.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl"><span className="font-bold text-sm text-slate-700">{item.name} ({item.monthlyAmount.toLocaleString()}원)</span><button onClick={() => setFixedExpenseItems(l => l.filter(i => i.id !== item.id))} className="text-rose-400 text-[10px] font-black uppercase">삭제</button></div>))}</div>
          </div>
        </div>
      )}

      <EntryModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveEntry} onDelete={handleDeleteEntry} staffList={staffList} vendorList={vendorList} fixedExpenseItems={fixedExpenseItems} initialData={editingEntry} selectedDateStr={todayStr} />
      
      {isStaffModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-xl p-4">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-lg p-12">
            <div className="flex justify-between items-center mb-10"><h2 className="text-3xl font-black tracking-tighter">인사 관리</h2><button onClick={() => setIsStaffModalOpen(false)} className="bg-slate-100 p-3 rounded-2xl"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg></button></div>
            <form onSubmit={(e) => { 
              e.preventDefault(); 
              const formData = new FormData(e.currentTarget as HTMLFormElement); 
              const name = formData.get('name') as string;
              const type = formData.get('type') as any;
              const role = formData.get('role') as any;
              const basePay = Number(formData.get('pay'));

              if (editingStaff) {
                setStaffList(prev => prev.map(s => s.id === editingStaff.id ? { ...s, name, type, role, basePay } : s));
                setEditingStaff(null);
              } else {
                setStaffList(prev => [...prev, { id: `s-${Date.now()}`, name, type, role, basePay }]); 
              }
              (e.target as HTMLFormElement).reset(); 
            }} className="space-y-4 mb-10">
              <div className="grid grid-cols-3 gap-4">
                <input name="name" required defaultValue={editingStaff?.name || ''} placeholder="성함" className="px-5 py-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm" />
                <select name="type" defaultValue={editingStaff?.type || '정규직'} className="px-5 py-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm"><option value="정규직">정규직</option><option value="알바">알바</option></select>
                <select name="role" defaultValue={editingStaff?.role || '홀'} className="px-5 py-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm"><option value="홀">홀</option><option value="주방">주방</option></select>
              </div>
              <input name="pay" type="number" required defaultValue={editingStaff?.basePay ?? ''} placeholder="월급 또는 시급" className="w-full px-5 py-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm" />
              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-slate-900 text-white py-5 rounded-[2rem] font-black">{editingStaff ? '직원 수정' : '직원 추가'}</button>
                {editingStaff && <button type="button" onClick={() => setEditingStaff(null)} className="px-6 bg-slate-100 text-slate-600 rounded-[2rem] font-black">취소</button>}
              </div>
            </form>
            <div className="space-y-3 max-h-48 overflow-y-auto custom-scrollbar">{staffList.map(s => (<div key={s.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl"><div className="flex flex-col"><span className="font-bold text-sm text-slate-700">{s.name} ({s.type} / {s.role || '미지정'}: {s.basePay.toLocaleString()}원)</span><span className="text-[10px] text-indigo-500 font-bold mt-1">이번 달 누적 인건비: {getStaffMonthlyCost(s.id, s.type, s.basePay).toLocaleString()}원</span></div><div className="flex gap-2"><button onClick={() => setEditingStaff(s)} className="text-indigo-400 text-[10px] font-black uppercase">수정</button><button onClick={() => setStaffList(l => l.filter(i => i.id !== s.id))} className="text-rose-400 text-[10px] font-black uppercase">삭제</button></div></div>))}</div>
          </div>
        </div>
      )}

      {isVendorModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-xl p-4">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-lg p-12">
            <div className="flex justify-between items-center mb-10"><h2 className="text-3xl font-black tracking-tighter">거래처 관리</h2><button onClick={() => setIsVendorModalOpen(false)} className="bg-slate-100 p-3 rounded-2xl"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg></button></div>
            <form onSubmit={(e) => { 
              e.preventDefault(); 
              const formData = new FormData(e.currentTarget as HTMLFormElement); 
              const name = formData.get('name') as string;

              if (editingVendor) {
                setVendorList(prev => prev.map(v => v.id === editingVendor.id ? { ...v, name } : v));
                setEditingVendor(null);
              } else {
                setVendorList(prev => [...prev, { id: `v-${Date.now()}`, name }]); 
              }
              (e.target as HTMLFormElement).reset(); 
            }} className="space-y-4 mb-10">
              <input name="name" required defaultValue={editingVendor?.name || ''} placeholder="업체명 (예: 식자재마트)" className="w-full px-5 py-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm" />
              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-emerald-600 text-white py-5 rounded-[2rem] font-black shadow-2xl shadow-emerald-100">{editingVendor ? '거래처 수정' : '거래처 등록'}</button>
                {editingVendor && <button type="button" onClick={() => setEditingVendor(null)} className="px-6 bg-slate-100 text-slate-600 rounded-[2rem] font-black">취소</button>}
              </div>
            </form>
            <div className="space-y-3 max-h-48 overflow-y-auto custom-scrollbar">{vendorList.map(v => (<div key={v.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl"><span className="font-bold text-sm text-slate-700">{v.name}</span><div className="flex gap-2"><button onClick={() => setEditingVendor(v)} className="text-indigo-400 text-[10px] font-black uppercase">수정</button><button onClick={() => setVendorList(l => l.filter(i => i.id !== v.id))} className="text-rose-400 text-[10px] font-black uppercase">삭제</button></div></div>))}</div>
          </div>
        </div>
      )}

      {isTaskModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-xl p-4">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-lg p-12">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-3xl font-black tracking-tighter">업무 타임라인 관리</h2>
              <div className="flex items-center gap-3">
                <button onClick={() => {
                  if (window.confirm('기본 오전 체크리스트를 불러오시겠습니까? 기존 항목 뒤에 추가됩니다.')) {
                    setTasks(prev => {
                      const existingTitles = new Set(prev.map(t => t.title));
                      const newTasks = INITIAL_TASKS.filter(t => !existingTitles.has(t.title)).map(t => ({
                        ...t,
                        id: `t-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
                      }));
                      return [...prev, ...newTasks];
                    });
                  }
                }} className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl text-xs font-black hover:bg-indigo-100 transition-colors">
                  기본 체크리스트 불러오기
                </button>
                <button onClick={() => { setIsTaskModalOpen(false); setEditingTask(null); }} className="bg-slate-100 p-3 rounded-2xl"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg></button>
              </div>
            </div>
            <form onSubmit={(e) => { 
              e.preventDefault(); 
              const formData = new FormData(e.currentTarget as HTMLFormElement); 
              const title = formData.get('title') as string;
              const time = formData.get('time') as string;
              const role = formData.get('role') as any;
              if (editingTask) {
                setTasks(prev => prev.map(t => t.id === editingTask.id ? { ...t, title, time, role } : t));
                setEditingTask(null);
              } else {
                setTasks(prev => [...prev, { id: `t-${Date.now()}`, title, time, role, completions: {} }]); 
              }
              (e.target as HTMLFormElement).reset(); 
            }} className="space-y-4 mb-6">
              <div className="flex gap-3">
                <input name="time" type="time" required defaultValue={editingTask?.time || ''} className="w-1/4 px-5 py-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm" />
                <select name="role" defaultValue={editingTask?.role || '공통'} className="w-1/4 px-5 py-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm">
                  <option value="공통">공통</option>
                  <option value="홀">홀</option>
                  <option value="주방">주방</option>
                </select>
                <input name="title" required defaultValue={editingTask?.title || ''} placeholder="업무명 (예: 홀 바닥 청소)" className="w-2/4 px-5 py-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm" />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-slate-900 text-white py-5 rounded-[2rem] font-black">{editingTask ? '업무 수정' : '업무 추가'}</button>
                {editingTask && <button type="button" onClick={() => setEditingTask(null)} className="px-6 bg-slate-100 text-slate-600 rounded-[2rem] font-black">취소</button>}
              </div>
            </form>

            <div className="flex gap-2 mb-4">
              <button onClick={() => setStaffTab('checklist')} className={`px-4 py-2 rounded-xl text-xs font-black transition-colors ${staffTab === 'checklist' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'}`}>전체</button>
              <button onClick={() => setStaffTab('inventory')} className={`px-4 py-2 rounded-xl text-xs font-black transition-colors ${staffTab === 'inventory' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'}`}>홀</button>
              <button onClick={() => setStaffTab('order')} className={`px-4 py-2 rounded-xl text-xs font-black transition-colors ${staffTab === 'order' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'}`}>주방</button>
            </div>

            <div className="space-y-3 max-h-48 overflow-y-auto custom-scrollbar">
              {tasks
                .filter(t => {
                  if (staffTab === 'checklist') return true;
                  if (staffTab === 'inventory') return t.role === '홀' || t.role === '공통';
                  if (staffTab === 'order') return t.role === '주방' || t.role === '공통';
                  return true;
                })
                .sort((a, b) => (a.time || '00:00').localeCompare(b.time || '00:00'))
                .map(t => (
                <div key={t.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <span className="text-indigo-600 font-black text-sm">{t.time || '시간미정'}</span>
                    <span className="px-2 py-1 bg-slate-200 text-slate-600 rounded-lg text-[10px] font-black">{t.role || '공통'}</span>
                    <span className="font-bold text-sm text-slate-700">{t.title}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setEditingTask(t)} className="text-indigo-400 text-[10px] font-black uppercase">수정</button>
                    <button onClick={() => setTasks(l => l.filter(i => i.id !== t.id))} className="text-rose-400 text-[10px] font-black uppercase">삭제</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {isInventoryModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-xl p-4">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-lg p-12">
            <div className="flex justify-between items-center mb-10"><h2 className="text-3xl font-black tracking-tighter">재고 품목 관리</h2><button onClick={() => { setIsInventoryModalOpen(false); setEditingInventory(null); }} className="bg-slate-100 p-3 rounded-2xl"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg></button></div>
            <form onSubmit={(e) => { 
              e.preventDefault(); 
              const formData = new FormData(e.currentTarget as HTMLFormElement); 
              const name = formData.get('name') as string;
              const vendorId = formData.get('vendorId') as string;
              const currentStock = Number(formData.get('currentStock'));
              const minimumStock = Number(formData.get('minimumStock'));
              const unit = formData.get('unit') as string;

              if (editingInventory) {
                setInventory(prev => prev.map(i => i.id === editingInventory.id ? { ...i, name, vendorId, currentStock, minimumStock, unit } : i));
                setEditingInventory(null);
              } else {
                setInventory(prev => [...prev, { 
                  id: `i-${Date.now()}`, 
                  name, vendorId, currentStock, minimumStock, unit 
                }]); 
              }
              (e.target as HTMLFormElement).reset(); 
            }} className="space-y-4 mb-10">
              <input name="name" required defaultValue={editingInventory?.name || ''} placeholder="품목명 (예: 양파)" className="w-full px-5 py-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm" />
              <select name="vendorId" required defaultValue={editingInventory?.vendorId || ''} className="w-full px-5 py-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm">
                <option value="">발주처 선택</option>
                {vendorList.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
              <div className="grid grid-cols-3 gap-3">
                <input name="currentStock" type="number" required defaultValue={editingInventory?.currentStock ?? ''} placeholder="현재고" className="px-5 py-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm" />
                <input name="minimumStock" type="number" required defaultValue={editingInventory?.minimumStock ?? ''} placeholder="안전재고" className="px-5 py-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm" />
                <input name="unit" required defaultValue={editingInventory?.unit || ''} placeholder="단위 (kg, 개)" className="px-5 py-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm" />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-slate-900 text-white py-5 rounded-[2rem] font-black">{editingInventory ? '품목 수정' : '품목 추가'}</button>
                {editingInventory && <button type="button" onClick={() => setEditingInventory(null)} className="px-6 bg-slate-100 text-slate-600 rounded-[2rem] font-black">취소</button>}
              </div>
            </form>
            <div className="space-y-3 max-h-48 overflow-y-auto custom-scrollbar">{inventory.map(i => (<div key={i.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl"><div className="flex flex-col"><div className="flex items-center gap-2"><span className="font-bold text-sm text-slate-700">{i.name}</span>{i.pricePer10g && <span className="text-[10px] font-black bg-rose-50 text-rose-500 px-2 py-0.5 rounded-md">10g당 {i.pricePer10g.toLocaleString()}원</span>}</div><span className="text-[10px] text-slate-900 mt-1">현재: {i.currentStock}{i.unit} / 기준: {i.minimumStock}{i.unit}</span></div><div className="flex gap-2"><button onClick={() => setEditingInventory(i)} className="text-indigo-400 text-[10px] font-black uppercase">수정</button><button onClick={() => setInventory(l => l.filter(x => x.id !== i.id))} className="text-rose-400 text-[10px] font-black uppercase">삭제</button></div></div>))}</div>
          </div>
        </div>
      )}

      {isUserModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-xl p-4">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-lg p-12">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-3xl font-black tracking-tighter">사용자 권한 관리</h2>
              <button onClick={() => { setIsUserModalOpen(false); setEditingUser(null); }} className="bg-slate-100 p-3 rounded-2xl">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form onSubmit={async (e) => { 
              e.preventDefault(); 
              const formData = new FormData(e.currentTarget as HTMLFormElement); 
              const name = formData.get('name') as string;
              const userId = formData.get('userId') as string;
              const password = formData.get('password') as string;
              const role = formData.get('role') as 'admin' | 'staff';
              const staffId = formData.get('staffId') as string;

              let updatedUsers;
              if (editingUser) {
                updatedUsers = users.map(u => u.id === editingUser.id ? { 
                  ...u, 
                  name, 
                  userId, 
                  role, 
                  staffId: role === 'staff' ? staffId : undefined,
                  password: password || u.password
                } : u);
                setEditingUser(null);
              } else {
                if (users.find(u => u.userId === userId)) {
                  alert('이미 존재하는 아이디입니다.');
                  return;
                }
                updatedUsers = [...users, { 
                  id: `u-${Date.now()}`, 
                  userId, 
                  password, 
                  name, 
                  role,
                  staffId: role === 'staff' ? staffId : undefined
                }]; 
              }
              
              setUsers(updatedUsers);
              await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedUsers)
              });
              
              (e.target as HTMLFormElement).reset(); 
            }} className="space-y-4 mb-10">
              <div className="grid grid-cols-2 gap-4">
                <input name="name" required defaultValue={editingUser?.name || ''} placeholder="이름" className="px-5 py-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm" />
                <input name="userId" required defaultValue={editingUser?.userId || ''} placeholder="아이디" className="px-5 py-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm" />
              </div>
              <input name="password" type="password" placeholder={editingUser ? "비밀번호 (변경시에만 입력)" : "비밀번호"} required={!editingUser} className="w-full px-5 py-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm" />
              
              <div className="grid grid-cols-2 gap-4">
                <select name="role" defaultValue={editingUser?.role || 'staff'} className="px-5 py-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm">
                  <option value="staff">직원</option>
                  <option value="admin">관리자</option>
                </select>
                <select name="staffId" defaultValue={editingUser?.staffId || ''} className="px-5 py-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm">
                  <option value="">직원 연결 (선택)</option>
                  {staffList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-slate-900 text-white py-5 rounded-[2rem] font-black">{editingUser ? '사용자 수정' : '사용자 추가'}</button>
                {editingUser && <button type="button" onClick={() => setEditingUser(null)} className="px-6 bg-slate-100 text-slate-600 rounded-[2rem] font-black">취소</button>}
              </div>
            </form>

            <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
              {users.map(u => (
                <div key={u.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-700">{u.name} ({u.userId})</span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${u.role === 'admin' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-600'}`}>
                        {u.role === 'admin' ? '관리자' : '직원'}
                      </span>
                    </div>
                    {u.role === 'staff' && u.staffId && (
                      <span className="text-[10px] text-slate-400 mt-1">
                        연결된 직원: {staffList.find(s => s.id === u.staffId)?.name || '미확인'}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setEditingUser(u)} className="text-indigo-400 text-[10px] font-black uppercase">수정</button>
                    <button onClick={async () => {
                      if (window.confirm('정말 삭제하시겠습니까?')) {
                        const updatedUsers = users.filter(user => user.id !== u.id);
                        setUsers(updatedUsers);
                        await fetch('/api/users', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(updatedUsers)
                        });
                      }
                    }} className="text-rose-400 text-[10px] font-black uppercase">삭제</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
