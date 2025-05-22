import nodemailer from 'nodemailer';
import { FormValues } from '../types/contact';

// 이메일 전송을 위한 트랜스포터 설정
const transporter = nodemailer.createTransport({
  service: 'gmail',  // Gmail 사용. 다른 서비스 사용 시 변경
  auth: {
    user: 'dokbun2@gmail.com',
    pass: 'aexi fydq yyvd mplc'
  },
  debug: true,
  logger: true
});

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
      <hr>
      <p>* 이 이메일은 자동으로 발송되었습니다.</p>
    `;
    
    // 이메일 옵션 설정
    const mailOptions = {
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to: process.env.ADMIN_EMAIL || 'admin@rentit.co.kr', // 관리자 이메일 주소
      subject: `[렌잇] 새로운 상담 신청 - ${name}님`,
      html: emailContent,
    };
    
    // 이메일 전송
    const info = await transporter.sendMail(mailOptions);
    console.log('상담 신청 알림 이메일이 전송되었습니다:', info.messageId);
    
    return true;
  } catch (error) {
    console.error('이메일 전송 중 오류가 발생했습니다:', error);
    return false;
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
      from: `"렌잇 고객센터" <${process.env.EMAIL_USER || 'info@rentit.co.kr'}>`,
      to: email,
      subject: `[렌잇] ${name}님의 상담 신청이 접수되었습니다`,
      html: emailContent,
    };
    
    // 이메일 전송
    const info = await transporter.sendMail(mailOptions);
    console.log('고객 확인 이메일이 전송되었습니다:', info.messageId);
    
    return true;
  } catch (error) {
    console.error('확인 이메일 전송 중 오류가 발생했습니다:', error);
    return false;
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
    service: transporter.options.service,
    auth: {
      user: transporter.options.auth?.user,
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
    console.log('이메일 전송 시도...');
    const info = await transporter.sendMail(mailOptions);
    console.log('이메일 전송 성공:', info);
    return info;
  } catch (error) {
    console.error('이메일 전송 중 상세 오류:', error);
    throw error;
  }
} 