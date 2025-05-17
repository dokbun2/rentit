import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Loader2, Upload } from 'lucide-react';
import { Button } from './ui/button';

interface ImageUploaderProps {
  onUploadComplete: (url: string) => void;
  folder?: string;
}

export default function ImageUploader({ onUploadComplete, folder = 'news' }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setError('');
      const file = event.target.files?.[0];
      
      if (!file) return;
      
      // 이미지 파일인지 확인
      if (!file.type.startsWith('image/')) {
        setError('이미지 파일만 업로드할 수 있습니다.');
        return;
      }
      
      // 파일 크기 제한 (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('파일 크기는 5MB 이하여야 합니다.');
        return;
      }
      
      setUploading(true);
      setProgress(10); // 시작 진행률
      
      // 진행률 표시 시뮬레이션
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 300);
      
      // 이미지 데이터를 base64로 변환하여 직접 사용
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (event.target && event.target.result) {
          // base64 데이터 URL로 이미지 설정
          const imageDataUrl = event.target.result.toString();
          
          // 진행률 업데이트
          clearInterval(progressInterval);
          setProgress(100);
          
          // 콜백 함수 호출
          onUploadComplete(imageDataUrl);
          console.log('이미지 데이터 URL 생성 완료');
          
          // 업로드 상태 완료로 설정
          setTimeout(() => {
            setUploading(false);
          }, 500);
        }
      };
      
      // 파일 읽기 시작
      reader.readAsDataURL(file);
      
    } catch (err: any) {
      console.error('이미지 업로드 오류:', err);
      setError(err.message || '이미지 업로드 중 오류가 발생했습니다.');
      setUploading(false);
    }
  };

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1">
        <label className="text-sm font-medium text-gray-300">이미지</label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => document.getElementById('file-upload')?.click()}
          className="flex items-center gap-2 h-8 px-3"
          disabled={uploading}
        >
          {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
          {uploading ? `업로드 중 (${progress}%)` : '이미지 업로드'}
        </Button>
      </div>
      <input
        id="file-upload"
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={uploading}
        className="hidden"
      />
      
      {error && (
        <p className="mt-2 text-xs text-red-500">{error}</p>
      )}
      
      {uploading && (
        <div className="mt-2">
          <div className="h-2 w-full rounded-full bg-gray-200">
            <div
              className="h-2 rounded-full bg-primary-dark"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
} 