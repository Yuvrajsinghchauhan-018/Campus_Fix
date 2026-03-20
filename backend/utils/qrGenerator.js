const QRCode = require('qrcode');

exports.generateQR = async (roomNumber, block, floor) => {
  try {
    const dataString = JSON.stringify({ roomNumber, block, floor });
    const qrImage = await QRCode.toDataURL(dataString);
    return qrImage;
  } catch (error) {
    console.error('QR Generate Error:', error);
    return null;
  }
};
