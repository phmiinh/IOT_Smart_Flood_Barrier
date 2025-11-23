/**
 * Sends a Telegram alert message using the Telegram Bot API.
 * 
 * Requires environment variables:
 * - TELEGRAM_BOT_TOKEN: Your Telegram bot token
 * - TELEGRAM_CHAT_ID: The chat ID where messages should be sent
 * 
 * @param {string} message - The message to send
 * @returns {Promise<boolean>} True if sent successfully, false otherwise
 */
export async function sendTelegramAlert(message) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.warn('Telegram credentials not configured. Skipping alert.');
    return false;
  }

  try {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Telegram API error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to send Telegram alert:', error);
    return false;
  }
}

