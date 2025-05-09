import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { supabase } from '../lib/supabase';
import { LogOut, Users, FileText, CheckSquare, XSquare, Plus, Trash2 } from 'lucide-react';
import GlassEffect from '@/components/ui/glass-effect';
import { Button } from '@/components/ui/button';
import { Contact, NewsItem } from '../lib/supabase';

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
      setContacts(data || []);
    } catch (error) {
      console.error('문의 목록 조회 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessToggle = async (id: number, currentStatus: boolean) => {
    try {
      if (!supabase) return;
      
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
                            contact.processed 
                              ? 'bg-primary/20 text-primary' 
                              : 'bg-secondary/20 text-secondary'
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
                  onClick={() => handleProcessToggle(selectedContact.id, selectedContact.processed)}
                  className={`flex items-center gap-2 ${
                    selectedContact.processed 
                      ? 'bg-secondary hover:bg-secondary/80' 
                      : 'bg-primary hover:bg-primary/80'
                  }`}
                  size="sm"
                >
                  {selectedContact.processed ? (
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

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      if (!supabase) {
        throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');
      }
      
      setLoading(true);
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('published_at', { ascending: false });

      if (error) throw error;
      setNewsList(data || []);
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
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const updatedValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData({ ...formData, [name]: updatedValue });
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
    setEditMode(true);
  };

  const handleCreateClick = () => {
    resetForm();
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
      if (formData.id) {
        // 수정
        const { error } = await supabase
          .from('news')
          .update({
            title: formData.title,
            category: formData.category,
            tag: formData.tag,
            tag_color: formData.tag_color,
            description: formData.description,
            image: formData.image,
            active: formData.active,
          })
          .eq('id', formData.id);

        if (error) throw error;
      } else {
        // 생성
        const { error } = await supabase
          .from('news')
          .insert([{
            title: formData.title,
            category: formData.category,
            tag: formData.tag,
            tag_color: formData.tag_color,
            description: formData.description,
            image: formData.image,
            active: formData.active,
            published_at: new Date().toISOString(),
          }]);

        if (error) throw error;
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
          <Button onClick={() => setLocation('/admin/news')} variant="outline" className="flex items-center gap-2">
            <FileText size={16} />
            새 뉴스 관리 페이지로 이동
          </Button>
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
        <GlassEffect className="p-6 rounded-xl">
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
                <label className="block text-sm font-medium text-gray-300 mb-1">이미지 URL</label>
                <input
                  type="url"
                  name="image"
                  value={formData.image || ''}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-700 bg-white px-3 py-2 text-black shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
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
              <textarea
                name="description"
                value={formData.description || ''}
                onChange={handleInputChange}
                rows={6}
                className="w-full rounded-md border border-gray-700 bg-white px-3 py-2 text-black shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
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
                        <td className="px-2 py-3 text-right space-x-2">
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