import { DodoPayments } from "dodopayments";

const dodoApiKey = process.env.DODO_PAYMENTS_API_KEY || "P9uR2PnAb1wnBFEI.iPed6VuQjF_gknUixerwxHmjL66NfmCxBP2DC_8Jo455KiFw";
const isTestMode = !process.env.DODO_PAYMENTS_MODE || process.env.DODO_PAYMENTS_MODE === "test_mode" || dodoApiKey.startsWith("P9uR");

export const dodoClient = new DodoPayments({
  bearerToken: dodoApiKey,
  environment: isTestMode ? "test_mode" : "live_mode",
});

export async function createCheckoutPayment(params: {
  slug: string;
  title: string;
  tagline?: string;
  description?: string;
  url: string;
  category?: string;
  email: string;
  amount: number;
  returnUrl?: string;
}) {
  try {
    const payment = await dodoClient.payments.create({
      billing: {
        city: "San Francisco",
        country: "US",
        state: "CA",
        street: "Market St",
        zipcode: "94103",
      },
      customer: {
        email: params.email,
        name: params.title || params.slug,
      },
      payment_link: true,
      product_cart: [
        {
          product_id: "p_bidrank_listing",
          quantity: 1,
          amount: Math.round(params.amount * 100), // convert to cents
        },
      ],
      return_url: params.returnUrl || `${process.env.NEXT_PUBLIC_APP_URL || "https://bidrank.vercel.app"}/project/${params.slug}?payment=success`,
      metadata: {
        slug: params.slug,
        title: params.title,
        tagline: params.tagline || "",
        description: params.description || "",
        url: params.url,
        category: params.category || "SaaS",
        email: params.email,
      },
    });

    return {
      paymentId: payment.payment_id,
      paymentLink: payment.payment_link,
      clientSecret: payment.client_secret,
    };
  } catch (error: any) {
    // If product cart or standard dynamic payment fallback is required:
    console.log("[Dodo Fallback Mode]", error?.message || error);
    return {
      paymentId: `dodo_test_${Date.now()}`,
      paymentLink: null,
      error: error?.message,
    };
  }
}
