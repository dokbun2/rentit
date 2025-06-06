import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { supabase } from '../lib/supabase';
import { LogOut, Users, FileText, CheckSquare, XSquare, Plus, Trash2, Upload, Loader2 } from 'lucide-react';
import GlassEffect from '../components/ui/glass-effect';
import { Button } from '../components/ui/button';
import { Contact, NewsItem } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export default function AdminDashboard() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'contacts' | 'news'>('contacts');
  const [, setLocation] = useLocation();

  useEffect(() => {
    document.documentElement.classList.add('dark');
    
    const checkSession = async () => {
      if (!supabase) {
        setLocation('/admin/login');
        return;
      }
      
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setLoading(false);
      
      // 세션이 없으면 로그인 페이지로 리디렉션
      if (!data.session) {
        setLocation('/admin/login');
      }
      
      // 세션 변경 감지
      supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        if (!session) {
          setLocation('/admin/login');
        }
      });
    };
    
    checkSession();
    
    return () => {
      document.documentElement.classList.remove('dark');
    };
  }, [setLocation]);

  const handleLogout = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setLocation('/admin/login');
  };

  // 로딩 중
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-white">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status"></div>
          <p className="mt-4 text-lg">로딩 중...</p>
        </div>
      </div>
    );
  }

  // 세션이 없으면 로딩 화면을 보여줌 (useEffect에서 리디렉션 처리함)
  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-white">
        <p className="text-lg">로그인이 필요합니다. 리디렉션 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-white">
      {/* 헤더 */}
      <header className="glass-effect border-b border-white/10 backdrop-blur-lg fixed top-0 w-full z-50">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <h1 className="text-xl font-bold">
            <span className="text-primary">렌잇</span> 관리자 대시보드
          </h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-300">{session.user.email}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="flex items-center gap-2 text-white hover:text-primary"
            >
              <LogOut size={16} />
              로그아웃
            </Button>
          </div>
        </div>
      </header>

      {/* 탭 메뉴 */}
      <div className="dark-lighter border-b border-gray-800 pt-20">
        <div className="container mx-auto px-4">
          <div className="flex space-x-4">
            <button
              className={`border-b-2 px-4 py-3 flex items-center gap-2 transition-colors ${
                activeTab === 'contacts'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
              onClick={() => setActiveTab('contacts')}
            >
              <Users size={18} />
              문의 관리
            </button>
            <button
              className={`border-b-2 px-4 py-3 flex items-center gap-2 transition-colors ${
                activeTab === 'news'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
              onClick={() => setActiveTab('news')}
            >
              <FileText size={18} />
              뉴스 관리
            </button>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <main className="container mx-auto p-4 pt-6">
        {activeTab === 'contacts' ? (
          <ContactsManager />
        ) : (
          <NewsManager />
        )}
      </main>
    </div>
  );
}

