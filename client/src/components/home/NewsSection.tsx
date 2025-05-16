import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fadeIn } from "@/lib/motion";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { NewsItem } from "@/lib/supabase";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { News } from "@/types/news";
import { formatDate } from "@/lib/utils";
import { useLocation } from "wouter";

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

// 기본 뉴스 아이템 (API 로딩 실패 시 보여줄 더미 데이터)
const fallbackNewsItems = [
  {
    image_url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500",
    category: "시장 동향",
    tag: "렌탈 트렌드",
    tag_color: "bg-primary-dark/30",
    title: "2023년 하반기 렌탈 시장 동향 분석",
    content: "코로나19 이후 변화된 소비 패턴과 렌탈 시장의 새로운 기회에 대해 알아봅니다. 구독 경제의 성장과 함께 주목받는 렌탈 비즈니스의 미래 전망을 분석합니다.",
    created_at: "2023-09-15T00:00:00Z",
  },
  {
    image_url: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500",
    category: "기술 혁신",
    tag: "디지털 전환",
    tag_color: "bg-secondary-dark/30",
    title: "디지털 기술로 진화하는 렌탈 비즈니스",
    content: "AI와 빅데이터를 활용한 렌탈 관리 시스템의 발전 사례와 디지털 전환을 통해 성공한 렌탈 기업들의 전략을 소개합니다. 비대면 시대에 맞는 효율적인 운영 방안을 알아봅니다.",
    created_at: "2023-08-22T00:00:00Z",
  },
  {
    image_url: "https://images.unsplash.com/photo-1558403194-611308249627?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500",
    category: "비즈니스 전략",
    tag: "파트너십",
    tag_color: "bg-amber-700/30",
    title: "성공적인 렌탈 비즈니스 파트너십 구축 방법",
    content: "렌탈 비즈니스의 성장을 위한 전략적 파트너십 구축 사례와 성공 요인을 분석합니다. 효과적인 협력 모델과 상호 이익을 창출하는 비즈니스 제휴 방안을 소개합니다.",
    created_at: "2023-07-10T00:00:00Z",
  },
];

