import { useState } from "react";
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

// 뉴스 타입 정의
type News = {
  id: string;
  title: string;
  category: string;
  publishDate: string;
  status: string;
  content: string;
};

export default function NewsManagement() {
  // 뉴스 데이터 목업
  const [news, setNews] = useState<News[]>([
    {
      id: "123",
      title: "123",
      category: "123",
      publishDate: "2025-05-09",
      status: "비활성",
      content: "뉴스 본문 내용이 여기에 표시됩니다. 자세한 내용은 클릭하여 확인하세요."
    },
    {
      id: "124",
      title: "새로운 서비스 출시 안내",
      category: "공지사항",
      publishDate: "2025-05-10",
      status: "활성화",
      content: "저희 회사에서 새로운 서비스를 출시하게 되었습니다. 많은 관심 부탁드립니다."
    },
    {
      id: "125",
      title: "시스템 점검 안내",
      category: "점검",
      publishDate: "2025-05-11",
      status: "활성화",
      content: "시스템 점검으로, 2025년 5월 15일 오전 2시부터 4시까지 서비스 이용이 제한됩니다."
    },
    {
      id: "126",
      title: "이벤트 안내",
      category: "이벤트",
      publishDate: "2025-05-12",
      status: "활성화",
      content: "여름 맞이 특별 이벤트가 진행됩니다. 다양한 혜택을 확인해보세요."
    },
    {
      id: "127",
      title: "업데이트 안내",
      category: "업데이트",
      publishDate: "2025-05-13",
      status: "활성화",
      content: "서비스 개선을 위한 업데이트가 진행되었습니다. 주요 변경 사항을 확인하세요."
    }
  ]);

  // 뉴스 삭제 함수
  const handleDelete = (id: string) => {
    setNews(news.filter(item => item.id !== id));
  };

  // 상세 내용 다이얼로그를 위한 상태
  const [selectedNews, setSelectedNews] = useState<News | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // 뉴스 카드 클릭 핸들러
  const handleCardClick = (newsItem: News) => {
    setSelectedNews(newsItem);
    setDialogOpen(true);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">뉴스 목록</h1>
        <Button>새 뉴스 작성</Button>
      </div>

      {/* 뉴스 카드 그리드 - 한 줄에 4개 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {news.map((item) => (
          <Card key={item.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleCardClick(item)}>
            <CardHeader>
              <CardTitle>{item.title}</CardTitle>
              <CardDescription>{item.category}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="truncate">{item.content}</p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-gray-500">{item.publishDate}</div>
              <div className={`text-sm ${item.status === '활성화' ? 'text-green-500' : 'text-gray-500'}`}>
                {item.status}
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* 뉴스 상세 내용 다이얼로그 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        {selectedNews && (
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{selectedNews.title}</DialogTitle>
              <DialogDescription>
                카테고리: {selectedNews.category} | 발행일: {selectedNews.publishDate} | 상태: {selectedNews.status}
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4">
              <h3 className="font-semibold mb-2">본문 내용:</h3>
              <p className="whitespace-pre-line">{selectedNews.content}</p>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline">수정</Button>
              <Button variant="destructive" onClick={() => {
                handleDelete(selectedNews.id);
                setDialogOpen(false);
              }}>삭제</Button>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
} 