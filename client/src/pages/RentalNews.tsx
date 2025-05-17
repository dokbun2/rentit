import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getNews } from "../lib/api/news";
import { News } from "../types/news";
import { formatDate } from "../lib/utils";
import { Button } from "../components/ui/button";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { fadeIn } from "../lib/motion";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "../components/ui/dialog";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "../components/ui/form";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { toast } from "../hooks/use-toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { PlusCircle, Edit, Trash2, Calendar, ArrowRight, ArrowLeft } from "lucide-react";
import { supabase } from "../lib/supabase";

// HTML 태그 제거 함수
const stripHtmlTags = (html: string) => {
  // 빈 문자열이나 null, undefined 체크
  if (!html) return '';
  
  // 스타일 태그와 내용 제거 (스타일 태그 안의 내용까지 모두 제거)
  let cleanedText = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  
  // 스크립트 태그와 내용 제거
  cleanedText = cleanedText.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  
  // 나머지 HTML 태그 제거
  cleanedText = cleanedText.replace(/<[^>]*>/g, '');
  
  // HTML 엔티티 디코딩 (예: &amp; -> &, &lt; -> <)
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = cleanedText;
  
  // CSS 선택자나 스타일 관련 텍스트 추가 제거 (예: .container, font-family 등)
  let finalText = tempDiv.textContent || tempDiv.innerText || '';
  finalText = finalText.replace(/\.\w+\s*{[^}]*}/g, ''); // CSS 규칙 제거
  finalText = finalText.replace(/[a-z-]+\s*:\s*[^;]+(;|\s*$)/gi, ''); // CSS 속성 제거
  
  return finalText.trim();
};

// 뉴스 작성 폼 유효성 검사 스키마
const newsFormSchema = z.object({
  title: z.string().min(2, { message: "제목을 입력해주세요" }),
  content: z.string().min(10, { message: "내용을 10자 이상 입력해주세요" }),
  image_url: z.string().url({ message: "유효한 URL을 입력해주세요" }).optional().or(z.literal('')),
  link: z.string().url({ message: "유효한 URL을 입력해주세요" }).optional().or(z.literal('')),
  category: z.string().optional().or(z.literal('')),
  tag: z.string().optional().or(z.literal('')),
  tag_color: z.string().optional().or(z.literal('')),
});

type NewsFormValues = z.infer<typeof newsFormSchema>;

