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
      ]
    });
  } else {
    console.error('카카오 SDK가 초기화되지 않았습니다.');
  }
};

// 페이스북 공유
export const shareFacebook = (content: Partial<ShareContent> = {}) => {
  const shareContent = { ...defaultContent, ...content };
  const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareContent.url)}`;
  window.open(url, '_blank', 'width=600,height=400');
};

// 트위터 공유
export const shareTwitter = (content: Partial<ShareContent> = {}) => {
  const shareContent = { ...defaultContent, ...content };
  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareContent.title)}&url=${encodeURIComponent(shareContent.url)}`;
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
    });
}; 