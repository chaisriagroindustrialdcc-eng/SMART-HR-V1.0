import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Swal from 'sweetalert2';
import * as Icons from 'lucide-react';
import { dbSync } from '../../services/dbSync';
import { DraggableModal } from '../../components/shared/DraggableModal';
import UserGuideButton from '../../components/shared/UserGuideButton';

// Styling Configuration
const THEME = {
  primary: '#b22026', // Red
  secondary: '#3f809e', // Blue
  accent: '#b58c4f', // Gold/Sand
  bgMain: 'transparent',
  textMain: '#2f2926',
  palette: {
    navy: '#212c46',
    charcoal: '#414757',
    sand: '#b7a159',
    gold: '#b58c4f',
    forest: '#508660',
    rose: '#ab7d82',
    slate: '#748b9e',
    cream: '#f3f3f1'
  }
};

const INITIAL_NEWS = [
  {
    id: 'NEWS-2026-001',
    category: 'HR ANNOUNCEMENT',
    title: 'นโยบายยืดหยุ่นเวลาทำงานแบบไฮบริด (Work from Anywhere)',
    date: '2026-06-01',
    preview: 'ประกาศหลักเกณฑ์การทำงานรูปแบบไฮบริดเพื่อสนับสนุนความสมดุลชีวิตและการทำงานของพนักงาน...',
    fullText: 'เพื่อส่งเสริมสิ่งแวดล้อมการทำงานที่ดีและตอบรับไลฟ์สไตล์แบบครอบคลุม คณะกรรมการบริหารได้อนุมัติให้พนักงานสายสนับสนุนส่วนกลางสามารถทำงานจากภายนอกได้สูงสุด 2 วันต่อสัปดาห์ โดยต้องแจ้งผู้บังคับบัญชาสายงานผ่านระบบ HR Portal และรักษามาตรฐานระดับการให้บริการ (SLA) ตามข้อกำหนดของแผนก',
    author: 'PEOPLE TEAM',
    image: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=800'
  },
  {
    id: 'NEWS-2026-002',
    category: 'EVENT',
    title: 'สัมมนาใหญ่ประจำปี Townhall Q2/2026 และปาร์ตี้กลางแปลง',
    date: '2026-06-15',
    preview: 'เชิญชวนเพื่อนพนักงานรับฟังสรุปผลการดำเนินงานไตรมาสที่ 2 และร่วมสนุกกับซุ้มกิจกรรม...',
    fullText: 'พบปะพูดคุยแบบเป็นกันเองกับทีมผู้บริหาร รับทราบความคืบหน้าของยอดส่งออกประจำไตรมาส พร้อมร่วมเฉลิมฉลองครบรอบปีบริษัทด้วยกิจกรรมแจกของรางวัลสุดพิเศษ ซุ้มอาหารท้องถิ่น และเซสชันดนตรีสด จัดขึ้น ณ สนามสวัสดิการพนักงานตั้งเวลา 17.30น. เป็นต้นไป',
    author: 'INTERNAL COMMS',
    image: 'https://images.unsplash.com/photo-1511632765486-a01c80cf59af?q=80&w=800'
  },
  {
    id: 'NEWS-2026-003',
    category: 'WELFARE',
    title: 'ยกระดับตรวจสุขภาพประจำปี พร้อมคลินิกให้คำปรึกษาทางจิตวิทยาฟรี',
    date: '2026-05-20',
    preview: 'เพิ่มรายการคัดกรองโรคความเสี่ยงสูง และขยายสิทธิการดูแลสุขภาพจิตของพนักงานและครบครัว...',
    fullText: 'ความสุขและสุขภาพกายสุขภาพใจของบุคลากรคือเป้าหมายสำคัญของเรา บริษัทได้ยกระดับสิทธิประโยชน์สวัสดิการตรวจสุขภาพโดยรวมชุดพยาบาลผู้ป่วยใน สกรีนมะเร็งเชิงลึก และเพิ่มหมุดหมายการปรึกษาแพทย์เฉพาะทางด้านสุขภาพใจกับจิตแพทย์โดยไม่มีการเปิดเผยข้อมูลส่วนบุคคลหรือรายงานผู้บังคับบัญชา',
    author: 'HR WELFARE',
    image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?q=80&w=800'
  }
];

