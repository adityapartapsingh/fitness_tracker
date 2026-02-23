const webpush = require('web-push');

// Configure VAPID keys from environment
const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const contactEmail = process.env.EMAIL_FROM || 'mailto:no-reply@fitness-tracker.com';

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(contactEmail, vapidPublicKey, vapidPrivateKey);
} else {
  console.warn('⚠️ VAPID keys not set. Push notifications will not work until VAPID keys are configured.');
}

const sendPush = async (subscription, payload) => {
  try {
    if (!vapidPublicKey || !vapidPrivateKey) {
      throw new Error('VAPID keys not configured');
    }

    const result = await webpush.sendNotification(subscription, JSON.stringify(payload));
    return { success: true, result };
  } catch (err) {
    // Some errors are expected when subscription is expired/invalid
    console.error('Push send failed:', err && err.message ? err.message : err);
    throw err;
  }
};

module.exports = { sendPush };
