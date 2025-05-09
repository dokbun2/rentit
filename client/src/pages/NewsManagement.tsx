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
import { Badge } from "@/components/ui/badge";

// 뉴스 타입 정의
type News = {
  id: string;
  title: string;
  category: string;
  tag?: string;
  tagColor?: string;
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
      tag: "중요",
      tagColor: "bg-red-500",
      publishDate: "2025-05-09",
      status: "비활성",
      content: "뉴스 본문 내용이 여기에 표시됩니다. 자세한 내용은 클릭하여 확인하세요."
    },
    {
      id: "124",
      title: "새로운 서비스 출시 안내",
      category: "공지사항",
      tag: "신규",
      tagColor: "bg-blue-500",
      publishDate: "2025-05-10",
      status: "활성화",
      content: "저희 회사에서 새로운 서비스를 출시하게 되었습니다. 많은 관심 부탁드립니다."
    },
    {
      id: "125",
      title: "시스템 점검 안내",
      category: "점검",
      tag: "예정",
      tagColor: "bg-yellow-500",
      publishDate: "2025-05-11",
      status: "활성화",
      content: "시스템 점검으로, 2025년 5월 15일 오전 2시부터 4시까지 서비스 이용이 제한됩니다."
    },
    {
      id: "126",
      title: "이벤트 안내",
      category: "이벤트",
      tag: "진행중",
      tagColor: "bg-green-500",
      publishDate: "2025-05-12",
      status: "활성화",
      content: "여름 맞이 특별 이벤트가 진행됩니다. 다양한 혜택을 확인해보세요."
    },
    {
      id: "127",
      title: "업데이트 안내",
      category: "업데이트",
      tag: "완료",
      tagColor: "bg-purple-500",
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
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState<News | null>(null);

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
  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (editFormData) {
      setEditFormData({
        ...editFormData,
        [name]: value
      });
    }
  };

  // 수정 폼 저장 핸들러
  const handleEditFormSubmit = () => {
    if (editFormData) {
      setNews(news.map(item => 
        item.id === editFormData.id ? editFormData : item
      ));
      setSelectedNews(editFormData);
      setIsEditing(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">뉴스 목록</h1>
        <Button>새 뉴스 작성</Button>
      </div>

      {/* 뉴스 목록 테이블 */}
      <div className="bg-card rounded-lg border shadow-sm mb-6 overflow-hidden">
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
                        <Badge className={`${item.tagColor} text-white w-fit`}>{item.tag}</Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">{item.publishDate}</td>
                  <td className="px-4 py-3">
                    <Badge variant={item.status === '활성화' ? 'default' : 'secondary'}>
                      {item.status}
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
                    >
                      수정
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(item.id);
                      }}
                    >
                      삭제
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 뉴스 카드 그리드 - 한 줄에 4개 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {news.map((item) => (
          <Card key={item.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleCardClick(item)}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{item.title}</CardTitle>
                {item.tag && (
                  <Badge className={`${item.tagColor} text-white`}>{item.tag}</Badge>
                )}
              </div>
              <CardDescription>{item.category}</CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <p className="truncate text-sm">{item.content}</p>
            </CardContent>
            <CardFooter className="flex justify-between pt-0">
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
        {isEditing && editFormData ? (
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>뉴스 수정</DialogTitle>
              <DialogDescription>
                아래 양식을 작성하여 뉴스를 수정하세요.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">제목</label>
                <input
                  type="text"
                  name="title"
                  value={editFormData.title}
                  onChange={handleEditFormChange}
                  className="w-full rounded-md border p-2 text-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">카테고리</label>
                <input
                  type="text"
                  name="category"
                  value={editFormData.category}
                  onChange={handleEditFormChange}
                  className="w-full rounded-md border p-2 text-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">태그</label>
                <input
                  type="text"
                  name="tag"
                  value={editFormData.tag || ''}
                  onChange={handleEditFormChange}
                  className="w-full rounded-md border p-2 text-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">발행일</label>
                <input
                  type="text"
                  name="publishDate"
                  value={editFormData.publishDate}
                  onChange={handleEditFormChange}
                  className="w-full rounded-md border p-2 text-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">상태</label>
                <select
                  name="status"
                  value={editFormData.status}
                  onChange={(e) => handleEditFormChange(e as any)}
                  className="w-full rounded-md border p-2 text-black"
                >
                  <option value="활성화">활성화</option>
                  <option value="비활성">비활성</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">내용</label>
                <textarea
                  name="content"
                  value={editFormData.content}
                  onChange={handleEditFormChange}
                  rows={5}
                  className="w-full rounded-md border p-2 text-black"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setIsEditing(false)} className="bg-white text-black hover:bg-gray-100">취소</Button>
              <Button onClick={handleEditFormSubmit} className="bg-gradient-to-r from-primary to-purple-500 text-white">저장</Button>
            </div>
          </DialogContent>
        ) : selectedNews && (
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <div className="flex justify-between items-center">
                <DialogTitle>{selectedNews.title}</DialogTitle>
                {selectedNews.tag && (
                  <Badge className={`${selectedNews.tagColor} text-white`}>{selectedNews.tag}</Badge>
                )}
              </div>
              <DialogDescription>
                카테고리: {selectedNews.category} | 발행일: {selectedNews.publishDate} | 상태: {selectedNews.status}
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4">
              <h3 className="font-semibold mb-2">본문 내용:</h3>
              <p className="whitespace-pre-line">{selectedNews.content}</p>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={handleEditClick}>수정</Button>
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