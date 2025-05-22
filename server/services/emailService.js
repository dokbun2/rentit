"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testEmailService = exports.sendConfirmationEmail = exports.sendContactNotification = exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
// Gmail 설정
const GMAIL_USER = 'ggamsire@gmail.com';
const GMAIL_PASSWORD = 'oerg svup hvto snts';
const ADMIN_EMAIL = 'dokbun2@gmail.com';
// 이메일 전송을 위한 트랜스포터 설정
const transporter = nodemailer_1.default.createTransport({
    service: 'gmail',
    auth: {
        user: GMAIL_USER,
        pass: GMAIL_PASSWORD
    }
});
// 이메일 전송 함수
const sendEmail = async (to, subject, html) => {
    try {
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
    }
    catch (error) {
        console.error('이메일 전송 실패:', error);
        throw new Error(`이메일 전송 실패: ${error.message}`);
    }
};
exports.sendEmail = sendEmail;
// 관리자에게 상담 신청 알림 보내기
const sendContactNotification = async (formData) => {
    const { name, phone, email, service, message } = formData;
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
    return (0, exports.sendEmail)(ADMIN_EMAIL, `[렌잇] 새로운 상담 신청 - ${name}님`, emailContent);
};
exports.sendContactNotification = sendContactNotification;
// 고객에게 상담 신청 접수 확인 이메일 보내기
const sendConfirmationEmail = async (formData) => {
    const { name, email, service } = formData;
    const emailContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #8b5cf6;">렌잇 상담 신청이 접수되었습니다</h2>
      <p>${name}님, 상담 신청해 주셔서 감사합니다.</p>
      <p>귀하의 <strong>${service}</strong> 관련 문의가 성공적으로 접수되었습니다.</p>
      <p>영업일 기준 1-2일 내에 담당자가 연락드릴 예정입니다.</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="color: #666; font-size: 14px;">
        추가 문의사항이 있으시면 언제든지 <a href="mailto:ceo@rnpick.co.kr" style="color: #8b5cf6;">ceo@rnpick.co.kr</a>로 연락주세요.
      </p>
      <div style="margin-top: 30px; text-align: center; color: #888; font-size: 12px;">
        <p>© 2025 렌잇. 모든 권리 보유.</p>
        <p>서울 성동구 아차산로17길 49(성수동2가) 15층 1504호</p>
      </div>
    </div>
  `;
    return (0, exports.sendEmail)(email, `[렌잇] ${name}님의 상담 신청이 접수되었습니다`, emailContent);
};
exports.sendConfirmationEmail = sendConfirmationEmail;
// 테스트 함수
const testEmailService = async () => {
    const testData = {
        name: "테스트",
        phone: "010-1234-5678",
        email: "test@example.com",
        service: "테스트 서비스",
        message: "테스트 메시지"
    };
    try {
        // 관리자 알림 이메일 전송
        await (0, exports.sendContactNotification)(testData);
        console.log("관리자 알림 이메일 전송 성공");
        // 고객 확인 이메일 전송
        await (0, exports.sendConfirmationEmail)({
            name: testData.name,
            email: testData.email,
            service: testData.service
        });
        console.log("고객 확인 이메일 전송 성공");
        return true;
    }
    catch (error) {
        console.error("이메일 전송 테스트 실패:", error);
        return false;
    }
};
exports.testEmailService = testEmailService;
