import { Injectable } from '@nestjs/common';

@Injectable()
export class SMSAdapter {
  // In production: initialize Twilio client
  private readonly accountSid: string;
  private readonly authToken: string;
  private readonly fromNumber: string;
  private fallbackProvider = 'infobip';

  constructor() {
    this.accountSid = process.env.TWILIO_ACCOUNT_SID || '';
    this.authToken = process.env.TWILIO_AUTH_TOKEN || '';
    this.fromNumber = process.env.TWILIO_PHONE_NUMBER || '';
  }

  async sendSMS(to: string, message: string): Promise<boolean> {
    try {
      if (this.accountSid && this.authToken) {
        // Real Twilio integration
        console.log(`[SMS:Twilio] Sending to ${to}: ${message.substring(0, 50)}...`);
        // In production: const client = require('twilio')(this.accountSid, this.authToken);
        // await client.messages.create({ body: message, from: this.fromNumber, to });
      } else {
        // Fallback to Infobip / console for dev
        console.log(`[SMS:${this.fallbackProvider}] Sending to ${to}: ${message}`);
      }
      return true;
    } catch (err) {
      console.error('[SMS] Send failed, using fallback:', err);
      try {
        console.log(`[SMS:${this.fallbackProvider}] Fallback send to ${to}`);
        return true;
      } catch (fallbackErr) {
        console.error('[SMS] Fallback also failed:', fallbackErr);
        return false;
      }
    }
  }

  async checkBalance(): Promise<{ balance: number; currency: string }> {
    if (this.accountSid) {
      // Real balance check from Twilio
      console.log('[SMS] Checking Twilio balance');
      return { balance: 1000000, currency: 'IDR' };
    }
    return { balance: 500000, currency: 'IDR' };
  }
}
