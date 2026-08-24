import { jest } from '@jest/globals';

jest.unstable_mockModule('../src/core/firebase/f.firebase.js', () => ({
  admin: {
    auth: jest.fn().mockReturnValue({
      generatePasswordResetLink: jest.fn().mockResolvedValue('https://reset.link'),
    }),
  },
  functions: {
    onCall: jest.fn((opts) => opts?.handler || opts),
  },
}));

jest.unstable_mockModule('nodemailer', () => ({
  default: {
    createTransport: jest.fn().mockReturnValue({
      sendMail: jest.fn().mockResolvedValue({ messageId: '123' }),
    }),
  },
}));

jest.unstable_mockModule('fs', () => ({
  readFileSync: jest.fn().mockReturnValue(
    'Template content resetLink: {{resetLink}}, invitationLink: {{invitationLink}}, message: {{message}}, testTitle: {{testTitle}} adminName: {{adminName}}.'
  ),
}));

const { sendEmail } = await import('../src/https/email.js');
const nodemailerMock = await import('nodemailer');

describe('email.js -> sendEmail', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv, SMTP_HOST: 'smtp.test.com', SITE_URL: 'http://test.com' };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should send an invite email correctly', async () => {
    const data = {
      data: {
        template: 'invite',
        to: 'user@test.com',
        subject: 'You are invited',
        data: {
          message: 'Hello',
          testTitle: 'Test 1',
          testDescription: 'Desc',
          adminEmail: 'admin@test.com',
          adminName: 'Admin',
          invitationLink: 'http://test.com/testview/study-1/invite-token',
        },
      },
    };

    const res = await sendEmail(data);
    expect(res).toBe('Email sent successfully.');
    expect(nodemailerMock.default.createTransport).toHaveBeenCalled();
  });

  it('uses the study invitation link in invite emails', async () => {
    await sendEmail({
      data: {
        template: 'invite',
        to: 'user@test.com',
        subject: 'You are invited',
        data: {
          message: 'Hello',
          invitationLink: 'http://test.com/testview/study-1/invite-token',
        },
      },
    });

    const transport =
      nodemailerMock.default.createTransport.mock.results[0].value
    expect(transport.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        html: expect.stringContaining(
          'http://test.com/testview/study-1/invite-token',
        ),
      }),
    )
  });

  it('should send a password reset email correctly', async () => {
    const data = {
      data: {
        template: 'passwordReset',
        to: 'user@test.com',
        subject: 'Reset Password',
      },
    };

    const res = await sendEmail(data);
    expect(res).toBe('Email sent successfully.');
    expect(nodemailerMock.default.createTransport).toHaveBeenCalled();
  });

  it('should return error if sendMail fails', async () => {
    nodemailerMock.default.createTransport.mockReturnValueOnce({
      sendMail: jest.fn().mockRejectedValueOnce(new Error('SMTP Error')),
    });
      
    const data = {
      data: {
        template: 'invite',
        to: 'user@test.com',
        subject: 'You are invited',
        data: { message: 'Hello' },
      },
    };

    const res = await sendEmail(data);
    expect(res).toBeInstanceOf(Error);
    expect(res.message).toBe('SMTP Error');
  });
});
