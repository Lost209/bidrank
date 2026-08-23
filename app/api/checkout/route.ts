import { NextRequest, NextResponse } from "next/server";
import { createCheckoutPayment } from "@/lib/dodo";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { slug, title, tagline, description, url, category, email, amount, paymentMethod } = body;

    if (!email || !amount || amount < 1) {
      return NextResponse.json({ error: "Invalid bid details" }, { status: 400 });
    }

    const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://bidrank.vercel.app"}/project/${slug}?payment=success`;

    const paymentResult = await createCheckoutPayment({
      slug,
      title: title || slug,
      tagline,
      description,
      url: url || `https://${slug}.com`,
      category,
      email,
      amount: Number(amount),
      returnUrl,
    });

    return NextResponse.json({
      checkoutUrl: paymentResult.paymentLink,
      paymentId: paymentResult.paymentId,
      isLive: !!paymentResult.paymentLink,
      amount,
      slug,
      message: paymentResult.paymentLink ? "Dodo Checkout session generated" : "Test mode active",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Checkout creation failed" }, { status: 500 });
  }
}
