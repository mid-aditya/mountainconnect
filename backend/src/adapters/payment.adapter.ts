import { Injectable } from '@nestjs/common';

export interface PaymentTransaction {
  orderId: string;
  amount: number;
  customer: { name: string; email: string; phone?: string };
}

export interface PaymentResult {
  transactionId: string;
  status: 'pending' | 'settled' | 'failed' | 'refunded';
  paymentUrl?: string;
  paymentMethod?: string;
  paidAt?: string;
}

export interface PaymentStatusResult {
  orderId: string;
  status: 'pending' | 'settled' | 'failed' | 'refunded';
  amount: number;
  paidAmount?: number;
  paidAt?: string;
}

@Injectable()
export class PaymentAdapter {
  // In production: replace with actual Midtrans/Xendit SDK
  private readonly provider: 'midtrans' | 'xendit';

  constructor() {
    this.provider = (process.env.PAYMENT_PROVIDER as any) || 'midtrans';
  }

  async createTransaction(data: PaymentTransaction): Promise<PaymentResult> {
    try {
      console.log(`[Payment:${this.provider}] Creating transaction ${data.orderId} for ${data.amount}`);
      // Placeholder: API call to Midtrans/Xendit
      return {
        transactionId: `trx-${Date.now()}`,
        status: 'pending',
        paymentUrl: `https://payment.example.com/${data.orderId}`,
        paymentMethod: 'bank_transfer',
      };
    } catch (err) {
      console.error('[Payment] Transaction creation failed:', err);
      throw new Error('Payment processing failed');
    }
  }

  async getStatus(orderId: string): Promise<PaymentStatusResult> {
    try {
      console.log(`[Payment:${this.provider}] Checking status for ${orderId}`);
      // Placeholder: API call
      return {
        orderId,
        status: 'settled',
        amount: 0,
      };
    } catch (err) {
      console.error('[Payment] Status check failed:', err);
      throw new Error('Payment status check failed');
    }
  }

  async refund(orderId: string): Promise<PaymentResult> {
    try {
      console.log(`[Payment:${this.provider}] Refunding ${orderId}`);
      return {
        transactionId: `ref-${Date.now()}`,
        status: 'refunded',
      };
    } catch (err) {
      console.error('[Payment] Refund failed:', err);
      throw new Error('Refund processing failed');
    }
  }
}
