import { BakongKHQR, MerchantInfo, IndividualInfo, khqrData } from 'bakong-khqr';

export const generateKHQR = async (bakongId, amount, currency, orderId, merchantName) => {
  try {
    const khqr = new BakongKHQR();

    // Resolve currency enum
    const curEnum = currency?.toUpperCase() === 'KHR' ? khqrData.currency.khr : khqrData.currency.usd;

    // Create IndividualInfo
    const info = new IndividualInfo(
      bakongId || process.env.BAKONG_ACCOUNT_ID,
      merchantName || process.env.BAKONG_MERCHANT_NAME || 'ShoppingOT', 
      process.env.BAKONG_MERCHANT_CITY || 'Phnom Penh',
      {
        amount: Number(amount),
        currency: curEnum,
        storeLabel: process.env.BAKONG_STORE_LABEL || 'SITE',
        terminalLabel: process.env.BAKONG_TERMINAL_LABEL || 'WEB',
        billNumber: orderId.toString(),
        expirationTimestamp: Date.now() + 5 * 60 * 1000 // 5 minutes expiration
      }
    );

    const response = khqr.generateIndividual(info);

    if (response.status.code !== 0) {
      throw new Error('Failed to generate KHQR');
    }

    return {
      md5: response.data.md5,
      qrString: response.data.qr,
    };
  } catch (err) {
    console.error('KHQR Generation Error:', err);
    throw err;
  }
};

export const generateBakongDeepLink = async (qrString) => {
  const token = process.env.BAKONG_TOKEN;
  if (!token) {
    console.warn('BAKONG_TOKEN missing, cannot generate deep link');
    return null;
  }

  try {
    const res = await fetch('https://api-bakong.nbc.gov.kh/v1/generate_deeplink_by_qr', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        qr: qrString,
        sourceInfo: {
          appIconUrl: 'https://shoppingot.com/logo.png', // Fallback URL
          appName: 'ShoppingOT',
          appDeepLinkCallback: 'https://shoppingot.com/callback' // Fallback URL
        }
      })
    });

    const data = await res.json();
    if (data.responseCode === 0 && data.data && data.data.shortLink) {
      return data.data.shortLink;
    }
    
    console.error('[BAKONG] Deep Link API Error:', data);
    return null;
  } catch (err) {
    console.error('[BAKONG] Deep Link Fetch Error:', err);
    return null;
  }
};

export const verifyKHQRTransaction = async (md5Hash) => {
  const isMock = process.env.BAKONG_MOCK === 'true';

  if (isMock) {
    return {
      status: 1, // 1 = PENDING (simulated wait)
      message: 'Transaction Pending (Mock)',
    };
  }

  const token = process.env.BAKONG_TOKEN;
  if (!token) {
    console.error('BAKONG_TOKEN missing');
    return { status: 1, message: 'Missing Token' };
  }

  try {
    const res = await fetch('https://api-bakong.nbc.gov.kh/v1/check_transaction_by_md5', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ md5: md5Hash })
    });

    const data = await res.json();
    console.log('[BAKONG CHECK API RESPONSE]:', JSON.stringify(data, null, 2));

    if (res.status === 401 || data.responseCode == 401 || data.responseCode == 403 || data.code == 401) {
      console.error('BAKONG_TOKEN_INVALID');
      return { status: 1, message: 'Invalid Token' };
    }

    // Check if it's successful (responseCode 0 or if the transaction data object is present and has an amount)
    if (data.responseCode == 0 || data.code == 0 || (data.data && data.data.amount) || data.amount) {
      return { status: 0, message: 'Transaction Successful' };
    }

    return { status: 1, message: 'Transaction Pending' };
  } catch (err) {
    console.error('[BAKONG] API Error:', err);
    return { status: 1, message: 'API Error' };
  }
};
