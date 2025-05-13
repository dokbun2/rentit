// kakaoSDK.ts
declare global {
  interface Window {
    Kakao: any;
  }
}

export const initKakaoSDK = () => {
  if (typeof window !== 'undefined' && window.Kakao) {
    if (!window.Kakao.isInitialized()) {
      window.Kakao.init('9a9811c07e2b6578eaa1fecbbf84f915');
      console.log('카카오 SDK 초기화 완료');
    }
  }
};

export const isKakaoSDKInitialized = () => {
  return typeof window !== 'undefined' && window.Kakao && window.Kakao.isInitialized();
}; 