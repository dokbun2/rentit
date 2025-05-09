import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

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
      setProgress(0);
      
      // 파일명 생성 (중복 방지를 위해 타임스탬프 추가)
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;
      
      // Supabase Storage에 업로드
      const { error: uploadError } = await supabase.storage
        .from('rentit-media')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          onUploadProgress: (progress) => {
            const percent = Math.round((progress.loaded / progress.total) * 100);
            setProgress(percent);
          }
        });
      
      if (uploadError) throw uploadError;
      
      // 업로드된 이미지의 공개 URL 가져오기
      const { data } = supabase.storage
        .from('rentit-media')
        .getPublicUrl(filePath);
      
      // 콜백 함수 호출
      onUploadComplete(data.publicUrl);
    } catch (err: any) {
      console.error('이미지 업로드 오류:', err);
      setError(err.message || '이미지 업로드 중 오류가 발생했습니다.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mb-4">
      <div className="flex items-center space-x-3">
        <label
          htmlFor="file-upload"
          className="cursor-pointer rounded-md bg-gray-100 px-3 py-2 text-sm font-medium hover:bg-gray-200"
        >
          이미지 선택
        </label>
        <input
          id="file-upload"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading}
          className="hidden"
        />
        {uploading && (
          <div className="flex items-center space-x-2">
            <div className="h-2 w-24 rounded-full bg-gray-200">
              <div
                className="h-2 rounded-full bg-primary-dark"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <span className="text-xs text-gray-500">{progress}%</span>
          </div>
        )}
      </div>
      
      {error && (
        <p className="mt-2 text-xs text-red-500">{error}</p>
      )}
    </div>
  );
} 