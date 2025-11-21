const logger = require('../utils/logger');

class NotificationService {
  /**
   * Send email notification (placeholder - integrate with your email service)
   */
  static async sendEmail({ to, subject, body }) {
    try {
      // TODO: Integrate with email service (SendGrid, AWS SES, etc.)
      logger.info(`Email notification sent to ${to}: ${subject}`);
      
      // For now, just log
      return {
        success: true,
        message: 'Email sent',
      };
    } catch (error) {
      logger.error('Error sending email:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Send SMS notification (placeholder)
   */
  static async sendSMS({ to, message }) {
    try {
      // TODO: Integrate with SMS service (Twilio, AWS SNS, etc.)
      logger.info(`SMS sent to ${to}: ${message}`);
      
      return {
        success: true,
        message: 'SMS sent',
      };
    } catch (error) {
      logger.error('Error sending SMS:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Notify user of new transfer received
   */
  static async notifyTransferReceived({ email, amount, senderWallet }) {
    const subject = 'You received a transfer on RemitEasy';
    const body = `
      You have received a transfer of $${amount} USDC from ${senderWallet}.
      
      Log in to RemitEasy to view and claim your funds.
    `;

    return await this.sendEmail({ to: email, subject, body });
  }

  /**
   * Notify user of transfer completed
   */
  static async notifyTransferCompleted({ email, amount, recipientWallet, signature }) {
    const subject = 'Your transfer was completed';
    const body = `
      Your transfer of $${amount} USDC to ${recipientWallet} was successfully completed.
      
      Transaction signature: ${signature}
      
      View on Solana Explorer: https://explorer.solana.com/tx/${signature}
    `;

    return await this.sendEmail({ to: email, subject, body });
  }

  /**
   * Notify user of transfer failed
   */
  static async notifyTransferFailed({ email, amount, recipientWallet, reason }) {
    const subject = 'Your transfer failed';
    const body = `
      Your transfer of $${amount} USDC to ${recipientWallet} failed.
      
      Reason: ${reason}
      
      Please try again or contact support if the issue persists.
    `;

    return await this.sendEmail({ to: email, subject, body });
  }

  /**
   * Send welcome email to new user
   */
  static async sendWelcomeEmail({ email, name }) {
    const subject = 'Welcome to RemitEasy!';
    const body = `
      Hi${name ? ` ${name}` : ''},
      
      Welcome to RemitEasy! We're excited to help you send money across borders instantly and affordably.
      
      Get started by connecting your Solana wallet and making your first transfer.
      
      If you have any questions, feel free to reach out to our support team.
      
      Best regards,
      The RemitEasy Team
    `;

    return await this.sendEmail({ to: email, subject, body });
  }
}

module.exports = NotificationService;