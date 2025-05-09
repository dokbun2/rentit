import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { supabase } from '../lib/supabaseClient';
import ImageUploader from '../components/ImageUploader';

export default function AdminDashboard() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'contacts' | 'news'>('contacts');
  const [, setLocation] = useLocation();

  useEffect(() => {
    const checkSession = async () => {
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
  }, [setLocation]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setLocation('/admin/login');
  };

  // 로딩 중
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg">로딩 중...</p>
      </div>
    );
  }

  // 세션이 없으면 로딩 화면을 보여줌 (useEffect에서 리디렉션 처리함)
  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg">로그인이 필요합니다. 리디렉션 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-primary-dark text-white">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <h1 className="text-xl font-bold">렌트잇 관리자 대시보드</h1>
          <div className="flex items-center space-x-4">
            <span>{session.user.email}</span>
            <button
              onClick={handleLogout}
              className="rounded bg-white/20 px-3 py-1 text-sm hover:bg-white/30"
            >
              로그아웃
            </button>
          </div>
        </div>
      </header>

      {/* 탭 메뉴 */}
      <div className="border-b bg-white">
        <div className="container mx-auto px-4">
          <div className="flex space-x-4">
            <button
              className={`border-b-2 px-4 py-3 ${
                activeTab === 'contacts'
                  ? 'border-primary-dark text-primary-dark'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('contacts')}
            >
              문의 관리
            </button>
            <button
              className={`border-b-2 px-4 py-3 ${
                activeTab === 'news'
                  ? 'border-primary-dark text-primary-dark'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('news')}
            >
              뉴스 관리
            </button>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <main className="container mx-auto p-4">
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
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState<any>(null);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
      console.error('문의 목록 조회 오류:', error);
      alert('문의 목록을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleProcessToggle = async (id: number, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('contacts')
        .update({ processed: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      
      // 목록 업데이트
      setContacts(
        contacts.map(contact => 
          contact.id === id ? { ...contact, processed: !currentStatus } : contact
        )
      );
      
      // 선택된 연락처가 있고, 해당 ID와 일치하면 업데이트
      if (selectedContact && selectedContact.id === id) {
        setSelectedContact({ ...selectedContact, processed: !currentStatus });
      }
    } catch (error) {
      console.error('처리 상태 업데이트 오류:', error);
      alert('상태 업데이트 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="flex flex-col space-y-6 md:flex-row md:space-x-6 md:space-y-0">
      {/* 문의 목록 */}
      <div className="w-full md:w-1/2">
        <div className="rounded-lg bg-white p-4 shadow-md">
          <h2 className="mb-4 text-xl font-bold">문의 목록</h2>
          
          {loading ? (
            <p className="py-4 text-center text-gray-500">로딩 중...</p>
          ) : contacts.length === 0 ? (
            <p className="py-4 text-center text-gray-500">문의 내역이 없습니다.</p>
          ) : (
            <div className="max-h-[600px] overflow-y-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr>
                    <th className="px-2 py-2 text-left">이름</th>
                    <th className="px-2 py-2 text-left">서비스</th>
                    <th className="px-2 py-2 text-left">날짜</th>
                    <th className="px-2 py-2 text-left">상태</th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.map((contact) => (
                    <tr 
                      key={contact.id} 
                      className={`cursor-pointer border-b hover:bg-gray-50 ${
                        selectedContact?.id === contact.id ? 'bg-gray-100' : ''
                      }`}
                      onClick={() => setSelectedContact(contact)}
                    >
                      <td className="px-2 py-3">{contact.name}</td>
                      <td className="px-2 py-3">{contact.service}</td>
                      <td className="px-2 py-3">
                        {new Date(contact.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-2 py-3">
                        <span
                          className={`rounded-full px-2 py-1 text-xs ${
                            contact.processed 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {contact.processed ? '처리완료' : '대기중'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      {/* 문의 상세 정보 */}
      <div className="w-full md:w-1/2">
        <div className="rounded-lg bg-white p-4 shadow-md">
          <h2 className="mb-4 text-xl font-bold">상세 정보</h2>
          
          {selectedContact ? (
            <div className="space-y-4">
              <div className="flex justify-between">
                <div className="space-y-1">
                  <h3 className="text-lg font-medium">{selectedContact.name}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(selectedContact.created_at).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => handleProcessToggle(selectedContact.id, selectedContact.processed)}
                  className={`rounded px-3 py-1 text-white ${
                    selectedContact.processed 
                      ? 'bg-yellow-500 hover:bg-yellow-600' 
                      : 'bg-green-500 hover:bg-green-600'
                  }`}
                >
                  {selectedContact.processed ? '미처리로 변경' : '처리 완료로 변경'}
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-4 rounded-lg bg-gray-50 p-4">
                <div>
                  <p className="text-xs text-gray-500">이메일</p>
                  <p>{selectedContact.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">전화번호</p>
                  <p>{selectedContact.phone}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">서비스</p>
                  <p>{selectedContact.service}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">상태</p>
                  <p>{selectedContact.processed ? '처리완료' : '대기중'}</p>
                </div>
              </div>
              
              <div>
                <p className="mb-2 text-sm text-gray-500">문의 내용</p>
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="whitespace-pre-wrap">{selectedContact.message}</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="py-8 text-center text-gray-500">
              왼쪽 목록에서 문의를 선택하세요.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// 뉴스 관리 컴포넌트
function NewsManager() {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNews, setSelectedNews] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    tag: '',
    tag_color: 'bg-primary-dark/30',
    description: '',
    image: '',
    active: true
  });

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('published_at', { ascending: false });

      if (error) throw error;
      setNews(data || []);
    } catch (error) {
      console.error('뉴스 목록 조회 오류:', error);
      alert('뉴스 목록을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      category: '',
      tag: '',
      tag_color: 'bg-primary-dark/30',
      description: '',
      image: '',
      active: true
    });
    setSelectedNews(null);
    setIsEditing(false);
  };

  const handleEditClick = (news: any) => {
    setSelectedNews(news);
    setFormData({
      title: news.title,
      category: news.category,
      tag: news.tag,
      tag_color: news.tag_color,
      description: news.description,
      image: news.image,
      active: news.active
    });
    setIsEditing(true);
  };

  const handleCreateClick = () => {
    resetForm();
    setIsEditing(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (selectedNews) {
        // 수정
        const { error } = await supabase
          .from('news')
          .update({
            ...formData,
            published_at: new Date().toISOString()
          })
          .eq('id', selectedNews.id);
          
        if (error) throw error;
        alert('뉴스가 성공적으로 수정되었습니다.');
      } else {
        // 생성
        const { error } = await supabase
          .from('news')
          .insert([{
            ...formData,
            published_at: new Date().toISOString()
          }]);
          
        if (error) throw error;
        alert('뉴스가 성공적으로 생성되었습니다.');
      }
      
      // 데이터 새로고침
      await fetchNews();
      resetForm();
    } catch (error) {
      console.error('뉴스 저장 오류:', error);
      alert('뉴스를 저장하는 중 오류가 발생했습니다.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('정말로 이 뉴스를 삭제하시겠습니까?')) return;
    
    try {
      const { error } = await supabase
        .from('news')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      // 목록에서 제거
      setNews(news.filter(item => item.id !== id));
      
      // 만약 삭제한 항목이 현재 선택된 항목이라면 선택 해제
      if (selectedNews && selectedNews.id === id) {
        resetForm();
      }
      
      alert('뉴스가 삭제되었습니다.');
    } catch (error) {
      console.error('뉴스 삭제 오류:', error);
      alert('뉴스를 삭제하는 중 오류가 발생했습니다.');
    }
  };

  const handleToggleActive = async (id: number, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('news')
        .update({ active: !currentStatus })
        .eq('id', id);
        
      if (error) throw error;
      
      // 목록 업데이트
      setNews(
        news.map(item => 
          item.id === id ? { ...item, active: !currentStatus } : item
        )
      );
      
      // 선택된 뉴스가 있고, 해당 ID와 일치하면 업데이트
      if (selectedNews && selectedNews.id === id) {
        setSelectedNews({ ...selectedNews, active: !currentStatus });
        setFormData({ ...formData, active: !currentStatus });
      }
    } catch (error) {
      console.error('뉴스 상태 업데이트 오류:', error);
      alert('상태 업데이트 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="flex flex-col space-y-6 md:flex-row md:space-x-6 md:space-y-0">
      {/* 뉴스 목록 */}
      <div className="w-full md:w-1/2">
        <div className="rounded-lg bg-white p-4 shadow-md">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">뉴스 목록</h2>
            <button
              onClick={handleCreateClick}
              className="rounded bg-primary-dark px-3 py-1 text-white hover:bg-primary"
            >
              + 새 뉴스 작성
            </button>
          </div>
          
          {loading ? (
            <p className="py-4 text-center text-gray-500">로딩 중...</p>
          ) : news.length === 0 ? (
            <p className="py-4 text-center text-gray-500">등록된 뉴스가 없습니다.</p>
          ) : (
            <div className="max-h-[600px] overflow-y-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr>
                    <th className="px-2 py-2 text-left">제목</th>
                    <th className="px-2 py-2 text-left">카테고리</th>
                    <th className="px-2 py-2 text-left">날짜</th>
                    <th className="px-2 py-2 text-left">상태</th>
                    <th className="px-2 py-2 text-left">관리</th>
                  </tr>
                </thead>
                <tbody>
                  {news.map((item) => (
                    <tr 
                      key={item.id} 
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="max-w-[150px] truncate px-2 py-3">{item.title}</td>
                      <td className="px-2 py-3">{item.category}</td>
                      <td className="px-2 py-3">
                        {new Date(item.published_at).toLocaleDateString()}
                      </td>
                      <td className="px-2 py-3">
                        <span
                          className={`rounded-full px-2 py-1 text-xs ${
                            item.active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {item.active ? '활성화' : '비활성화'}
                        </span>
                      </td>
                      <td className="space-x-1 px-2 py-3">
                        <button
                          onClick={() => handleEditClick(item)}
                          className="rounded bg-blue-500 px-2 py-1 text-xs text-white hover:bg-blue-600"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => handleToggleActive(item.id, item.active)}
                          className={`rounded px-2 py-1 text-xs text-white ${
                            item.active
                              ? 'bg-yellow-500 hover:bg-yellow-600'
                              : 'bg-green-500 hover:bg-green-600'
                          }`}
                        >
                          {item.active ? '비활성화' : '활성화'}
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="rounded bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600"
                        >
                          삭제
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      {/* 뉴스 편집 폼 */}
      <div className="w-full md:w-1/2">
        <div className="rounded-lg bg-white p-4 shadow-md">
          <h2 className="mb-4 text-xl font-bold">
            {isEditing
              ? selectedNews ? '뉴스 수정' : '새 뉴스 작성'
              : '뉴스 작성'}
          </h2>
          
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="title" className="mb-1 block text-sm font-medium">
                  제목 <span className="text-red-500">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full rounded-md border border-gray-300 p-2"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="category" className="mb-1 block text-sm font-medium">
                    카테고리
                  </label>
                  <input
                    id="category"
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="예: 일반, 소식, 이벤트 등"
                    className="w-full rounded-md border border-gray-300 p-2"
                  />
                </div>
                <div>
                  <label htmlFor="tag" className="mb-1 block text-sm font-medium">
                    태그
                  </label>
                  <input
                    id="tag"
                    type="text"
                    value={formData.tag}
                    onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                    placeholder="예: 뉴스, 공지사항 등"
                    className="w-full rounded-md border border-gray-300 p-2"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="tag_color" className="mb-1 block text-sm font-medium">
                  태그 색상
                </label>
                <select
                  id="tag_color"
                  value={formData.tag_color}
                  onChange={(e) => setFormData({ ...formData, tag_color: e.target.value })}
                  className="w-full rounded-md border border-gray-300 p-2"
                >
                  <option value="bg-primary-dark/30">기본 색상</option>
                  <option value="bg-red-500/30">빨간색</option>
                  <option value="bg-blue-500/30">파란색</option>
                  <option value="bg-green-500/30">녹색</option>
                  <option value="bg-yellow-500/30">노란색</option>
                  <option value="bg-purple-500/30">보라색</option>
                  <option value="bg-gray-500/30">회색</option>
                </select>
              </div>
              
              <div>
                <label className="mb-1 block text-sm font-medium">
                  이미지 <span className="text-red-500">*</span>
                </label>
                {formData.image && (
                  <div className="mb-2">
                    <img 
                      src={formData.image} 
                      alt="뉴스 이미지 미리보기" 
                      className="mb-2 h-32 w-auto rounded border object-cover" 
                    />
                  </div>
                )}
                
                <div className="flex items-center">
                  <ImageUploader 
                    onUploadComplete={(url) => setFormData({ ...formData, image: url })} 
                  />
                  
                  <span className="mx-2 text-gray-500">또는</span>
                  
                  <input
                    id="image"
                    type="text"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="이미지 URL을 직접 입력하세요"
                    className="w-full rounded-md border border-gray-300 p-2"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  이미지를 직접 업로드하거나 이미지 URL을 입력해주세요.
                </p>
              </div>
              
              <div>
                <label htmlFor="description" className="mb-1 block text-sm font-medium">
                  내용 <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="h-32 w-full rounded-md border border-gray-300 p-2"
                  required
                ></textarea>
              </div>
              
              <div className="flex items-center">
                <input
                  id="active"
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <label htmlFor="active" className="ml-2 text-sm font-medium">
                  활성화 (체크하면 웹사이트에 표시됨)
                </label>
              </div>
              
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="rounded bg-primary-dark px-4 py-2 text-white hover:bg-primary"
                >
                  {selectedNews ? '수정하기' : '등록하기'}
                </button>
              </div>
            </form>
          ) : (
            <div className="py-8 text-center text-gray-500">
              <p className="mb-4">
                새 뉴스를 작성하거나 기존 뉴스를 수정하려면<br />
                왼쪽 목록에서 '새 뉴스 작성' 버튼이나 뉴스의 '수정' 버튼을 클릭하세요.
              </p>
              <button
                onClick={handleCreateClick}
                className="rounded bg-primary-dark px-4 py-2 text-white hover:bg-primary"
              >
                새 뉴스 작성하기
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 