export default function RentalNews() {
  const [, setLocation] = useLocation();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedNews, setSelectedNews] = useState<News | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewDetailMode, setViewDetailMode] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  // 미리보기 상태 추가
  const [createPreviewContent, setCreatePreviewContent] = useState<string>("");
  const [editPreviewContent, setEditPreviewContent] = useState<string>("");

  // 사용자 인증 상태 확인
  const [isAdmin, setIsAdmin] = useState(false);

  // 모바일 화면 감지를 위한 상태
  const [isMobile, setIsMobile] = useState(false);
  
  // 화면 크기 변경을 감지하는 useEffect
  useEffect(() => {
    // 초기 화면 크기 확인
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    // 초기 체크
    checkMobile();
    
    // 화면 크기 변경 이벤트 핸들러
    window.addEventListener('resize', checkMobile);
    
    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // URL에서 ID 파라미터 가져오기
  const getNewsIdFromUrl = () => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const id = urlParams.get('id');
      return id ? parseInt(id, 10) : null;
    }
    return null;
  };

  // 뉴스 데이터 불러오기
  const { data: news, isLoading, refetch } = useQuery<News[]>({
    queryKey: ["news"],
    queryFn: getNews,
  });

  // 사용자 인증 상태 확인
  const checkAuthStatus = async () => {
    try {
      const { data } = await supabase.auth.getSession();
      
      if (data.session) {
        // 현재 사용자 정보 가져오기
        const { user } = data.session;
        
        // 관리자 이메일 목록 - 실제 관리자 이메일로 변경하세요
        const adminEmails = ['admin@rentit.com', 'ceo@rnpick.co.kr']; 
        
        // 사용자 메타데이터에서 역할 확인 또는 이메일로 관리자 여부 확인
        const isAdminByEmail = adminEmails.includes(user.email || '');
        const isAdminByMetadata = user.user_metadata?.role === 'admin';
        
        console.log('현재 로그인 사용자:', user.email);
        console.log('관리자 여부 (이메일):', isAdminByEmail);
        console.log('관리자 여부 (메타데이터):', isAdminByMetadata);
        
        // 관리자 상태 설정 (이메일 또는 메타데이터 기반)
        setIsAdmin(isAdminByEmail || isAdminByMetadata);
      } else {
        setIsAdmin(false);
      }
    } catch (error) {
      console.error('인증 상태 확인 오류:', error);
      setIsAdmin(false);
    }
  };

  // URL에서 ID를 읽어 해당 뉴스 상세보기로 자동 이동
  useEffect(() => {
    const newsId = getNewsIdFromUrl();
    if (newsId && news) {
      const targetNews = news.find(item => item.id === newsId);
      if (targetNews) {
        setSelectedNews(targetNews);
        setViewDetailMode(true);
      }
    }
  }, [news]);

  // 컴포넌트 마운트 시 인증 상태 확인
  useEffect(() => {
    checkAuthStatus();
    // dark 모드 적용
    document.documentElement.classList.add('dark');
    
    return () => {
      document.documentElement.classList.remove('dark');
    };
  }, []);

  // 뉴스 작성 폼
  const createForm = useForm<NewsFormValues>({
    resolver: zodResolver(newsFormSchema),
    defaultValues: {
      title: "",
      content: "",
      image_url: "",
      link: "",
      category: "렌탈뉴스",
      tag: "",
      tag_color: "bg-primary/30",
    },
  });

  // 미리보기 내용 업데이트 (작성 폼)
  useEffect(() => {
    const subscription = createForm.watch((value) => {
      if (value.content) {
        setCreatePreviewContent(value.content);
      }
    });
    return () => subscription.unsubscribe();
  }, [createForm.watch]);

  // 뉴스 수정 폼
  const editForm = useForm<NewsFormValues>({
    resolver: zodResolver(newsFormSchema),
    defaultValues: {
      title: "",
      content: "",
      image_url: "",
      link: "",
      category: "",
      tag: "",
      tag_color: "bg-primary/30",
    },
  });

  // 미리보기 내용 업데이트 (수정 폼)
  useEffect(() => {
    const subscription = editForm.watch((value) => {
      if (value.content) {
        setEditPreviewContent(value.content);
      }
    });
    return () => subscription.unsubscribe();
  }, [editForm.watch]);

  // 뉴스 작성 제출 처리
  const handleCreateSubmit = async (data: NewsFormValues) => {
    setIsSubmitting(true);
    try {
      // Supabase를 통해 뉴스 생성
      const { data: insertedData, error } = await supabase
        .from('news')
        .insert([{
          title: data.title,
          content: data.content,
          image_url: data.image_url || null,
          link: data.link || null,
          category: data.category || "렌탈뉴스",
          tag: data.tag || null,
          tag_color: data.tag_color || "bg-primary/30",
          created_at: new Date().toISOString(),
          active: true
        }])
        .select();

      if (error) {
        throw new Error(error.message);
      }

      toast({
        title: "뉴스가 성공적으로 등록되었습니다",
        variant: "default",
      });

      setIsCreateDialogOpen(false);
      createForm.reset();
      refetch(); // 뉴스 목록 새로고침
    } catch (error) {
      console.error("뉴스 생성 오류:", error);
      toast({
        title: "오류가 발생했습니다",
        description: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 뉴스 수정 제출 처리
  const handleEditSubmit = async (data: NewsFormValues) => {
    if (!selectedNews) return;
    
    setIsSubmitting(true);
    try {
      // Supabase를 통해 뉴스 수정
      const { data: updatedData, error } = await supabase
        .from('news')
        .update({
          title: data.title,
          content: data.content,
          image_url: data.image_url || null,
          link: data.link || null,
          category: data.category || "렌탈뉴스",
          tag: data.tag || null,
          tag_color: data.tag_color || "bg-primary/30",
        })
        .eq('id', selectedNews.id)
        .select();

      if (error) {
        throw new Error(error.message);
      }

      toast({
        title: "뉴스가 성공적으로 수정되었습니다",
        variant: "default",
      });

      setIsEditDialogOpen(false);
      editForm.reset();
      refetch(); // 뉴스 목록 새로고침
    } catch (error) {
      console.error("뉴스 수정 오류:", error);
      toast({
        title: "오류가 발생했습니다",
        description: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 뉴스 삭제 처리
  const handleDelete = async () => {
    if (!selectedNews) return;
    
    setIsSubmitting(true);
    try {
      console.log('삭제 요청 ID:', selectedNews.id, typeof selectedNews.id);
      
      const { data, error } = await supabase
        .from('news')
        .delete()
        .eq('id', selectedNews.id)
        .select();

      console.log('삭제 응답:', data, error);

      if (error) throw error;
      
      toast({
        title: "뉴스가 성공적으로 삭제되었습니다",
        variant: "default",
      });

      setIsDeleteDialogOpen(false);
      setViewDetailMode(false);
      refetch(); // 뉴스 목록 새로고침
    } catch (error) {
      console.error("뉴스 삭제 오류:", error);
      toast({
        title: "오류가 발생했습니다",
        description: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 수정 버튼 클릭 처리
  const handleEditClick = (item: News) => {
    setSelectedNews(item);
    editForm.reset({
      title: item.title,
      content: item.content,
      image_url: item.image_url || "",
      link: item.link || "",
      category: item.category || "렌탈뉴스",
      tag: item.tag || "",
      tag_color: item.tag_color || "bg-primary/30",
    });
    setEditPreviewContent(item.content); // 미리보기 내용 초기화
    setIsEditDialogOpen(true);
  };

  // 삭제 버튼 클릭 처리
  const handleDeleteClick = (item: News) => {
    setSelectedNews(item);
    setIsDeleteDialogOpen(true);
  };

  // 뉴스 상세 보기
  const handleViewDetail = (item: News) => {
    setSelectedNews(item);
    setViewDetailMode(true);
    window.scrollTo(0, 0);
  };

  // 뉴스 목록으로 돌아가기
  const handleBackToList = () => {
    setSelectedNews(null);
    setViewDetailMode(false);
    setActiveCategory(null); // 카테고리 필터 초기화
    
    // URL에서 ID 파라미터 제거
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('id');
      window.history.replaceState({}, '', url.toString());
    }
    
    window.scrollTo(0, 0);
  };

  // 카테고리 변경 시 애니메이션 리셋을 위한 키 값
  const newsGridKey = activeCategory || 'all';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
          <span className="sr-only">로딩 중...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 dark-lighter relative overflow-hidden">
      {/* 배경 효과 */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary rounded-full opacity-5 -ml-40 -mt-40"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-secondary rounded-full opacity-5 -mr-60 -mb-60"></div>
      <div className="absolute top-1/3 right-10 w-48 h-48 bg-gradient-radial from-primary/20 to-transparent opacity-30"></div>
      
      <div className="container max-w-[1960px] mx-auto px-4 py-12 pt-14 md:pt-16 relative z-10">
        {!viewDetailMode ? (
          <>
            {/* 헤더 섹션 */}
            <motion.div
              initial="hidden"
              animate="show"
              variants={fadeIn("down", 0.2)}
              className="flex flex-col md:flex-row justify-start items-start md:items-center mb-12 md:justify-between"
            >
              <div>
                <motion.h1 
                  variants={fadeIn("up", 0.1)}
                  className="text-4xl md:text-5xl font-bold text-foreground mb-2 text-left"
                >
                  렌탈 <span className="text-primary">뉴스</span>
                </motion.h1>
                <motion.p 
                  variants={fadeIn("up", 0.2)}
                  className="text-gray-400 text-left"
                >
                  렌탈 시장의 최신 트렌드와 업계 소식을 확인하세요
                </motion.p>
              </div>
              <motion.div 
                variants={fadeIn("up", 0.3)}
                className="flex gap-4 mt-4 md:mt-0"
              >
                <Button
                  variant="default"
                  onClick={() => setLocation("/")}
                  className="bg-primary hover:bg-primary/90 text-white transition-all"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> 홈으로 돌아가기
                </Button>
              </motion.div>
            </motion.div>
            
            {/* 카테고리 필터 (선택 사항) */}
            {news && news.length > 0 && (
              <motion.div
                initial="hidden"
                animate="show"
                variants={fadeIn("up", 0.3)}
                className="mb-8 overflow-x-auto pb-2"
              >
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className={`rounded-full ${
                      !activeCategory ? 'bg-primary text-white' : 'hover:bg-primary/10'
                    }`}
                    onClick={() => setActiveCategory(null)}
                  >
                    전체
                  </Button>
                  {Array.from(new Set(news.map(item => item.category))).map(
                    (category, index) => (
                      category && (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className={`rounded-full whitespace-nowrap ${
                            activeCategory === category 
                              ? 'bg-primary text-white' 
                              : 'hover:bg-primary/10'
                          }`}
                          onClick={() => setActiveCategory(category)}
                        >
                          {category}
                        </Button>
                      )
                    )
                  )}
                </div>
              </motion.div>
            )}
            
            {/* 뉴스 그리드 */}
            {news && news.length > 0 && (
              <motion.div
                key={newsGridKey}
                initial="hidden"
                animate="show"
                variants={fadeIn("up", 0.2)}
                className="grid grid-cols-1 gap-8"
              >
                {(activeCategory ? news.filter(item => item.category === activeCategory) : news)
                  .slice(0, isMobile ? 1 : news.length)
                  .map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial="hidden"
                    animate="show"
                    variants={fadeIn("up", 0.2 + index * 0.05)}
                    className="group bg-white dark:bg-white/95 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary/20 border border-gray-200 hover:border-primary/30 flex flex-row items-center p-4 md:p-6 gap-4 md:gap-6 relative"
                    onClick={() => handleViewDetail(item)}
                  >
                    {/* 이미지 컨테이너 - 더 큰 정사각형 썸네일 */}
                    <div className="flex-shrink-0 w-[160px] h-[160px] md:w-[220px] md:h-[220px] relative overflow-hidden rounded-xl shadow-md border-2 border-gray-100">
                      <img
                        src={item.image_url || "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=800"}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=800";
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>

                    {/* 텍스트 컨텐츠 컨테이너 - 블로그 스타일 */}
                    <div className="flex-1 flex flex-col h-[160px] md:h-[220px] justify-between py-2 pr-10">
                      <div>
                        <h3 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold mb-2 text-left group-hover:text-primary transition-colors line-clamp-1 tracking-tight text-gray-800">
                          {item.title}
                        </h3>
<<<<<<< HEAD
                        <p className="text-gray-600 text-base md:text-lg lg:text-xl mb-2 line-clamp-2 text-left leading-relaxed h-[calc(1.5em*2)] overflow-hidden">
                          {item.content}
=======
                        <p className="text-gray-600 text-base md:text-lg mb-2 line-clamp-2 text-left leading-relaxed h-[calc(1.5em*2)] overflow-hidden">
                          {stripHtmlTags(item.content)}
>>>>>>> rollback-from-8c1775a
                        </p>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-3 mt-auto">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className={`inline-block px-3 py-1.5 rounded-full text-xs font-medium bg-primary/10 text-primary`}>
                            {item.category || "정보"}
                          </span>
                          <span className="text-xs text-gray-500 flex items-center">
                            <Calendar className="h-3 w-3 mr-1 inline-block" />
                            {formatDate(item.created_at)}
                          </span>
                        </div>
                        
                        {isAdmin && (
                          <div className="flex gap-2 ml-auto">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => { e.stopPropagation(); handleEditClick(item); }}
                              className="w-8 h-8 rounded-full text-gray-600 hover:text-primary hover:bg-primary/10"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => { e.stopPropagation(); handleDeleteClick(item); }}
                              className="w-8 h-8 rounded-full text-gray-600 hover:text-red-500 hover:bg-red-500/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* 우측 중앙에 큰 화살표 아이콘 */}
                    <div 
                      className="absolute right-2 top-1/2 -translate-y-1/2 transition-all"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewDetail(item);
                      }}
                    >
                      <div className="w-9 h-9 md:w-12 md:h-12 rounded-full bg-primary/10 group-hover:bg-primary flex items-center justify-center transition-all duration-300 cursor-pointer">
                        <ArrowRight className="h-5 w-5 md:h-6 md:w-6 text-primary group-hover:text-white transition-all duration-300" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* 뉴스가 없을 경우 */}
            {(!news || news.length === 0 || (activeCategory && news.filter(item => item.category === activeCategory).length === 0)) && (
              <motion.div 
                initial="hidden"
                animate="show"
                variants={fadeIn("up", 0.3)}
                className="glass-effect rounded-xl p-12 text-left"
              >
                {activeCategory ? (
                  <>
                    <p className="text-muted-foreground text-lg mb-6 text-left">
                      <span className="text-primary font-semibold">{activeCategory}</span> 카테고리에 등록된 뉴스가 없습니다.
                    </p>
                    <Button
                      variant="outline"
                      className="hover:bg-primary hover:text-white transition-colors"
                      onClick={() => setActiveCategory(null)}
                    >
                      모든 뉴스 보기
                    </Button>
                  </>
                ) : (
                  <p className="text-muted-foreground text-lg mb-6 text-left">등록된 뉴스가 없습니다.</p>
                )}
              </motion.div>
            )}
          </>
        ) : (
          /* 상세 보기 모드 */
          selectedNews && (
            <motion.div
              initial="hidden"
              animate="show"
              variants={fadeIn("up", 0.2)}
              className="max-w-[1960px] mx-auto"
            >
              <div className="flex justify-between items-center mb-6 mt-4">
                <Button
                  variant="default"
                  onClick={handleBackToList}
                  className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white"
                >
                  <ArrowLeft className="h-4 w-4" /> 목록으로 돌아가기
                </Button>
                
                {/* 관리자에게만 수정/삭제 버튼 표시 */}
                {isAdmin && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handleEditClick(selectedNews)}
                      className="flex items-center gap-2 border-gray-700 hover:text-primary"
                    >
                      <Edit className="h-4 w-4" /> 수정하기
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleDeleteClick(selectedNews)}
                      className="flex items-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" /> 삭제하기
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="glass-effect rounded-xl overflow-hidden">
                {/* 헤더 이미지 */}
<<<<<<< HEAD
                <div className="relative h-[380px] md:h-[500px]">
=======
                <div className="relative rounded-xl overflow-hidden mx-4 md:mx-6">
>>>>>>> rollback-from-8c1775a
                  <img 
                    src={selectedNews.image_url} 
                    alt={selectedNews.title} 
                    className="w-full h-auto block object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500";
                    }}
                  />
                </div>
                
                {/* 뉴스 정보 (이미지 아래로 이동) */}
                <div className="p-6 md:p-8 bg-gradient-to-br from-purple-900/90 via-indigo-900/90 to-purple-800/90 border-t border-purple-500/30 mt-4 md:mt-6 rounded-xl rounded-bl-none rounded-br-none shadow-lg mx-4 md:mx-6">
                  <h1 className="text-3xl md:text-4xl font-bold text-left mb-4 text-white drop-shadow-sm">{selectedNews.title}</h1>
                  
                  <div className="flex justify-between items-center mt-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="bg-purple-500/20 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs text-purple-100 font-medium border border-purple-500/30">
                        {selectedNews.category || "렌탈뉴스"}
                      </span>
                      {selectedNews.tag && (
                        <span className={`px-2.5 py-1 bg-indigo-500/30 backdrop-blur-sm rounded-full text-xs text-indigo-100 border border-indigo-500/30`}>
                          {selectedNews.tag}
                        </span>
                      )}
                    </div>
<<<<<<< HEAD
                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white text-left">{selectedNews.title}</h1>
                    <div className="flex items-center mt-2 text-gray-300">
                      <Calendar className="h-4 w-4 mr-2" />
=======
                    
                    <div className="text-purple-300 text-xs flex items-center">
                      <Calendar className="h-3.5 w-3.5 mr-1.5 text-purple-300" />
>>>>>>> rollback-from-8c1775a
                      {formatDate(selectedNews.created_at)}
                    </div>
                  </div>
                </div>
                
<<<<<<< HEAD
                {/* 본문 내용 - 너비 확장 및 패딩 조정 */}
                <div className="p-4 md:p-8">
                  <article className="prose prose-invert prose-lg md:prose-xl lg:prose-2xl max-w-none w-full mx-auto text-left">
                    {/* 문단 구분을 위해 줄바꿈을 <p> 태그로 변환 */}
                    {selectedNews.content.split('\n\n').map((paragraph, idx) => (
                      paragraph.trim() && (
                        <p key={idx} className="text-gray-300 leading-relaxed mb-8 text-lg md:text-xl lg:text-2xl text-left">
                          {paragraph}
                        </p>
                      )
                    ))}
                  </article>
                  
                  {/* 공유 및 링크 섹션 */}
                  <div className="mt-16 pt-8 border-t border-gray-800 w-full mx-auto">
=======
                {/* 본문 내용 */}
                <div className="p-6 md:p-8 bg-white dark:bg-white rounded-xl rounded-tl-none rounded-tr-none mx-4 md:mx-6 shadow-lg mt-0 border-t-0">
                  <article className="prose prose-lg md:prose-xl max-w-none text-left text-gray-800">
                    {/* HTML 내용 렌더링 */}
                    <div dangerouslySetInnerHTML={{ __html: selectedNews.content }} />
                  </article>
                  
                  {/* 공유 및 링크 섹션 */}
                  <div className="mt-12 pt-8 border-t border-gray-200">
>>>>>>> rollback-from-8c1775a
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6">
                      {/* 링크가 있는 경우 */}
                      {selectedNews.link && (
                        <div className="md:w-2/3">
                          <Button 
                            className="w-full bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-400 py-6 text-lg"
                            onClick={() => window.open(selectedNews.link, "_blank")}
                          >
                            상세 페이지 방문하기
                          </Button>
                        </div>
                      )}
                      
                      {/* 관련 정보 섹션 */}
                      <div className="flex flex-col space-y-2 md:text-right">
                        <p className="text-gray-600">카테고리: <span className="text-primary">{selectedNews.category || "렌탈뉴스"}</span></p>
                        <p className="text-gray-600">작성일: <span className="text-gray-800">{formatDate(selectedNews.created_at)}</span></p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 관련 뉴스 */}
              {news && news.length > 1 && (
                <div className="mt-20">
                  <h2 className="text-3xl font-bold mb-8 text-left">다른 <span className="text-primary">뉴스</span> 보기</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {news
                      .filter(item => item.id !== selectedNews.id)
                      .slice(0, 3)
                      .map((item, index) => (
                        <motion.div
                          key={item.id}
                          initial="hidden"
                          animate="show"
                          variants={fadeIn("up", 0.1 + index * 0.1)}
                          className="glass-effect rounded-xl overflow-hidden cursor-pointer hover:shadow-lg hover:shadow-primary/10 transition-all"
                          onClick={() => handleViewDetail(item)}
                        >
                          <div className="h-52 relative">
                            <img 
                              src={item.image_url} 
                              alt={item.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500";
                              }}
                            />
                            {item.category && (
                              <div className="absolute top-2 left-2 bg-background px-2 py-1 rounded text-xs text-gray-300">
                                {item.category}
                              </div>
                            )}
                          </div>
                          <div className="p-6">
                            <h3 className="font-bold text-xl mb-3 line-clamp-2 text-left">{item.title}</h3>
                            <p className="text-gray-400 text-sm text-left">{formatDate(item.created_at)}</p>
                          </div>
                        </motion.div>
                      ))}
                  </div>
                </div>
              )}
            </motion.div>
          )
        )}
      </div>

      {/* 새 글 작성 다이얼로그 */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[900px] bg-background border border-gray-800">
          <DialogHeader className="text-left">
            <DialogTitle className="text-xl text-left">새 뉴스 작성</DialogTitle>
            <DialogDescription className="text-left">렌탈 시장의 최신 소식을 작성해주세요</DialogDescription>
          </DialogHeader>
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(handleCreateSubmit)} className="space-y-6">
              <FormField
                control={createForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>제목</FormLabel>
                    <FormControl>
                      <Input placeholder="뉴스 제목을 입력하세요" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={createForm.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>카테고리</FormLabel>
                      <FormControl>
                        <Input placeholder="카테고리를 입력하세요" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="tag"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>태그 (선택사항)</FormLabel>
                      <FormControl>
                        <Input placeholder="태그를 입력하세요" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={createForm.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem className="col-span-1">
                      <FormLabel>내용</FormLabel>
                      <p className="text-xs text-gray-500 mb-2">HTML 태그를 사용하여 서식을 적용할 수 있습니다. (예: &lt;b&gt;굵게&lt;/b&gt;, &lt;i&gt;기울임&lt;/i&gt;, &lt;a href="..."&gt;링크&lt;/a&gt;)</p>
                      <FormControl>
                        <Textarea 
                          placeholder="뉴스 내용을 입력하세요" 
                          className="min-h-[400px] font-mono text-sm" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="col-span-1">
                  <div className="mb-2 flex justify-between items-center">
                    <span className="font-medium">미리보기</span>
                    <span className="text-xs text-gray-500">HTML이 적용된 모습을 확인해보세요</span>
                  </div>
                  <div className="border rounded-md p-4 min-h-[400px] bg-white text-gray-800 overflow-auto">
                    <div className="prose prose-sm max-w-none">
                      <div dangerouslySetInnerHTML={{ __html: createPreviewContent }} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={createForm.control}
                  name="image_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>이미지 URL (선택사항)</FormLabel>
                      <FormControl>
                        <Input placeholder="이미지 URL을 입력하세요" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="link"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>링크 URL (선택사항)</FormLabel>
                      <FormControl>
                        <Input placeholder="링크 URL을 입력하세요" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  취소
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-400"
                >
                  {isSubmitting ? "처리 중..." : "등록하기"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* 글 수정 다이얼로그 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[900px] bg-background border border-gray-800">
          <DialogHeader className="text-left">
            <DialogTitle className="text-xl text-left">뉴스 수정</DialogTitle>
            <DialogDescription className="text-left">뉴스 내용을 수정해주세요</DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditSubmit)} className="space-y-6">
              <FormField
                control={editForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>제목</FormLabel>
                    <FormControl>
                      <Input placeholder="뉴스 제목을 입력하세요" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>카테고리</FormLabel>
                      <FormControl>
                        <Input placeholder="카테고리를 입력하세요" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="tag"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>태그 (선택사항)</FormLabel>
                      <FormControl>
                        <Input placeholder="태그를 입력하세요" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={editForm.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem className="col-span-1">
                      <FormLabel>내용</FormLabel>
                      <p className="text-xs text-gray-500 mb-2">HTML 태그를 사용하여 서식을 적용할 수 있습니다. (예: &lt;b&gt;굵게&lt;/b&gt;, &lt;i&gt;기울임&lt;/i&gt;, &lt;a href="..."&gt;링크&lt;/a&gt;)</p>
                      <FormControl>
                        <Textarea 
                          placeholder="뉴스 내용을 입력하세요" 
                          className="min-h-[400px] font-mono text-sm" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="col-span-1">
                  <div className="mb-2 flex justify-between items-center">
                    <span className="font-medium">미리보기</span>
                    <span className="text-xs text-gray-500">HTML이 적용된 모습을 확인해보세요</span>
                  </div>
                  <div className="border rounded-md p-4 min-h-[400px] bg-white text-gray-800 overflow-auto">
                    <div className="prose prose-sm max-w-none">
                      <div dangerouslySetInnerHTML={{ __html: editPreviewContent }} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="image_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>이미지 URL (선택사항)</FormLabel>
                      <FormControl>
                        <Input placeholder="이미지 URL을 입력하세요" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="link"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>링크 URL (선택사항)</FormLabel>
                      <FormControl>
                        <Input placeholder="링크 URL을 입력하세요" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  취소
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-400"
                >
                  {isSubmitting ? "처리 중..." : "수정하기"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* 글 삭제 확인 다이얼로그 */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-background border border-gray-800">
          <DialogHeader className="text-left">
            <DialogTitle className="text-xl text-left">뉴스 삭제</DialogTitle>
            <DialogDescription className="text-left">이 작업은 되돌릴 수 없습니다</DialogDescription>
          </DialogHeader>
          <div className="py-4 text-left">
            <p className="mb-2 text-left">정말로 이 뉴스를 삭제하시겠습니까?</p>
            <p className="font-semibold text-primary text-left">{selectedNews?.title}</p>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isSubmitting}
            >
              취소
            </Button>
            <Button 
              type="button" 
              variant="destructive" 
              onClick={handleDelete}
              disabled={isSubmitting}
            >
              {isSubmitting ? "처리 중..." : "삭제하기"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 