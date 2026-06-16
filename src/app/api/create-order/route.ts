import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

// Razorpay ko initialize kar rahe hain
const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount } = body;

    if (!amount) {
      return NextResponse.json({ error: 'Amount is required' }, { status: 400 });
    }

    // Razorpay amount ko paise mein leta hai (1 INR = 100 paise)
    const options = {
      amount: Math.round(amount * 100), 
      currency: 'INR',
      receipt: `receipt_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    };

    // Order create karna
    const order = await razorpay.orders.create(options);
    
    // Frontend ko Order ID aur Amount bhej dena
    return NextResponse.json({ orderId: order.id, amount: order.amount }, { status: 200 });

  } catch (error) {
    console.error('Razorpay Order API Error:', error);
    return NextResponse.json({ error: 'Failed to create Razorpay order' }, { status: 500 });
  }
}