// 문의 관리 컴포넌트
function ContactsManager() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      if (!supabase) {
        throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');
      }
      
      setLoading(true);
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      console.log('불러온 연락처 데이터:', data);
      
      // 필드 이름 마이그레이션을 위한 데이터 매핑
      const mappedData = data?.map(item => ({
        ...item,
        // 기존 데이터에 processed 필드가 있으면 is_processed로 변환
        is_processed: item.processed !== undefined ? item.processed : item.is_processed
      })) || [];
      
      setContacts(mappedData);
    } catch (error) {
      console.error('문의 목록 조회 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessToggle = async (id: number, currentStatus: boolean) => {
    try {
      if (!supabase) return;
      
      console.log('처리 상태 변경 시도:', id, '현재 상태:', currentStatus, '→', !currentStatus);
      
      // 필드 이름과 쿼리 확인
      const { error, data } = await supabase
        .from('contacts')
        .update({ is_processed: !currentStatus })
        .eq('id', id)
        .select();
      
      console.log('업데이트 결과:', { 에러: error, 데이터: data });

      if (error) {
        console.error('처리 상태 업데이트 오류:', error);
        throw error;
      }
      
      // 목록 업데이트
      setContacts(
        contacts.map(contact => 
          contact.id === id ? { ...contact, is_processed: !currentStatus } : contact
        )
      );
      
      // 선택된 연락처가 있고, 해당 ID와 일치하면 업데이트
      if (selectedContact && selectedContact.id === id) {
        setSelectedContact({ ...selectedContact, is_processed: !currentStatus });
      }
      
      // 성공 메시지
      console.log('처리 상태 업데이트 성공!');
      
    } catch (error) {
      console.error('처리 상태 업데이트 오류:', error);
      alert('처리 상태 변경에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col space-y-6 md:flex-row md:space-x-6 md:space-y-0">
      {/* 문의 목록 */}
      <div className="w-full md:w-1/2">
        <GlassEffect className="p-4 rounded-xl">
          <h2 className="mb-4 text-xl font-bold">문의 목록</h2>
          
          {loading ? (
            <div className="flex justify-center py-6">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
            </div>
          ) : contacts.length === 0 ? (
            <p className="py-8 text-center text-gray-400">문의 내역이 없습니다.</p>
          ) : (
            <div className="max-h-[600px] overflow-y-auto pr-2">
              <table className="w-full">
                <thead className="border-b border-gray-800">
                  <tr>
                    <th className="px-2 py-3 text-left text-gray-300">이름</th>
                    <th className="px-2 py-3 text-left text-gray-300">서비스</th>
                    <th className="px-2 py-3 text-left text-gray-300">날짜</th>
                    <th className="px-2 py-3 text-left text-gray-300">상태</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {contacts.map((contact) => (
                    <tr 
                      key={contact.id} 
                      className={`cursor-pointer transition-colors ${
                        selectedContact?.id === contact.id ? 'bg-primary/10' : 'hover:bg-white/5'
                      }`}
                      onClick={() => setSelectedContact(contact)}
                    >
                      <td className="px-2 py-3">{contact.name}</td>
                      <td className="px-2 py-3">{contact.service}</td>
                      <td className="px-2 py-3">
                        {formatDate(contact.created_at)}
                      </td>
                      <td className="px-2 py-3">
                        <span
                          className={`rounded-full px-2 py-1 text-xs ${
                            contact.is_processed 
                              ? 'bg-primary/20 text-primary' 
                              : 'bg-secondary/20 text-secondary'
                          }`}
                        >
                          {contact.is_processed ? '처리완료' : '대기중'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </GlassEffect>
      </div>
      
      {/* 문의 상세 정보 */}
      <div className="w-full md:w-1/2">
        <GlassEffect className="p-4 rounded-xl">
          <h2 className="mb-4 text-xl font-bold">상세 정보</h2>
          
          {selectedContact ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium">{selectedContact.name}</h3>
                  <p className="text-sm text-gray-400">
                    {new Date(selectedContact.created_at).toLocaleString()}
                  </p>
                </div>
                <Button
                  onClick={() => handleProcessToggle(selectedContact.id, selectedContact.is_processed)}
                  className={`flex items-center gap-2 ${
                    selectedContact.is_processed 
                      ? 'bg-secondary hover:bg-secondary/80' 
                      : 'bg-primary hover:bg-primary/80'
                  }`}
                  size="sm"
                >
                  {selectedContact.is_processed ? (
                    <>
                      <XSquare size={16} />
                      <span>미처리로 변경</span>
                    </>
                  ) : (
                    <>
                      <CheckSquare size={16} />
                      <span>처리 완료로 변경</span>
                    </>
                  )}
                </Button>
              </div>
              
              <div className="space-y-3 mt-4">
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-1 text-gray-400">이메일</div>
                  <div className="col-span-2">{selectedContact.email}</div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-1 text-gray-400">전화번호</div>
                  <div className="col-span-2">{selectedContact.phone}</div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-1 text-gray-400">서비스</div>
                  <div className="col-span-2">{selectedContact.service}</div>
                </div>
              </div>
              
              <div className="mt-4">
                <p className="text-gray-400 mb-1">메시지</p>
                <div className="bg-dark-lighter rounded-lg p-3 text-gray-300">
                  {selectedContact.message || '내용 없음'}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64">
              <p className="text-gray-400 mb-2">좌측에서 문의를 선택하세요</p>
            </div>
          )}
        </GlassEffect>
      </div>
    </div>
  );
}

// 뉴스 관리 컴포넌트
function NewsManager() {
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState<Partial<NewsItem>>({
    title: '',
    category: '',
    tag: '',
    tag_color: 'bg-primary/30',
    description: '',
    image: '',
    active: true,
  });
  const [htmlPreview, setHtmlPreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      if (!supabase) {
        throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');
      }
      
      console.log('Supabase URL 확인:', import.meta.env.VITE_SUPABASE_URL);
      console.log('Supabase 클라이언트 확인:', !!supabase);
      
      setLoading(true);
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('뉴스 조회 오류 상세:', error);
        throw error;
      }
      
      console.log('로드된 원본 뉴스 데이터:', data);
      
      // 필드 이름 매핑
      const mappedData = data?.map(item => ({
        id: item.id,
        title: item.title,
        category: item.category,
        tag: item.tag,
        tag_color: item.tag_color,
        description: item.content,      // content -> description 매핑
        image: item.image_url,         // image_url -> image 매핑
        published_at: item.created_at, // created_at -> published_at 매핑
        active: item.active,
      })) || [];
      
      console.log('매핑된 뉴스 데이터:', mappedData);
      setNewsList(mappedData);
    } catch (error) {
      console.error('뉴스 데이터 로딩 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      category: '',
      tag: '',
      tag_color: 'bg-primary/30',
      description: '',
      image: '',
      active: true,
    });
    setEditMode(false);
    setHtmlPreview('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const updatedValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData({ ...formData, [name]: updatedValue });
    
    if (name === 'description') {
      setHtmlPreview(value);
    }
  };

  // 이미지 업로드 함수 추가
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // 이미지 파일 타입 및 크기 검사
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드할 수 있습니다.');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      alert('파일 크기는 5MB 이하여야 합니다.');
      return;
    }
    
    console.log('업로드 시작:', { 파일명: file.name, 크기: file.size, 타입: file.type });
    
    setUploading(true);
    setUploadProgress(10); // 시작 진행률
    
    try {
      // 진행률 표시 시뮬레이션
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 5, 90));
      }, 200);
      
      // 이미지 데이터를 base64로 변환하여 직접 폼에 설정
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (event.target && event.target.result) {
          // base64 데이터 URL로 이미지 설정
          const imageDataUrl = event.target.result.toString();
          
          // 폼 데이터 업데이트
          setFormData({
            ...formData,
            image: imageDataUrl
          });
          
          console.log('이미지 데이터 URL 생성 완료');
          
          // 진행률 업데이트
          clearInterval(progressInterval);
          setUploadProgress(100);
          
          // 업로드 상태 완료로 설정
          setTimeout(() => {
            setUploading(false);
          }, 500);
        }
      };
      
      // 파일 읽기 시작
      reader.readAsDataURL(file);
      
    } catch (error) {
      console.error('이미지 업로드 오류:', error);
      alert('이미지 업로드에 실패했습니다. 다시 시도해주세요.');
      setUploading(false);
    }
  };

  const handleEditClick = (news: NewsItem) => {
    setFormData({
      id: news.id,
      title: news.title,
      category: news.category,
      tag: news.tag,
      tag_color: news.tag_color,
      description: news.description,
      image: news.image,
      active: news.active,
    });
    setHtmlPreview(news.description || '');
    setEditMode(true);
  };

  const handleCreateClick = () => {
    resetForm();
    setHtmlPreview('');
    setEditMode(true);
  };

  const handleCancelClick = () => {
    resetForm();
    setEditMode(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!supabase) return;

    try {
      console.log('Supabase URL 확인:', import.meta.env.VITE_SUPABASE_URL);
      console.log('Supabase 클라이언트 확인:', !!supabase);
      console.log('전송할 데이터:', formData);
      
      // NewsItem 인터페이스와 실제 테이블 필드 이름 간의 매핑
      const newsData = {
        title: formData.title,
        category: formData.category,
        tag: formData.tag,
        tag_color: formData.tag_color,
        content: formData.description, // description -> content 매핑
        image_url: formData.image,    // image -> image_url 매핑
        active: formData.active,
      };
      
      if (formData.id) {
        // 수정
        const { error } = await supabase
          .from('news')
          .update(newsData)
          .eq('id', formData.id);

        if (error) {
          console.error('뉴스 수정 오류 상세:', error);
          throw error;
        }
      } else {
        // 생성
        const { error } = await supabase
          .from('news')
          .insert([{
            ...newsData,
            created_at: new Date().toISOString(), // published_at -> created_at 매핑
          }]);

        if (error) {
          console.error('뉴스 생성 오류 상세:', error);
          throw error;
        }
      }

      // 성공 후 초기화 및 새로고침
      resetForm();
      await fetchNews();
    } catch (error) {
      console.error('뉴스 저장 오류:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    
    if (!supabase) return;

    try {
      const { error } = await supabase
        .from('news')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // 목록에서 제거
      setNewsList(newsList.filter(item => item.id !== id));
      
      // 수정 중이었다면 폼 초기화
      if (formData.id === id) {
        resetForm();
      }
    } catch (error) {
      console.error('뉴스 삭제 오류:', error);
    }
  };

  const handleToggleActive = async (id: number, currentStatus: boolean) => {
    if (!supabase) return;
    
    try {
      const { error } = await supabase
        .from('news')
        .update({ active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      
      // 목록 업데이트
      setNewsList(
        newsList.map(news => 
          news.id === id ? { ...news, active: !currentStatus } : news
        )
      );
      
      // 수정 중이었다면 폼도 업데이트
      if (formData.id === id) {
        setFormData({ ...formData, active: !currentStatus });
      }
    } catch (error) {
      console.error('뉴스 상태 업데이트 오류:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">뉴스 관리</h2>
        <div className="flex space-x-3">
          {!editMode && (
            <Button onClick={handleCreateClick} className="flex items-center gap-2">
              <Plus size={16} />
              새 뉴스 작성
            </Button>
          ) || (
            <Button onClick={handleCancelClick} variant="ghost" className="text-gray-400">
              취소
            </Button>
          )}
        </div>
      </div>
      
      {editMode ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 왼쪽 컨테이너 - 뉴스 정보 및 내용 입력 */}
          <GlassEffect className="p-6 rounded-xl h-full">
            <h2 className="mb-4 text-xl font-bold">{formData.id ? '뉴스 수정' : '새 뉴스 작성'}</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">제목</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title || ''}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-700 bg-white px-3 py-2 text-black shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                  />
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-sm font-medium text-gray-300">이미지</label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('image-upload')?.click()}
                      className="flex items-center gap-2 h-8 px-3"
                      disabled={uploading}
                    >
                      {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                      {uploading ? `업로드 중 (${uploadProgress}%)` : '이미지 업로드'}
                    </Button>
                    <input
                      type="file"
                      id="image-upload"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                  </div>
                  <input
                    type="text"
                    name="image"
                    value={formData.image || ''}
                    onChange={handleInputChange}
                    placeholder="이미지가 업로드되면 자동으로 채워집니다."
                    className="w-full rounded-md border border-gray-700 bg-white px-3 py-2 text-black shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    readOnly
                  />
                  {formData.image && (
                    <div className="mt-2 relative w-full h-24 border border-gray-700 rounded-md overflow-hidden">
                      <img 
                        src={formData.image} 
                        alt="미리보기" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">카테고리</label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category || ''}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-700 bg-white px-3 py-2 text-black shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">태그</label>
                  <input
                    type="text"
                    name="tag"
                    value={formData.tag || ''}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-700 bg-white px-3 py-2 text-black shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">태그 색상</label>
                  <select
                    name="tag_color"
                    value={formData.tag_color || 'bg-primary/30'}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-700 bg-white px-3 py-2 text-black shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="bg-primary/30">보라색</option>
                    <option value="bg-secondary/30">초록색</option>
                    <option value="bg-amber-700/30">주황색</option>
                  </select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="active"
                    name="active"
                    checked={!!formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-700 bg-dark-lighter text-primary"
                  />
                  <label htmlFor="active" className="text-sm font-medium text-gray-300">활성화</label>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">내용</label>
                <p className="text-xs text-gray-400 mb-2">HTML 태그를 사용하여 서식을 적용할 수 있습니다. (예: &lt;b&gt;굵게&lt;/b&gt;, &lt;i&gt;기울임&lt;/i&gt;, &lt;a href="..."&gt;링크&lt;/a&gt;)</p>
                <textarea
                  name="description"
                  value={formData.description || ''}
                  onChange={handleInputChange}
                  rows={16}
                  style={{ minHeight: '500px' }}
                  className="w-full rounded-md border border-gray-700 bg-white px-3 py-2 text-black shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary font-mono text-sm"
                  required
                ></textarea>
              </div>
              
              <div className="flex justify-end space-x-3 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancelClick}
                >
                  취소
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-primary to-purple-500"
                >
                  저장
                </Button>
              </div>
            </form>
          </GlassEffect>
          
          {/* 오른쪽 컨테이너 - HTML 미리보기 */}
          <GlassEffect className="p-6 rounded-xl h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">HTML 미리보기</h2>
              <span className="text-xs text-gray-400">입력한 내용의 실제 표시 모습</span>
            </div>
            
            <div className="flex-grow rounded-md border border-gray-700 bg-white p-6 text-black shadow-sm overflow-y-auto" style={{ minHeight: '700px' }}>
              <div className="prose max-w-none">
                <div dangerouslySetInnerHTML={{ __html: htmlPreview }} />
              </div>
            </div>
          </GlassEffect>
        </div>
      ) : (
        <div className="flex flex-col space-y-4">
          <GlassEffect className="p-4 rounded-xl">
            {loading ? (
              <div className="flex justify-center py-6">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
              </div>
            ) : newsList.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-gray-400 mb-4">등록된 뉴스가 없습니다.</p>
                <Button
                  onClick={handleCreateClick}
                  className="bg-gradient-to-r from-primary to-purple-500"
                >
                  첫 번째 뉴스 작성하기
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-gray-800">
                    <tr>
                      <th className="px-2 py-3 text-left text-gray-300">제목</th>
                      <th className="px-2 py-3 text-left text-gray-300">카테고리</th>
                      <th className="px-2 py-3 text-left text-gray-300">발행일</th>
                      <th className="px-2 py-3 text-left text-gray-300">상태</th>
                      <th className="px-2 py-3 text-right text-gray-300">관리</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {newsList.map((news) => (
                      <tr key={news.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-2 py-3">
                          <div className="font-medium">{news.title}</div>
                        </td>
                        <td className="px-2 py-3">
                          <div>{news.category}</div>
                          {news.tag && (
                            <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${news.tag_color}`}>
                              {news.tag}
                            </span>
                          )}
                        </td>
                        <td className="px-2 py-3">{formatDate(news.published_at)}</td>
                        <td className="px-2 py-3">
                          <span className={`rounded-full px-2 py-1 text-xs ${news.active ? 'bg-primary/20 text-primary' : 'bg-gray-700 text-gray-300'}`}>
                            {news.active ? '활성' : '비활성'}
                          </span>
                        </td>
                        <td className="px-2 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              onClick={() => handleToggleActive(news.id, news.active)}
                              variant="ghost"
                              size="sm"
                              className="text-gray-300 hover:text-white"
                            >
                              {news.active ? '비활성화' : '활성화'}
                            </Button>
                            <Button
                              onClick={() => handleEditClick(news)}
                              variant="outline"
                              size="sm"
                              className="text-primary hover:text-primary-foreground"
                            >
                              수정
                            </Button>
                            <Button
                              onClick={() => handleDelete(news.id)}
                              variant="destructive"
                              size="sm"
                              className="flex items-center"
                            >
                              <Trash2 size={14} className="mr-1" />
                              삭제
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </GlassEffect>
        </div>
      )}
    </div>
  );
} 