const NewsSection = () => {
  const [, setLocation] = useLocation();
  const [newsItems, setNewsItems] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  // 선택된 뉴스와 다이얼로그 상태 관리
  const [selectedNews, setSelectedNews] = useState<News | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // 모바일 화면 감지를 위한 상태
  const [isMobile, setIsMobile] = useState(false);
  
  // 화면 크기 변경을 감지하는 useEffect
  useEffect(() => {
    // 초기 화면 크기 확인
    setIsMobile(window.innerWidth < 768);
    
    // 화면 크기 변경 이벤트 핸들러
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // 이벤트 리스너 등록
    window.addEventListener('resize', handleResize);
    
    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  useEffect(() => {
    async function fetchNews() {
      try {
        setLoading(true);
        
        // Supabase 클라이언트 확인
        if (!supabase) {
          console.error('Supabase 클라이언트가 초기화되지 않았습니다.');
          throw new Error('Supabase 클라이언트 초기화 오류');
        }
        
        // Supabase에서 활성화된 뉴스 데이터 가져오기
        const { data, error } = await supabase
          .from('news')
          .select('*')
          .eq('active', true)
          .order('created_at', { ascending: false })
          .limit(3);
        
        if (error) {
          console.error('Supabase 쿼리 오류:', error);
          throw error;
        }
        
        console.log('불러온 뉴스 데이터:', data);
        
        if (data && data.length > 0) {
          setNewsItems(data as News[]);
        } else {
          console.log('뉴스 데이터가 없어 더미 데이터를 사용합니다.');
          setNewsItems(fallbackNewsItems as News[]);
        }
      } catch (error) {
        console.error('뉴스 데이터 로딩 오류:', error);
        setError(true);
        // 에러 발생 시 더미 데이터 사용
        setNewsItems(fallbackNewsItems as News[]);
      } finally {
        setLoading(false);
      }
    }
    
    fetchNews();
  }, []);

  // 자세히 보기 클릭 핸들러
  const handleViewDetails = (newsItem: News, e: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // 다이얼로그 대신 뉴스 페이지로 이동하면서 뉴스 ID 포함
    if (newsItem.id) {
      setLocation(`/news?id=${newsItem.id}`);
    } else {
      setLocation("/news");
    }
  };
  
  return (
    <section id="news" className="py-20 dark-lighter relative overflow-hidden">
      <div className="absolute top-0 left-0 w-64 h-64 bg-primary rounded-full opacity-5 -ml-20 -mt-20"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-secondary rounded-full opacity-5 -mr-40 -mb-40"></div>
      
      <div className="container mx-auto px-4 md:px-8 relative z-10">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          className="text-center mb-16"
        >
          <motion.h2 
            variants={fadeIn("up", 0.1)}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            렌탈 <span className="text-primary">뉴스</span>
          </motion.h2>
          <motion.p 
            variants={fadeIn("up", 0.2)}
            className="text-lg text-gray-400 max-w-2xl mx-auto"
          >
            렌탈 시장의 최신 트렌드와 업계 소식을 확인하세요.
          </motion.p>
        </motion.div>
        
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
              <span className="sr-only">로딩 중...</span>
            </div>
            <p className="mt-4 text-gray-400">뉴스를 불러오는 중입니다...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-2 md:px-0 max-w-[95%] md:max-w-full mx-auto">
            {newsItems
              // 모바일 화면에서는 첫 번째 아이템(최신)만 표시, 데스크탑에서는 모두 표시
              .slice(0, isMobile ? 1 : newsItems.length)
              .map((item, index) => (
              <motion.div
                key={index}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.1 }}
                variants={fadeIn("up", 0.2 + index * 0.1)}
                className="group glass-effect rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 border border-gray-800/50 hover:border-primary/30 cursor-pointer transform hover:-translate-y-1"
                onClick={() => item.id ? setLocation(`/news?id=${item.id}`) : setLocation("/news")}
              >
                <div className="relative h-40">
                  <img 
                    src={item.image_url} 
                    alt={item.title} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // 이미지 로드 실패 시 대체 이미지 표시
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500";
                    }}
                  />
                  <div className="absolute top-4 left-4 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm text-gray-300">
                    {item.category || "렌탈뉴스"}
                  </div>
                </div>
                
                <div className="p-5">
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-gray-500 text-sm group-hover:text-primary transition-colors">
                      {formatDate(item.created_at)}
                    </p>
                    <div className="flex space-x-2">
                      {item.tag && (
                        <span className={`px-2 py-1 ${item.tag_color || "bg-primary/30"} rounded-md text-xs text-white`}>
                          {item.tag}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold mb-3 line-clamp-2 group-hover:text-primary transition-colors">{item.title}</h3>
                  
                  <p className="text-gray-400 text-base mb-6 line-clamp-3">
                    {stripHtmlTags(item.content)}
                  </p>
                  
                  <button 
                    className="inline-flex items-center text-primary hover:opacity-80 transition-colors text-base font-medium group-hover:translate-x-1 transition-transform"
                    onClick={(e) => {
                      e.stopPropagation(); // 이벤트 버블링 방지
                      handleViewDetails(item, e);
                    }}
                  >
                    자세히 보기 <ArrowRight className="ml-2 h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
        
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          variants={fadeIn("up", 0.5)}
          className="mt-12 text-center"
        >
          <Button 
            variant="outline" 
            className="px-6 py-3 dark-light rounded-lg text-white text-lg hover:bg-background transition-all hover:shadow-md hover:shadow-primary/20 border-gray-700 hover:border-primary/50"
            onClick={() => setLocation("/news")}
          >
            더 많은 뉴스 보기 <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default NewsSection;
