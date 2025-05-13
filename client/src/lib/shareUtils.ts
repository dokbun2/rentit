import { isKakaoSDKInitialized, initKakaoSDK } from './kakaoSDK';

type ShareContent = {
  title: string;
  description: string;
  imageUrl: string;
  url: string;
};

// 기본 공유 콘텐츠 설정
const defaultContent: ShareContent = {
  title: '렌잇(REN\'T) - 전문적인 렌탈 비즈니스 컨설팅',
  description: '렌탈사 설립부터 시스템 구축, 부업 컨설팅까지 렌탈 비즈니스의 모든 것을 도와드립니다.',
  imageUrl: 'https://renit.dokbun2.com/imgs/sns.jpg',
  url: 'https://renit.dokbun2.com'
};

// 카카오톡 공유
export const shareKakao = (content: Partial<ShareContent> = {}) => {
  const shareContent = { ...defaultContent, ...content };
  
  if (typeof window === 'undefined') return;
  
  if (!isKakaoSDKInitialized()) {
    initKakaoSDK();
  }
  
  if (window.Kakao && window.Kakao.isInitialized()) {
    try {
      window.Kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
          title: shareContent.title,
          description: shareContent.description,
          imageUrl: shareContent.imageUrl,
          link: {
            mobileWebUrl: shareContent.url,
            webUrl: shareContent.url
          }
        },
        buttons: [
          {
            title: '웹으로 보기',
            link: {
              mobileWebUrl: shareContent.url,
              webUrl: shareContent.url
            }
          }
        ],
        // 소셜 메타태그 강제 활성화
        serverCallbackArgs: {
          force_social_metadata: 'true'
        }
      });
    } catch (error) {
      console.error('카카오 공유 실패:', error);
      // 대체 공유 방법 (모바일에서 작동)
      const kakaoLinkUrl = `https://sharer.kakao.com/talk/friends/picker/link?app_key=${window.Kakao.getAppKey()}&text=${encodeURIComponent(shareContent.title)}&link_ver=4.0&template_id=feed`;
      window.open(kakaoLinkUrl, '_blank', 'width=600,height=400');
    }
  } else {
    console.error('카카오 SDK가 초기화되지 않았습니다.');
    alert('카카오 공유 기능을 사용할 수 없습니다. 다른 방법으로 공유해주세요.');
  }
};

// 페이스북 공유
export const shareFacebook = (content: Partial<ShareContent> = {}) => {
  const shareContent = { ...defaultContent, ...content };
  // 메타 태그 강제 활성화 파라미터 추가
  const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareContent.url)}&display=popup&ref=plugin&src=share_button`;
  window.open(url, '_blank', 'width=600,height=400');
};

// 트위터 공유
export const shareTwitter = (content: Partial<ShareContent> = {}) => {
  const shareContent = { ...defaultContent, ...content };
  // 타이틀과 URL 모두 포함
  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareContent.title)}&url=${encodeURIComponent(shareContent.url)}&via=renit`;
  window.open(url, '_blank', 'width=600,height=400');
};

// 링크 복사
export const copyLinkToClipboard = (url: string = defaultContent.url) => {
  navigator.clipboard.writeText(url)
    .then(() => {
      alert('링크가 클립보드에 복사되었습니다.');
    })
    .catch(err => {
      console.error('링크 복사 실패:', err);
      // 대체 방법
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('링크가 클립보드에 복사되었습니다.');
    });
}; 