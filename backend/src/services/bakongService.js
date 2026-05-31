import crypto from 'crypto';

// This is a mocked Bakong service. In production, these will call the NBC Bakong API directly.
// POST https://api-bakong.nbc.gov.kh/v1/generate_qr
// POST https://api-bakong.nbc.gov.kh/v1/check_transaction_by_md5

const generateMD5Hash = (data) => {
  return crypto.createHash('md5').update(data).digest('hex');
};

export const generateKHQR = async (bakongId, amount, currency, orderId) => {
  // MOCK: Generate a fake MD5 and fake QR string
  const md5Str = `${bakongId}-${amount}-${currency}-${orderId}-${Date.now()}`;
  const md5Hash = generateMD5Hash(md5Str);
  const qrString = `khqr://mock?id=${bakongId}&amount=${amount}&currency=${currency}&md5=${md5Hash}`;

  return {
    md5: md5Hash,
    qrString,
  };
};

export const verifyKHQRTransaction = async (md5Hash) => {
  // MOCK: Simulate a 50% chance the transaction is paid if checked after some time
  // In reality, this would hit the Bakong check_transaction_by_md5 endpoint.
  const isPaid = Math.random() > 0.5;

  return {
    status: isPaid ? 0 : 1, // 0 = SUCCESS, 1 = PENDING/FAILED
    message: isPaid ? 'Transaction Successful' : 'Transaction Pending',
  };
};
