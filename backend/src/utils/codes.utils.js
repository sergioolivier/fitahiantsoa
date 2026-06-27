const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');

/**
 * Genere un numero de commande lisible et unique.
 * Format : FTH-YYYYMMDD-XXXXXX
 */
function generateOrderNumber() {
  const date = new Date();
  const datePart = date.toISOString().slice(0, 10).replace(/-/g, '');
  const randomPart = Math.floor(100000 + Math.random() * 900000);
  return `FTH-${datePart}-${randomPart}`;
}

/**
 * Genere un code-barres numerique unique de 12 chiffres (type EAN-like).
 */
function generateBarcode() {
  let code = '';
  for (let i = 0; i < 12; i++) {
    code += Math.floor(Math.random() * 10);
  }
  return code;
}

/**
 * Genere un code de confirmation court (6 caracteres alphanumeriques)
 * utilise par le client pour confirmer la reception d'une livraison.
 */
function generateConfirmationCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sans caracteres ambigus (0,O,1,I)
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

/**
 * Genere les donnees QR Code (en base64 data URL) pour un produit.
 * Le QR contient un identifiant unique exploitable par le scanner cote client.
 */
async function generateProductQrCode(productId) {
  const payload = JSON.stringify({ type: 'product', id: productId, source: 'fitahiantsoa' });
  const dataUrl = await QRCode.toDataURL(payload, { width: 300, margin: 1 });
  return { payload, dataUrl };
}

module.exports = {
  generateOrderNumber,
  generateBarcode,
  generateConfirmationCode,
  generateProductQrCode,
  uuidv4,
};
