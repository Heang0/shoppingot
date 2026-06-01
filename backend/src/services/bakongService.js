import { BakongKHQR, MerchantInfo, khqrData } from 'bakong-khqr';

export const generateKHQR = async (bakongId, amount, currency, orderId) => {
  try {
    const khqr = new BakongKHQR();

    // Resolve currency enum
    const curEnum = currency?.toUpperCase() === 'KHR' ? khqrData.currency.khr : khqrData.currency.usd;

    // Create MerchantInfo
    const info = new MerchantInfo(
      bakongId,
      'ShoppingOT Merchant', // Default name if not available
      'Phnom Penh',          // Default city
      Number(amount),
      curEnum,
      'Store',               // storeLabel
      'Checkout',            // terminalLabel
      orderId.toString()     // billNumber / purpose
    );

    const response = khqr.generateMerchant(info);

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

export const verifyKHQRTransaction = async (md5Hash) => {
  const isMock = process.env.BAKONG_MOCK === 'true';

  if (isMock) {
    return {
      status: 1, // 1 = PENDING (simulated wait)
      message: 'Transaction Pending (Mock)',
    };
  }

  const token = process.env.BAKONG_RELAY_TOKEN;
  if (!token) {
    console.error('BAKONG_RELAY_TOKEN missing');
    return { status: 1, message: 'Missing Token' };
  }

  try {
    const res = await fetch('https://api.bakongrelay.com/v1/check_transaction_by_md5', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ md5: md5Hash })
    });

    const data = await res.json();

    if (res.status === 401 || (data.responseCode === 1 && data.responseMessage?.includes('Unauthorized'))) {
      console.error('BAKONG_TOKEN_INVALID');
      return { status: 1, message: 'Invalid Token' };
    }

    if (data.responseCode === 0) {
      return { status: 0, message: 'Transaction Successful' };
    }

    return { status: 1, message: 'Transaction Pending' };
  } catch (err) {
    console.error('[BAKONG] API Error:', err);
    return { status: 1, message: 'API Error' };
  }
};
