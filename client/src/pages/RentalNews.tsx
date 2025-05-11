import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getNews } from "@/lib/api/news";
import { News } from "@/types/news";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { fadeIn } from "@/lib/motion";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { PlusCircle, Edit, Trash2, Calendar, ArrowRight, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";

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

  // 사용자 인증 상태 확인
  const [isAdmin, setIsAdmin] = useState(false);

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
      // Supabase를 통해 뉴스 삭제
      const { error } = await supabase
        .from('news')
        .delete()
        .eq('id', selectedNews.id);

      if (error) {
        throw new Error(error.message);
      }

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
      
      <div className="container mx-auto px-4 py-12 pt-14 md:pt-16 relative z-10">
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
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                {(activeCategory ? news.filter(item => item.category === activeCategory) : news).map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial="hidden"
                    animate="show"
                    variants={fadeIn("up", 0.2 + index * 0.05)}
                    className="group glass-effect rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 flex flex-col sm:flex-col md:flex-row items-stretch"
                    onClick={() => handleViewDetail(item)}
                  >
                    {/* Image Container - PC에서는 너비 1/3, 모바일에서는 전체 너비 */}
                    <div className="w-full md:w-1/3 h-48 md:h-auto relative overflow-hidden md:flex-shrink-0">
                      <img
                        src={item.image_url || "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500"}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500";
                        }}
                      />
                    </div>

                    {/* Text Content Container - PC에서는 너비 2/3, 모바일에서는 전체 너비 */}
                    <div className="w-full md:w-2/3 p-4 md:p-5 flex flex-col">
                      <h3 className="text-lg lg:text-xl font-bold mb-2 text-left group-hover:text-primary transition-colors line-clamp-2">
                        {item.title}
                      </h3>
                      <p className="text-gray-400 text-sm mb-3 line-clamp-3 text-left flex-grow">
                        {item.content}
                      </p>
                      <div className="mt-auto pt-3"> {/* Footer for text content */}
                        <div className="flex justify-between items-center text-xs text-gray-500 mb-3">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary`}>
                            {item.category || "정보"}
                          </span>
                          <span>{formatDate(item.created_at)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <button
                            className="inline-flex items-center text-primary hover:opacity-80 transition-colors text-sm font-medium"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewDetail(item);
                            }}
                          >
                            더보기 <ArrowRight className="ml-1 h-4 w-4" />
                          </button>
                          {isAdmin && (
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => { e.stopPropagation(); handleEditClick(item); }}
                                className="w-7 h-7 text-gray-500 hover:text-primary"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => { e.stopPropagation(); handleDeleteClick(item); }}
                                className="w-7 h-7 text-gray-500 hover:text-red-500"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
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
              className="max-w-4xl mx-auto"
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
                <div className="relative h-[300px] md:h-[400px]">
                  <img 
                    src={selectedNews.image_url} 
                    alt={selectedNews.title} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500";
                    }}
                  />
                  <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="bg-background px-3 py-1 rounded-full text-sm text-gray-300">
                        {selectedNews.category || "렌탈뉴스"}
                      </span>
                      {selectedNews.tag && (
                        <span className={`px-2 py-1 ${selectedNews.tag_color || "bg-primary/30"} rounded-md text-sm text-white`}>
                          {selectedNews.tag}
                        </span>
                      )}
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white text-left">{selectedNews.title}</h1>
                    <div className="flex items-center mt-2 text-gray-300">
                      <Calendar className="h-4 w-4 mr-2" />
                      {formatDate(selectedNews.created_at)}
                    </div>
                  </div>
                </div>
                
                {/* 본문 내용 */}
                <div className="p-8 md:p-12">
                  <article className="prose prose-invert prose-lg md:prose-xl max-w-none text-left">
                    {/* 문단 구분을 위해 줄바꿈을 <p> 태그로 변환 */}
                    {selectedNews.content.split('\n\n').map((paragraph, idx) => (
                      paragraph.trim() && (
                        <p key={idx} className="text-gray-300 leading-relaxed mb-6 text-left">
                          {paragraph}
                        </p>
                      )
                    ))}
                  </article>
                  
                  {/* 공유 및 링크 섹션 */}
                  <div className="mt-12 pt-8 border-t border-gray-800">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6">
                      {/* 링크가 있는 경우 */}
                      {selectedNews.link && (
                        <div className="md:w-1/2">
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
                        <p className="text-gray-400">카테고리: <span className="text-primary">{selectedNews.category || "렌탈뉴스"}</span></p>
                        <p className="text-gray-400">작성일: <span className="text-white">{formatDate(selectedNews.created_at)}</span></p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 관련 뉴스 */}
              {news && news.length > 1 && (
                <div className="mt-16">
                  <h2 className="text-2xl font-bold mb-6 text-left">다른 <span className="text-primary">뉴스</span> 보기</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                          <div className="h-40 relative">
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
                          <div className="p-4">
                            <h3 className="font-bold text-lg mb-2 line-clamp-2 text-left">{item.title}</h3>
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
        <DialogContent className="sm:max-w-[600px] bg-background border border-gray-800">
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
              <FormField
                control={createForm.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>내용</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="뉴스 내용을 입력하세요" 
                        className="min-h-[200px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
        <DialogContent className="sm:max-w-[600px] bg-background border border-gray-800">
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
              <FormField
                control={editForm.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>내용</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="뉴스 내용을 입력하세요" 
                        className="min-h-[200px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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