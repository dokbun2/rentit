import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getNews } from "@/lib/api/news";
import { News } from "@/types/news";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter
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
import { PlusCircle, Edit, Trash2, Calendar } from "lucide-react";
import { supabase } from "@/lib/supabase";

// 뉴스 작성 폼 유효성 검사 스키마
const newsFormSchema = z.object({
  title: z.string().min(2, { message: "제목을 입력해주세요" }),
  content: z.string().min(10, { message: "내용을 10자 이상 입력해주세요" }),
  image_url: z.string().url({ message: "유효한 URL을 입력해주세요" }).optional().or(z.literal('')),
  link: z.string().url({ message: "유효한 URL을 입력해주세요" }).optional().or(z.literal('')),
});

type NewsFormValues = z.infer<typeof newsFormSchema>;

export default function RentalNews() {
  const [, setLocation] = useLocation();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedNews, setSelectedNews] = useState<News | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 사용자 인증 상태 확인
  const [isAdmin, setIsAdmin] = useState(false);

  // 뉴스 데이터 불러오기
  const { data: news, isLoading, refetch } = useQuery<News[]>({
    queryKey: ["news"],
    queryFn: getNews,
  });

  // 사용자 인증 상태 확인
  const checkAuthStatus = async () => {
    const { data } = await supabase.auth.getSession();
    setIsAdmin(!!data.session);
  };

  // 컴포넌트 마운트 시 인증 상태 확인
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // 뉴스 작성 폼
  const createForm = useForm<NewsFormValues>({
    resolver: zodResolver(newsFormSchema),
    defaultValues: {
      title: "",
      content: "",
      image_url: "",
      link: "",
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
    });
    setIsEditDialogOpen(true);
  };

  // 삭제 버튼 클릭 처리
  const handleDeleteClick = (item: News) => {
    setSelectedNews(item);
    setIsDeleteDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-foreground">렌탈 뉴스</h1>
          <div className="flex gap-4">
            {isAdmin && (
              <Button
                onClick={() => setIsCreateDialogOpen(true)}
                className="bg-primary hover:bg-primary/90 text-white"
              >
                <PlusCircle className="mr-2 h-4 w-4" /> 새 글 작성
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => setLocation("/")}
              className="hover:bg-primary hover:text-white transition-colors"
            >
              홈으로 돌아가기
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {news?.map((item) => (
            <div
              key={item.id}
              className="bg-card rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col"
            >
              {item.image_url && (
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // 이미지 로드 실패 시 기본 이미지로 대체
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500";
                    }}
                  />
                </div>
              )}
              <div className="p-6 flex-grow">
                <h2 className="text-xl font-semibold mb-2 text-foreground">
                  {item.title}
                </h2>
                <p className="text-muted-foreground mb-4 line-clamp-3">
                  {item.content}
                </p>
                <div className="flex items-center text-sm text-muted-foreground mb-4">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{formatDate(item.created_at)}</span>
                </div>
              </div>
              <div className="p-4 border-t border-gray-200 dark:border-gray-800 flex justify-between items-center">
                <Button
                  variant="ghost"
                  onClick={() => item.link ? window.open(item.link, "_blank") : null}
                  className="text-primary hover:text-primary/80"
                  disabled={!item.link}
                >
                  자세히 보기
                </Button>
                
                {isAdmin && (
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditClick(item)}
                      className="text-gray-500 hover:text-primary"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(item)}
                      className="text-gray-500 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 뉴스가 없을 경우 */}
        {(!news || news.length === 0) && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg mb-4">등록된 뉴스가 없습니다.</p>
            {isAdmin && (
              <Button
                onClick={() => setIsCreateDialogOpen(true)}
                className="bg-primary hover:bg-primary/90 text-white"
              >
                <PlusCircle className="mr-2 h-4 w-4" /> 첫 뉴스 작성하기
              </Button>
            )}
          </div>
        )}

        {/* 새 글 작성 다이얼로그 */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>새 뉴스 작성</DialogTitle>
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
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "처리 중..." : "등록하기"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* 글 수정 다이얼로그 */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>뉴스 수정</DialogTitle>
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
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "처리 중..." : "수정하기"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* 글 삭제 확인 다이얼로그 */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>뉴스 삭제</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p>정말로 이 뉴스를 삭제하시겠습니까?</p>
              <p className="font-semibold mt-2">{selectedNews?.title}</p>
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
    </div>
  );
} 