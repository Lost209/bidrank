export async function sendTelegramAdminAlert(project: {
  slug: string;
  title: string;
  url: string;
  email: string;
  amount: number;
  rank: number;
}) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID;

  if (!botToken || !chatId) {
    console.log("[Telegram Alert Mock] New bid on", project.title, `+$${project.amount}. Rank: #${project.rank}`);
    return;
  }

  const text = `
🚨 *NEW BID SUBMITTED ON BIDRANK!*

👑 *Project:* ${project.title}
📊 *Current Rank:* #${project.rank}
💰 *Bid Amount:* $${project.amount} USD
🔗 *URL:* ${project.url}
✉️ *Founder Email:* ${project.email}
🆔 *Slug:* \`${project.slug}\`
  `.trim();

  try {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "Markdown",
      }),
    });
  } catch (error) {
    console.error("[Telegram Error]", error);
  }
}
