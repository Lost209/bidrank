import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { store } from "@/lib/store";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-dodo-signature") || req.headers.get("webhook-signature");
    const webhookSecret = process.env.DODO_WEBHOOK_SECRET;

    // Verify signature if secret is provided in production
    if (webhookSecret && signature) {
      const expectedSig = crypto
        .createHmac("sha256", webhookSecret)
        .update(rawBody)
        .digest("hex");

      if (signature !== expectedSig) {
        return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
      }
    }

    const payload = JSON.parse(rawBody);

    if (payload.type === "payment.succeeded" || payload.event === "payment.succeeded") {
      const data = payload.data || payload;
      const metadata = data.metadata || {};
      const amountUsd = data.amount ? data.amount / 100 : Number(data.total_amount_usd) || 10;

      const result = store.processBid({
        slug: metadata.slug,
        title: metadata.title,
        tagline: metadata.tagline,
        description: metadata.description,
        url: metadata.url,
        category: metadata.category || "SaaS",
        email: metadata.email || data.customer_email,
        amount: amountUsd,
        paymentId: data.payment_id || data.id || `wh_${Date.now()}`,
        paymentGateway: "dodo_payments",
      });

      console.log(`[Dodo Webhook] Processed bid for ${metadata.slug}: +$${amountUsd}. New rank: #${result.newRank}`);

      return NextResponse.json({
        success: true,
        rank: result.newRank,
        outbidCount: result.outbidProjects.length,
      });
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("[Webhook Error]", error);
    return NextResponse.json({ error: error.message || "Webhook processing failed" }, { status: 500 });
  }
}
