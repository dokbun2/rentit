import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, ArrowLeft, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useLocation } from "wouter";
import { toast } from "@/hooks/use-toast";

// 뉴스 타입 정의 (Supabase의 스키마와 일치하도록 수정)
type News = {
  id?: number;
  title: string;
  category: string;
  tag?: string;
  tag_color?: string;
  published_at: string;
  active: boolean;
  description: string;
  image?: string;
};

// 새 뉴스 작성을 위한 기본 값
const defaultNewsItem: News = {
  title: "",
  category: "",
  tag: "",
  tag_color: "bg-primary/30",
  published_at: new Date().toISOString(),
  active: true,
  description: "",
  image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500"
};

export default function NewsManagement() {
  // 뉴스 데이터 상태
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setLocation] = useLocation();

  // 상세 내용 다이얼로그를 위한 상태
  const [selectedNews, setSelectedNews] = useState<News | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState<News | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newNewsItem, setNewNewsItem] = useState<News>({...defaultNewsItem});
  const [saving, setSaving] = useState(false);

  // 뉴스 데이터 불러오기
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
      
      console.log('Supabase에서 불러온 뉴스 데이터:', data);
      setNews(data || []);
    } catch (error) {
      console.error('뉴스 데이터 로딩 오류:', error);
      toast({
        title: "데이터 로딩 오류",
        description: "뉴스 데이터를 불러오는 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // 뉴스 삭제 함수
  const handleDelete = async (id: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    
    if (!supabase) {
      toast({
        title: "오류",
        description: "Supabase 클라이언트가 초기화되지 않았습니다.",
        variant: "destructive"
      });
      return;
    }

    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('news')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // 목록에서 제거
      setNews(news.filter(item => item.id !== id));
      
      // 만약 현재 선택된 뉴스가 삭제된 뉴스라면 다이얼로그를 닫습니다
      if (selectedNews?.id === id) {
        setDialogOpen(false);
        setSelectedNews(null);
      }
      
      toast({
        title: "삭제 완료",
        description: "뉴스가 성공적으로 삭제되었습니다."
      });
    } catch (error) {
      console.error('뉴스 삭제 오류:', error);
      toast({
        title: "삭제 오류",
        description: "뉴스를 삭제하는 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  // 뉴스 카드 클릭 핸들러
  const handleCardClick = (newsItem: News) => {
    setSelectedNews(newsItem);
    setDialogOpen(true);
    setIsEditing(false);
  };

  // 수정 버튼 클릭 핸들러
  const handleEditClick = () => {
    if (selectedNews) {
      setEditFormData({...selectedNews});
      setIsEditing(true);
    }
  };

  // 수정 폼 입력 핸들러
  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (editFormData) {
      setEditFormData({
        ...editFormData,
        [name]: value
      });
    }
  };
  
  // 활성화 상태 변경 핸들러
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>, form: 'edit' | 'new') => {
    const active = e.target.value === '활성화';
    
    if (form === 'edit' && editFormData) {
      setEditFormData({
        ...editFormData,
        active
      });
    } else if (form === 'new') {
      setNewNewsItem({
        ...newNewsItem,
        active
      });
    }
  };
  
  // 새 뉴스 작성 폼 입력 핸들러
  const handleNewFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewNewsItem({
      ...newNewsItem,
      [name]: value
    });
  };

  // 새 뉴스 작성 핸들러
  const handleCreateNews = async () => {
    // 필드 유효성 검사
    if (!newNewsItem.title || !newNewsItem.category || !newNewsItem.description) {
      toast({
        title: "입력 오류",
        description: "제목, 카테고리, 내용은 필수 입력 항목입니다.",
        variant: "destructive"
      });
      return;
    }

    if (!supabase) {
      toast({
        title: "오류",
        description: "Supabase 클라이언트가 초기화되지 않았습니다.",
        variant: "destructive"
      });
      return;
    }

    try {
      setSaving(true);
      
      // Supabase에 저장
      const { data, error } = await supabase
        .from('news')
        .insert([{
          title: newNewsItem.title,
          category: newNewsItem.category,
          tag: newNewsItem.tag,
          tag_color: newNewsItem.tag_color,
          description: newNewsItem.description,
          image: newNewsItem.image,
          published_at: new Date().toISOString(),
          active: newNewsItem.active
        }])
        .select();

      if (error) throw error;
      
      if (data && data.length > 0) {
        // 뉴스 목록에 추가
        setNews([data[0], ...news]);
        
        toast({
          title: "생성 완료",
          description: "새 뉴스가 성공적으로 생성되었습니다."
        });
      }
      
      // 초기화 및 다이얼로그 닫기
      setNewNewsItem({...defaultNewsItem});
      setCreateDialogOpen(false);
    } catch (error) {
      console.error('뉴스 생성 오류:', error);
      toast({
        title: "생성 오류",
        description: "뉴스를 생성하는 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  // 수정 폼 저장 핸들러
  const handleEditFormSubmit = async () => {
    if (!editFormData) return;
    
    // 필드 유효성 검사
    if (!editFormData.title || !editFormData.category || !editFormData.description) {
      toast({
        title: "입력 오류",
        description: "제목, 카테고리, 내용은 필수 입력 항목입니다.",
        variant: "destructive"
      });
      return;
    }
    
    if (!supabase || !editFormData.id) {
      toast({
        title: "오류",
        description: "Supabase 클라이언트가 초기화되지 않았거나 ID가 없습니다.",
        variant: "destructive"
      });
      return;
    }

    try {
      setSaving(true);
      
      // Supabase에 저장
      const { error } = await supabase
        .from('news')
        .update({
          title: editFormData.title,
          category: editFormData.category,
          tag: editFormData.tag,
          tag_color: editFormData.tag_color,
          description: editFormData.description,
          image: editFormData.image,
          active: editFormData.active
        })
        .eq('id', editFormData.id);

      if (error) throw error;
      
      // 뉴스 목록 업데이트
      setNews(news.map(item => 
        item.id === editFormData.id ? editFormData : item
      ));
      
      // 선택된 뉴스도 업데이트
      setSelectedNews(editFormData);
      setIsEditing(false);
      
      toast({
        title: "수정 완료",
        description: "뉴스가 성공적으로 수정되었습니다."
      });
    } catch (error) {
      console.error('뉴스 수정 오류:', error);
      toast({
        title: "수정 오류",
        description: "뉴스를 수정하는 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  // 날짜 형식 변환 함수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => setLocation('/admin/dashboard')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> 대시보드로 돌아가기
          </Button>
          <h1 className="text-2xl font-bold">뉴스 목록</h1>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)} className="bg-gradient-to-r from-primary to-purple-500">
          <PlusCircle className="mr-2 h-4 w-4" /> 새 뉴스 작성
        </Button>
      </div>

      {/* 뉴스 목록 테이블 */}
      <div className="bg-card rounded-lg border shadow-sm mb-6 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">뉴스 데이터를 불러오는 중...</span>
          </div>
        ) : news.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-muted-foreground mb-4">등록된 뉴스가 없습니다.</p>
            <Button onClick={() => setCreateDialogOpen(true)} variant="outline">
              <PlusCircle className="mr-2 h-4 w-4" /> 새 뉴스 작성하기
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">제목</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">카테고리</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">발행일</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">상태</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {news.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/20 cursor-pointer" onClick={() => handleCardClick(item)}>
                    <td className="px-4 py-3">
                      <div className="font-medium">{item.title}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <span>{item.category}</span>
                        {item.tag && (
                          <Badge className={`${item.tag_color} text-white w-fit`}>{item.tag}</Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">{formatDate(item.published_at)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={item.active ? 'default' : 'secondary'}>
                        {item.active ? '활성화' : '비활성화'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mr-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedNews(item);
                          setEditFormData(item);
                          setIsEditing(true);
                          setDialogOpen(true);
                        }}
                        disabled={saving}
                      >
                        수정
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (item.id) handleDelete(item.id);
                        }}
                        disabled={saving}
                      >
                        삭제
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 상세 보기 다이얼로그 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-5xl">
          {selectedNews && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {isEditing ? "뉴스 수정" : selectedNews.title}
                </DialogTitle>
                <DialogDescription>
                  {isEditing ? "뉴스 내용을 수정하세요. HTML 태그를 사용하여 서식을 적용할 수 있습니다." : 
                    <>
                      <div>
                        <span>{selectedNews.category}</span>
                        {selectedNews.tag && (
                          <Badge className={`${selectedNews.tag_color} text-white ml-2`}>
                            {selectedNews.tag}
                          </Badge>
                        )}
                      </div>
                      <Badge variant={selectedNews.active ? 'default' : 'secondary'}>
                        {selectedNews.active ? '활성화' : '비활성화'}
                      </Badge>
                    </>
                  }
                </DialogDescription>
              </DialogHeader>
              
              {/* 뉴스 내용 */}
              <div className="mt-4">
                {/* 뉴스 이미지 */}
                {selectedNews.image && !isEditing && (
                  <div className="mb-4 rounded-md overflow-hidden">
                    <img
                      src={selectedNews.image}
                      alt={selectedNews.title}
                      className="w-full h-auto object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500";
                      }}
                    />
                  </div>
                )}
                
                {/* 수정 폼 */}
                {isEditing ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* 왼쪽: 입력 폼 */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm mb-1">제목 *</label>
                        <input
                          type="text"
                          name="title"
                          value={editFormData?.title || ''}
                          onChange={handleEditFormChange}
                          className="w-full px-3 py-2 border rounded bg-background"
                          placeholder="제목을 입력하세요"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm mb-1">카테고리 *</label>
                          <input
                            type="text"
                            name="category"
                            value={editFormData?.category || ''}
                            onChange={handleEditFormChange}
                            className="w-full px-3 py-2 border rounded bg-background"
                            placeholder="카테고리"
                          />
                        </div>
                        <div>
                          <label className="block text-sm mb-1">태그</label>
                          <input
                            type="text"
                            name="tag"
                            value={editFormData?.tag || ''}
                            onChange={handleEditFormChange}
                            className="w-full px-3 py-2 border rounded bg-background"
                            placeholder="태그"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm mb-1">태그 색상</label>
                          <input
                            type="text"
                            name="tag_color"
                            value={editFormData?.tag_color || ''}
                            onChange={handleEditFormChange}
                            className="w-full px-3 py-2 border rounded bg-background"
                            placeholder="예: bg-primary/30"
                          />
                        </div>
                        <div>
                          <label className="block text-sm mb-1">상태</label>
                          <select
                            value={editFormData?.active ? '활성화' : '비활성화'}
                            onChange={(e) => handleStatusChange(e, 'edit')}
                            className="w-full px-3 py-2 border rounded bg-background"
                          >
                            <option value="활성화">활성화</option>
                            <option value="비활성화">비활성화</option>
                          </select>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm mb-1">이미지 URL</label>
                        <input
                          type="text"
                          name="image"
                          value={editFormData?.image || ''}
                          onChange={handleEditFormChange}
                          className="w-full px-3 py-2 border rounded bg-background"
                          placeholder="이미지 URL"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm mb-1">내용 *</label>
                        <p className="text-xs text-gray-500 mb-2">HTML 태그를 사용하여 서식을 적용할 수 있습니다. (예: &lt;b&gt;굵게&lt;/b&gt;, &lt;i&gt;기울임&lt;/i&gt;, &lt;a href="..."&gt;링크&lt;/a&gt;)</p>
                        <textarea
                          name="description"
                          value={editFormData?.description || ''}
                          onChange={handleEditFormChange}
                          className="w-full px-3 py-2 border rounded min-h-[300px] bg-background"
                          placeholder="뉴스 내용을 입력하세요"
                        />
                      </div>
                    </div>
                    
                    {/* 오른쪽: HTML 미리보기 */}
                    <div>
                      <div className="mb-2 font-medium">HTML 미리보기</div>
                      <div className="input-with-inner-html">
                        <div className="bg-white text-black p-4 rounded-md border overflow-y-auto min-h-[500px]">
                          <h1 className="text-2xl font-bold mb-4">{editFormData?.title || '제목'}</h1>
                          <div className="prose prose-sm max-w-none">
                            <div dangerouslySetInnerHTML={{ __html: editFormData?.description || '내용이 여기에 표시됩니다.' }} />
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground mt-2 text-right">
                          {editFormData?.active ? '활성화 상태' : '비활성화 상태'} | 
                          카테고리: {editFormData?.category || '없음'} |
                          태그: {editFormData?.tag || '없음'}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: selectedNews.description }} />
                  </div>
                )}
              </div>
              
              {/* 버튼 영역 */}
              <div className="flex justify-end gap-2 mt-4">
                {isEditing ? (
                  <>
                    <Button variant="outline" onClick={() => setIsEditing(false)} disabled={saving}>
                      취소
                    </Button>
                    <Button onClick={handleEditFormSubmit} disabled={saving}>
                      {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      저장하기
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                      닫기
                    </Button>
                    <Button onClick={handleEditClick}>
                      수정하기
                    </Button>
                  </>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* 새 뉴스 작성 다이얼로그 */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>새 뉴스 작성</DialogTitle>
            <DialogDescription>
              아래 양식을 작성하여 새 뉴스를 등록하세요. HTML 태그를 사용하여 서식을 적용할 수 있습니다.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {/* 왼쪽: 입력 폼 */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-1">제목 *</label>
                <input
                  type="text"
                  name="title"
                  value={newNewsItem.title}
                  onChange={handleNewFormChange}
                  className="w-full px-3 py-2 border rounded bg-background"
                  placeholder="제목을 입력하세요"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1">카테고리 *</label>
                  <input
                    type="text"
                    name="category"
                    value={newNewsItem.category}
                    onChange={handleNewFormChange}
                    className="w-full px-3 py-2 border rounded bg-background"
                    placeholder="카테고리"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">태그</label>
                  <input
                    type="text"
                    name="tag"
                    value={newNewsItem.tag}
                    onChange={handleNewFormChange}
                    className="w-full px-3 py-2 border rounded bg-background"
                    placeholder="태그"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1">태그 색상</label>
                  <input
                    type="text"
                    name="tag_color"
                    value={newNewsItem.tag_color}
                    onChange={handleNewFormChange}
                    className="w-full px-3 py-2 border rounded bg-background"
                    placeholder="예: bg-primary/30"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">상태</label>
                  <select
                    value={newNewsItem.active ? '활성화' : '비활성화'}
                    onChange={(e) => handleStatusChange(e, 'new')}
                    className="w-full px-3 py-2 border rounded bg-background"
                  >
                    <option value="활성화">활성화</option>
                    <option value="비활성화">비활성화</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm mb-1">이미지 URL</label>
                <input
                  type="text"
                  name="image"
                  value={newNewsItem.image}
                  onChange={handleNewFormChange}
                  className="w-full px-3 py-2 border rounded bg-background"
                  placeholder="이미지 URL"
                />
              </div>
              
              <div>
                <label className="block text-sm mb-1">내용 *</label>
                <p className="text-xs text-gray-500 mb-2">HTML 태그를 사용하여 서식을 적용할 수 있습니다. (예: &lt;b&gt;굵게&lt;/b&gt;, &lt;i&gt;기울임&lt;/i&gt;, &lt;a href="..."&gt;링크&lt;/a&gt;)</p>
                <textarea
                  name="description"
                  value={newNewsItem.description}
                  onChange={handleNewFormChange}
                  className="w-full px-3 py-2 border rounded min-h-[300px] bg-background"
                  placeholder="뉴스 내용을 입력하세요"
                />
              </div>
            </div>
            
            {/* 오른쪽: HTML 미리보기 */}
            <div>
              <div className="mb-2 font-medium">HTML 미리보기</div>
              <div className="input-with-inner-html">
                <div className="bg-white text-black p-4 rounded-md border overflow-y-auto min-h-[500px]">
                  <h1 className="text-2xl font-bold mb-4">{newNewsItem.title || '제목'}</h1>
                  <div className="prose prose-sm max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: newNewsItem.description || '내용이 여기에 표시됩니다.' }} />
                  </div>
                </div>
                <div className="text-xs text-muted-foreground mt-2 text-right">
                  {newNewsItem.active ? '활성화 상태' : '비활성화 상태'} | 
                  카테고리: {newNewsItem.category || '없음'} |
                  태그: {newNewsItem.tag || '없음'}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)} disabled={saving}>
              취소
            </Button>
            <Button onClick={handleCreateNews} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              등록하기
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 