// User Guide Panel components
function UserGuidePanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (typeof document === 'undefined') return null;
  return createPortal(
    <>
      <div className={`fixed inset-0 z-[190] bg-[#212c46]/60 backdrop-blur-sm transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose} />
      <div className={`fixed inset-y-0 right-0 z-[200] w-full md:w-[480px] bg-white shadow-2xl transform transition-transform duration-500 ease-in-out flex flex-col border-l-4 border-[#b7a159] ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="bg-[#212c46] px-6 py-5 flex justify-between items-center text-white shrink-0 border-b border-[#414757]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center text-white shadow-inner"><Icons.BookOpen size={18} /></div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest leading-none mb-1">INTERNAL PR MANUAL</h3>
              <p className="text-[10px] font-bold text-white/70 uppercase tracking-wider">คู่มือดูแลและกระจายข่าวสารองค์กร</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-all text-white/70 hover:text-white cursor-pointer"><Icons.X size={18} /></button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-[#414757] text-[12px] leading-relaxed">
          <section className="animate-fadeIn">
            <h4 className="text-[13px] font-black text-[#212c46] mb-2 uppercase flex items-center gap-2 border-b border-slate-100 pb-1.5 font-sans">
              <Icons.Megaphone size={15} className="text-[#b22026]" /> 1. ประโยชน์และคุณค่าข่าวสารภายใน
            </h4>
            <p className="text-slate-600 font-semibold mb-2">เป็นช่องทางหลักสำหรับการสื่อสารนโยบายสำคัญ กิจกรรม และข่าวสารสวัสดิการถึงพนักงานทุกคนอย่างทั่วถึง:</p>
            <ul className="list-disc pl-5 space-y-1 text-slate-500">
              <li><strong className="text-slate-700">HR Announcement:</strong> ประกาศนโยบาย กฎระเบียบปฏิบัติ หรือคำสั่งปรับตำแหน่ง</li>
              <li><strong className="text-slate-700">Event News:</strong> แจ้งแผนจัดกิจกรรมทางสังคม สังสรรค์ หรือนัดกีฬา</li>
              <li><strong className="text-slate-700">Welfare Update:</strong> เผยแพร่รายละเอียดเกี่ยวกับสิทธิ์การรักษาสุขภาพและกองทุนต่างๆ</li>
            </ul>
          </section>

          <section className="animate-fadeIn">
            <h4 className="text-[13px] font-black text-[#212c46] mb-2 uppercase flex items-center gap-2 border-b border-slate-100 pb-1.5 font-sans">
              <Icons.ShieldCheck size={15} className="text-emerald-600" /> 2. การควบคุมความปลอดภัยของข้อมูล
            </h4>
            <p className="text-slate-600">ข้อมูลทั้งหมดจะทำการจัดเก็บแบบบูรณาการร่วมกับระบบคลาวด์ Firestore และนำส่งจัดระเบียบใน Google Sheets ส่วนกลาง ช่วยให้ฝ่ายอำนวยการและพนักงานทั่วไปเห็นข้อมูลพร้อมกันโดยไม่ติดขัด</p>
          </section>
        </div>
        
        <div className="p-4 bg-[#f8f9fa] border-t border-[#eaeaec] flex justify-between items-center">
          <span className="text-[9px] font-bold text-slate-400">VERSION 1.0</span>
          <button onClick={onClose} className="px-6 py-2 bg-[#212c46] hover:bg-[#3f809e] text-white font-black rounded-lg uppercase text-[10px] tracking-wider cursor-pointer">Got it</button>
        </div>
      </div>
    </>,
    document.body
  );
}

// KPI Dashboard Widget Component
const KpiCard = ({ icon: Icon, value, label, subtitle, bgAccent, color }: any) => (
  <div className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
    <div className={`absolute -right-4 -bottom-4 opacity-10 ${color} transform group-hover:scale-110 group-hover:-rotate-12 transition-all duration-500`}>
      <Icon size={80} />
    </div>
    <div className="flex justify-between items-start">
      <span className="text-[10px] font-black text-slate-400 tracking-wider uppercase">{label}</span>
      <div className={`p-2.5 ${bgAccent} ${color} rounded-xl`}>
        <Icon size={18} />
      </div>
    </div>
    <div className="mt-4">
      <h3 className="text-xl sm:text-2xl font-black text-[#212c46] font-mono leading-none">{value}</h3>
      <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-tight">{subtitle}</p>
    </div>
  </div>
);

export default function Pr() {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  
  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('HR ANNOUNCEMENT');
  const [formDate, setFormDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [formPreview, setFormPreview] = useState('');
  const [formFullText, setFormFullText] = useState('');
  const [formAuthor, setFormAuthor] = useState('PEOPLE TEAM');
  const [formImage, setFormImage] = useState('');
  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => {
    loadNewsData();
  }, []);

  const loadNewsData = async () => {
    setLoading(true);
    try {
      const res = await dbSync.read('CorporateNews');
      if (res && res.status === 'success' && res.data && Array.isArray(res.data.items) && res.data.items.length > 0) {
        setNews(res.data.items);
      } else {
        setNews(INITIAL_NEWS);
        await dbSync.write('CorporateNews', INITIAL_NEWS);
      }
    } catch (err) {
      console.error('Failed to load news:', err);
      // Fallback
      setNews(INITIAL_NEWS);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditId(null);
    setFormTitle('');
    setFormCategory('HR ANNOUNCEMENT');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormPreview('');
    setFormFullText('');
    setFormAuthor('PEOPLE TEAM');
    setFormImage('https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=800');
    setIsFormOpen(true);
  };

  const openEditModal = (item: any) => {
    setEditId(item.id);
    setFormTitle(item.title || '');
    setFormCategory(item.category || 'HR ANNOUNCEMENT');
    setFormDate(item.date || '');
    setFormPreview(item.preview || '');
    setFormFullText(item.fullText || '');
    setFormAuthor(item.author || 'PEOPLE TEAM');
    setFormImage(item.image || '');
    setIsFormOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formPreview.trim() || !formFullText.trim()) {
      Swal.fire('ข้อผิดพลาด', 'กรุณากรอกข้อมูลในหัวข้อ สรุปย่อ และเนื้อหาฉบับเต็ม', 'error');
      return;
    }

    const payload = {
      id: editId || `NEWS-${Date.now()}`,
      title: formTitle,
      category: formCategory,
      date: formDate,
      preview: formPreview,
      fullText: formFullText,
      author: formAuthor,
      image: formImage || 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=800'
    };

    let updatedNewsList = [...news];
    if (editId) {
      updatedNewsList = updatedNewsList.map(n => n.id === editId ? payload : n);
    } else {
      updatedNewsList.unshift(payload);
    }

    setNews(updatedNewsList);
    setIsFormOpen(false);

    try {
      await dbSync.write('CorporateNews', updatedNewsList);
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'บันทึกข่าวสารประชาสัมพันธ์เรียบร้อยแล้ว',
        showConfirmButton: false,
        timer: 2000
      });
    } catch (err) {
      console.error('Failed to sync CorporateNews write:', err);
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'ลบข่าวประชาสัมพันธ์?',
      text: 'คุณแน่ใจหรือไม่ที่จะลบรายการข่าวชิ้นนี้ออกจากระบบสารสนเทศ',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#b22026',
      cancelButtonColor: '#7a8b95',
      confirmButtonText: 'ใช่, ต้องการลบ',
      cancelButtonText: 'ยกเลิก'
    });

    if (result.isConfirmed) {
      const updatedNewsList = news.filter(n => n.id !== id);
      setNews(updatedNewsList);
      try {
        await dbSync.write('CorporateNews', updatedNewsList);
        Swal.fire('ลบเรียบร้อย', 'ข้อมูลข่าวอาสารถูกลบออกจากระบบสารสนเทศแล้ว', 'success');
      } catch (err) {
        console.error('Failed to sync delete:', err);
      }
    }
  };

  const openDetail = (item: any) => {
    setSelectedItem(item);
    setIsDetailOpen(true);
  };

  const filteredNews = news.filter(item => {
    const matchesSearch = 
      (item.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.preview || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.author || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.category || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Calculate statistics for KPIs
  const totalCount = news.length;
  const categoriesCount = new Set(news.map(n => n.category)).size;
  const countAnnouncements = news.filter(n => n.category === 'HR ANNOUNCEMENT').length;
  const countEvents = news.filter(n => n.category === 'EVENT').length;

  return (
    <div className="pt-6 pb-12 flex flex-col gap-6 animate-fadeIn px-4 sm:px-8 w-full max-w-7xl mx-auto text-[#2f2926]">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center pb-4 border-b border-slate-100">
        <div className="text-left">
          <h1 className="text-2xl font-black text-[#212c46] tracking-tight uppercase flex items-center gap-3">
            <Icons.Megaphone size={28} className="text-[#b22026] shrink-0 animate-pulse" />
            <span>INTERNAL PR & NEWS / ประชาสัมพันธ์ภายใน</span>
          </h1>
          <p className="text-xs text-[#7a8b95] font-bold uppercase tracking-normal mt-1">
            Publish corporate announcements, HR policies, and welfare updates to staff portals.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsGuideOpen(true)}
            className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-xl hover:text-[#212c46] transition-all cursor-pointer border border-[#eaeaec]"
            title="User Guide"
          >
            <Icons.HelpCircle size={18} />
          </button>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 bg-[#212c46] hover:bg-[#3f809e] text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-md active:scale-95 cursor-pointer shrink-0"
          >
            <Icons.Plus size={14} />
            <span>สร้างข่าวประชาสัมพันธ์</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={Icons.Newspaper}
          value={totalCount}
          label="Total Publications"
          subtitle="ยอดข่าวเผยแพร่ทั้งหมด"
          bgAccent="bg-blue-50"
          color="text-[#3f809e]"
        />
        <KpiCard
          icon={Icons.FileVolume2}
          value={countAnnouncements}
          label="HR Announcements"
          subtitle="ประกาศนโยบาย & กฎระเบียบ"
          bgAccent="bg-red-50"
          color="text-[#b22026]"
        />
        <KpiCard
          icon={Icons.CalendarDays}
          value={countEvents}
          label="Events Posted"
          subtitle="ข่าวกิจกรรมนัดหมาย"
          bgAccent="bg-amber-50"
          color="text-[#b58c4f]"
        />
        <KpiCard
          icon={Icons.FolderHeart}
          value={categoriesCount}
          label="Categories"
          subtitle="กลุ่มระดับสารบรรณข่าวสาร"
          bgAccent="bg-emerald-50"
          color="text-[#508660]"
        />
      </div>

      {/* Filter and Search Section */}
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100/70 flex flex-col md:flex-row items-center gap-3 shadow-inner">
        <div className="relative w-full md:w-80">
          <Icons.Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
          <input
            type="text"
            placeholder="ค้นหาชื่อเรื่อง ผู้เขียน สรุปย่อ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#b58c4f] focus:border-[#b58c4f] transition-all"
          />
        </div>

        <div className="flex flex-wrap gap-1.5 items-center w-full md:w-auto">
          {['ALL', 'HR ANNOUNCEMENT', 'EVENT', 'WELFARE', 'NEWS'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#212c46] text-white shadow-sm'
                  : 'bg-white hover:bg-slate-100 text-[#414757] border border-slate-200'
              }`}
            >
              {cat === 'ALL' ? 'หมวดหมู่ทั้งหมด' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid Publications */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <Icons.Loader2 className="animate-spin text-[#3f809e]" size={36} />
          <p className="text-xs font-bold uppercase tracking-wider text-[#7a8b95]">กำลังโหลดข่าวสารข้อมูลจากระบบคลาวด์...</p>
        </div>
      ) : filteredNews.length === 0 ? (
        <div className="py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-center p-6">
          <Icons.Inbox size={48} className="text-slate-300 mb-3" />
          <p className="text-sm font-bold text-[#212c46] uppercase">ไม่พบข้อมูลประกาศ</p>
          <p className="text-xs text-[#7a8b95] mt-1">ลองเปลี่ยนคำค้นหาหรือตัวกรองหมวดหมู่ของคุณ หรือกดสร้างข่าวสารที่มุมขวาบน</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNews.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden group">
              <div className="h-44 overflow-hidden relative bg-slate-100 shrink-0">
                <img
                  src={item.image || 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=800'}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <span className={`absolute left-3 top-3 px-2.5 py-1 text-[9px] font-black tracking-widest text-white rounded-md shadow-sm uppercase ${
                  item.category === 'HR ANNOUNCEMENT' ? 'bg-[#b22026]' : 
                  item.category === 'EVENT' ? 'bg-[#b58c4f]' : 
                  item.category === 'WELFARE' ? 'bg-[#508660]' : 'bg-[#3f809e]'
                }`}>
                  {item.category}
                </span>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between text-left">
                <div>
                  <div className="flex justify-between items-center text-[10px] font-sans font-bold text-[#7a8b95] mb-2 uppercase tracking-wide">
                    <span>{item.date}</span>
                    <span className="flex items-center gap-1"><Icons.User size={10} /> {item.author}</span>
                  </div>
                  <h3 className="text-sm font-black text-[#212c46] line-clamp-2 leading-none mb-2 hover:text-[#3f809e] transition-colors cursor-pointer" onClick={() => openDetail(item)}>
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed mb-4">
                    {item.preview}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-slate-50 pt-4 mt-auto">
                  <button
                    onClick={() => openDetail(item)}
                    className="flex items-center gap-1 text-[11px] font-black text-[#3f809e] hover:text-[#212c46] uppercase tracking-wider cursor-pointer"
                  >
                    <span>อ่านฉบับเต็ม</span>
                    <Icons.ArrowUpRight size={14} />
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(item)}
                      className="p-1 px-2.5 bg-slate-50 hover:bg-slate-100 rounded text-[10px] text-slate-500 hover:text-[#212c46] font-bold uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <Icons.Edit3 size={12} />
                      แกไข
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1 px-2 text-rose-50 hover:bg-rose-100 rounded text-[10px] text-rose-600 font-bold uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <Icons.Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Draggable Form Modal */}
      <DraggableModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editId ? '🛠️ แก้ไขข้อมูลประชาสัมพันธ์' : '📢 สร้างข่าวประชาสัมพันธ์ใหม่'}
      >
        <form onSubmit={handleSave} className="space-y-4 text-left">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">หัวข้อข่าวสาร / Title</label>
              <input
                type="text"
                required
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="ประกาศหยุดสแกนลายนิ้วมือยามเย็น หรือ กิจกรรมสังสรรค์..."
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-[#212c46] placeholder-slate-400 focus:outline-none focus:border-[#b58c4f]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">ประเภทข่าว / Category</label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-[#212c46] focus:outline-none focus:border-[#b58c4f] cursor-pointer"
              >
                <option value="HR ANNOUNCEMENT">HR ANNOUNCEMENT (ประกาศเอชอาร์)</option>
                <option value="EVENT">EVENT (ข่าวกิจกรรม)</option>
                <option value="WELFARE">WELFARE (สวัสดิการ)</option>
                <option value="NEWS">NEWS (ข่าวสารทั่วไป)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">วันที่โพสต์ / Publish Date</label>
              <input
                type="date"
                required
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-[#212c46] focus:outline-none focus:border-[#b58c4f]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">ผู้แต่ง / Author</label>
              <input
                type="text"
                required
                value={formAuthor}
                onChange={(e) => setFormAuthor(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-[#212c46] focus:outline-none focus:border-[#b58c4f]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">รูปปก URL / Image URL</label>
              <input
                type="text"
                value={formImage}
                onChange={(e) => setFormImage(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-[#212c46] placeholder-slate-400 focus:outline-none focus:border-[#b58c4f]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">คำอธิบายสรุปสั้น / Summary Preview</label>
            <input
              type="text"
              required
              value={formPreview}
              onChange={(e) => setFormPreview(e.target.value)}
              placeholder="สรุปย่อ 2-3 บรรทัดที่ปรากฎบนหน้าแรกและหน้ารวมการ์ด..."
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-[#212c46] placeholder-slate-400 focus:outline-none focus:border-[#b58c4f]"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">คำเขียนเนื้อความเต็ม / Full Publication Text (Markdown Supported)</label>
            <textarea
              required
              rows={6}
              value={formFullText}
              onChange={(e) => setFormFullText(e.target.value)}
              placeholder="กรอกนโยบาย ระเบียบบังคับ หรือรายละเอียดเวลาจัดงานให้พนักงานทั้งหมดอ่าน..."
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-[#212c46] font-sans placeholder-slate-400 focus:outline-none focus:border-[#b58c4f]"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-[#212c46] hover:bg-[#3f809e] text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-2"
            >
              <Icons.Save size={14} />
              <span>บันทึกประกาศ</span>
            </button>
          </div>
        </form>
      </DraggableModal>

      {/* Detailed View Modal */}
      <DraggableModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title="📖 รายละเอียดข่าวประชาสัมพันธ์องค์กร"
      >
        {selectedItem && (
          <div className="space-y-4 text-left text-slate-700">
            <div className="h-48 sm:h-60 w-full overflow-hidden rounded-xl relative bg-slate-100">
              <img
                src={selectedItem.image || 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=800'}
                alt={selectedItem.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <span className={`absolute left-3 top-3 px-2.5 py-1 text-[9px] font-black tracking-widest text-white rounded-md shadow uppercase ${
                selectedItem.category === 'HR ANNOUNCEMENT' ? 'bg-[#b22026]' : 
                selectedItem.category === 'EVENT' ? 'bg-[#b58c4f]' : 
                selectedItem.category === 'WELFARE' ? 'bg-[#508660]' : 'bg-[#3f809e]'
              }`}>
                {selectedItem.category}
              </span>
            </div>

            <div className="flex justify-between items-center border-b border-slate-100 pb-3 text-slate-400 text-xs font-bold font-sans uppercase">
              <span>Published: {selectedItem.date}</span>
              <span>Author: {selectedItem.author}</span>
            </div>

            <div>
              <h2 className="text-base sm:text-lg font-black text-[#212c46] leading-snug mb-3">
                {selectedItem.title}
              </h2>
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl mb-4 text-xs font-bold text-slate-500 leading-relaxed italic">
                {selectedItem.preview}
              </div>
              <p className="text-xs leading-relaxed text-slate-600 whitespace-pre-line font-sans">
                {selectedItem.fullText}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setIsDetailOpen(false)}
                className="px-6 py-2.5 bg-[#212c46] hover:bg-[#3f809e] text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md"
              >
                닫기 / Close Close
              </button>
            </div>
          </div>
        )}
      </DraggableModal>

      {/* FLOAT GUIDE PANEL */}
      <UserGuideButton onClick={() => setIsGuideOpen(true)} />
      <UserGuidePanel isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
    </div>
  );
}
