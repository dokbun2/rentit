import nodemailer from 'nodemailer';
import { FormValues } from '../types/contact';

<<<<<<< HEAD
=======
// 서비스 값과 한글 라벨 매핑
const serviceMap: { [key: string]: string } = {
  establishment: "렌탈사 설립",
  partnership: "렌탈업무 제휴",
  system: "렌탈시스템 구축",
  parttime: "렌탈 부업",
  other: "기타",
};

// 서비스 값을 한글 라벨로 변환하는 함수
const getServiceLabel = (serviceValue: string): string => {
  return serviceMap[serviceValue] || serviceValue; // 매핑되지 않은 값은 그대로 반환
};

>>>>>>> parent of 8e693e8 (11)
// Gmail 설정
const GMAIL_USER = 'ggamsire@gmail.com';
const GMAIL_PASSWORD = 'oerg svup hvto snts';
const ADMIN_EMAIL = 'dokbun2@gmail.com';

// 이메일 전송을 위한 트랜스포터 설정
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // TLS
  auth: {
    user: 'ggamsire@gmail.com',
    pass: 'oerg svup hvto snts'
  },
  debug: true, // 디버그 모드 활성화
  logger: true  // 로깅 활성화
});

// 이메일 전송 함수
export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    // SMTP 연결 테스트
    await transporter.verify();
    console.log('SMTP 서버 연결 성공!');

    const mailOptions = {
      from: `"렌잇 고객센터" <${GMAIL_USER}>`,
      to,
      subject,
      html
    };

    console.log('이메일 전송 시도...', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject
    });

    const info = await transporter.sendMail(mailOptions);
    console.log('이메일 전송 성공:', info.messageId);
    return true;
  } catch (error: any) {
    console.error('이메일 전송 실패:', error);
    throw new Error(`이메일 전송 실패: ${error.message}`);
  }
};

// 관리자에게 상담 신청 알림 보내기
export const sendContactNotification = async (formData: FormValues): Promise<boolean> => {
  try {
    const { name, phone, email, service, message } = formData;
    
    // 이메일 본문 구성
    const emailContent = `
      <h2>새로운 상담 신청이 접수되었습니다</h2>
      <p><strong>이름:</strong> ${name}</p>
      <p><strong>연락처:</strong> ${phone}</p>
      <p><strong>이메일:</strong> ${email}</p>
      <p><strong>관심 서비스:</strong> ${service}</p>
      <p><strong>문의 내용:</strong> ${message}</p>
      <p><strong>접수 시간:</strong> ${new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}</p>
      <hr>
      <p>* 이 이메일은 자동으로 발송되었습니다.</p>
    `;
    
    // 이메일 옵션 설정
    const mailOptions = {
      from: GMAIL_USER,
      to: ADMIN_EMAIL,
      subject: `[렌잇] 새로운 상담 신청 - ${name}님`,
      html: emailContent,
    };
    
    // 이메일 전송
    const info = await transporter.sendMail(mailOptions);
    console.log('상담 신청 알림 이메일이 전송되었습니다:', info.messageId);
    
    return true;
  } catch (error: any) {
    console.error('이메일 전송 중 오류가 발생했습니다:', error);
    throw new Error(`이메일 전송 실패: ${error.message}`);
  }
};

// 고객에게 상담 신청 접수 확인 이메일 보내기
export const sendConfirmationEmail = async (formData: FormValues): Promise<boolean> => {
  try {
    const { name, email, service } = formData;
    
    // 이메일 본문 구성
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #8b5cf6;">렌잇 상담 신청이 접수되었습니다</h2>
        <p>${name}님, 상담 신청해 주셔서 감사합니다.</p>
        <p>귀하의 <strong>${service}</strong> 관련 문의가 성공적으로 접수되었습니다.</p>
        <p>영업일 기준 1-2일 내에 담당자가 연락드릴 예정입니다.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #666; font-size: 14px;">
          추가 문의사항이 있으시면 언제든지 <a href="mailto:info@rentit.co.kr" style="color: #8b5cf6;">info@rentit.co.kr</a>로 연락주세요.
        </p>
        <div style="margin-top: 30px; text-align: center; color: #888; font-size: 12px;">
          <p>© 2025 렌잇. 모든 권리 보유.</p>
          <p>경기도 하남시 감일로 75번길 40 201호 렌잇빌딩 2층</p>
        </div>
      </div>
    `;
    
    // 이메일 옵션 설정
    const mailOptions = {
      from: GMAIL_USER,
      to: email,
      subject: `[렌잇] ${name}님의 상담 신청이 접수되었습니다`,
      html: emailContent,
    };
    
    // 이메일 전송
    const info = await transporter.sendMail(mailOptions);
    console.log('고객 확인 이메일이 전송되었습니다:', info.messageId);
    
    return true;
  } catch (error: any) {
    console.error('확인 이메일 전송 중 오류가 발생했습니다:', error);
    throw new Error(`확인 이메일 전송 실패: ${error.message}`);
  }
};

interface ContactData {
  name: string;
  phone: string;
  email: string;
  service: string;
  message: string;
}

// 이메일 전송 함수
export async function sendContactEmail(contactData: ContactData) {
  console.log('이메일 전송 시작...');
  console.log('Transporter 설정:', {
    service: 'gmail',
    auth: {
      user: 'dokbun2@gmail.com',
    }
  });

  const mailOptions = {
    from: 'ggamsire@gmail.com',
    to: 'dokbun2@gmail.com',
    subject: `[렌잇] 새로운 문의가 접수되었습니다 - ${contactData.name}`,
    html: `
      <h2>새로운 문의가 접수되었습니다</h2>
      <p><strong>이름:</strong> ${contactData.name}</p>
      <p><strong>연락처:</strong> ${contactData.phone}</p>
      <p><strong>이메일:</strong> ${contactData.email}</p>
      <p><strong>관심 서비스:</strong> ${contactData.service}</p>
      <p><strong>문의 내용:</strong></p>
      <p>${contactData.message}</p>
      <p><strong>접수 시간:</strong> ${new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}</p>
    `
  };

  try {
    // 관리자 알림 이메일 전송
    await sendContactNotification(testData);
    console.log("관리자 알림 이메일 전송 성공");

    // 고객 확인 이메일 전송
    await sendConfirmationEmail({
      name: testData.name,
      email: testData.email,
      service: testData.service
    });
    console.log("고객 확인 이메일 전송 성공");

    return true;
  } catch (error) {
    console.error("이메일 전송 테스트 실패:", error);
    return false;
  }
};

// 직접 실행 시 테스트 실행
if (import.meta.url === `file://${process.argv[1]}`) {
  testEmailService().then(console.log).catch(console.error);
} 