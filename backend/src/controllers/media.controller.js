const { query } = require('../db/pool');
const { AppError } = require('../middlewares/error.middleware');

/**
 * POST /api/products/:id/media
 * [FOURNISSEUR] Upload d'images/videos pour un produit.
 * Le fichier doit etre envoye en multipart/form-data sous le champ "file".
 */
async function uploadProductMedia(req, res, next) {
  try {
    const { id } = req.params;

    const product = await query('SELECT id, supplier_id FROM products WHERE id = $1', [id]);
    if (product.rowCount === 0) {
      throw new AppError('Produit introuvable.', 404);
    }
    if (product.rows[0].supplier_id !== req.user.id) {
      throw new AppError('Acces non autorise a ce produit.', 403);
    }

    if (!req.file) {
      throw new AppError('Aucun fichier recu.', 400);
    }

    const type = req.file.mimetype.startsWith('video') ? 'video' : 'image';
    const url = `/uploads/${req.file.filename}`;

    const orderResult = await query('SELECT COALESCE(MAX(ordre_affichage), -1) + 1 AS next_order FROM product_media WHERE product_id = $1', [id]);
    const nextOrder = orderResult.rows[0].next_order;

    const result = await query(
      `INSERT INTO product_media (product_id, type, url, ordre_affichage) VALUES ($1, $2, $3, $4) RETURNING *`,
      [id, type, url, nextOrder]
    );

    res.status(201).json({ success: true, message: 'Media ajoute.', data: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/products/:id/media/:mediaId
 * [FOURNISSEUR] Retire un media d'un produit.
 */
async function deleteProductMedia(req, res, next) {
  try {
    const { id, mediaId } = req.params;
    const product = await query('SELECT supplier_id FROM products WHERE id = $1', [id]);
    if (product.rowCount === 0 || product.rows[0].supplier_id !== req.user.id) {
      throw new AppError('Acces non autorise.', 403);
    }
    const result = await query('DELETE FROM product_media WHERE id = $1 AND product_id = $2 RETURNING id', [mediaId, id]);
    if (result.rowCount === 0) {
      throw new AppError('Media introuvable.', 404);
    }
    res.json({ success: true, message: 'Media supprime.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { uploadProductMedia, deleteProductMedia };
