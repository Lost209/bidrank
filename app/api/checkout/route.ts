import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { slug, title, tagline, description, url, category, email, amount, paymentMethod } = body;

    if (!email || !amount || amount < 1) {
      return NextResponse.json({ error: "Invalid bid details" }, { status: 400 });
    }

    const dodoApiKey = process.env.DODO_PAYMENTS_API_KEY;
    const isLiveGateway = !!dodoApiKey;

    if (isLiveGateway) {
      // Production Dodo Payments API Integration
      const dodoResponse = await fetch("https://api.dodopayments.com/v1/checkouts", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${dodoApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // convert to cents
          currency: "USD",
          customer: { email },
          metadata: {
            slug,
            title,
            tagline,
            description,
            url,
            category,
            email,
          },
          return_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/project/${slug}?payment=success`,
        }),
      });

      const session = await dodoResponse.json();
      return NextResponse.json({
        checkoutUrl: session.url || session.checkout_url,
        sessionId: session.id,
        isLive: true,
      });
    }

    // Sandbox / Test Simulator Mode
    // Generates a mock payment ID and enables instant UPI / Card simulator
    const mockPaymentId = `dodo_test_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    return NextResponse.json({
      checkoutUrl: null,
      sessionId: mockPaymentId,
      isLive: false,
      amount,
      slug,
      message: "Test simulation mode active",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Checkout creation failed" }, { status: 500 });
  }
}
