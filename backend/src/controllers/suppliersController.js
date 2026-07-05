import { getDatabase } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

export async function createSupplier(req, res) {
  try {
    const { businessName, contactPerson, email, phone, address, city, ruc, paymentTerms } = req.body;

    if (!businessName || !ruc) {
      return res.status(400).json({ error: 'Faltan campos requeridos (Nombre/Razón Social o RUC)' });
    }

    if (!/^\d{10}(\d{3})?$/.test(ruc)) {
      return res.status(400).json({ error: 'Formato de RUC inválido (debe ser numérico de 10 o 13 dígitos)' });
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Formato de correo electrónico inválido' });
    }

    if (phone && !/^\d{7,15}$/.test(phone.replace(/\D/g, ''))) {
      return res.status(400).json({ error: 'Formato de teléfono inválido (debe tener entre 7 y 15 dígitos)' });
    }

    const db = await getDatabase();

    // Validar RUC duplicado programáticamente
    const existingSupplier = await db.get('SELECT id FROM suppliers WHERE ruc = ?', [ruc]);
    if (existingSupplier) {
      return res.status(409).json({ error: 'El RUC ya está registrado para otro proveedor' });
    }

    const supplierId = uuidv4();

    await db.run(
      `INSERT INTO suppliers (id, business_name, contact_person, email, phone, address, city, ruc, payment_terms)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [supplierId, businessName, contactPerson || null, email || null, phone || null, address || null, city || null, ruc, paymentTerms || null]
    );

    res.status(201).json({ success: true, id: supplierId });
  } catch (error) {
    console.error('Error creando proveedor:', error);
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: 'El RUC ya está registrado para otro proveedor' });
    }
    res.status(500).json({ error: 'Error creando proveedor' });
  }
}

export async function getSuppliers(req, res) {
  try {
    const { active } = req.query;
    const db = await getDatabase();

    let query = 'SELECT * FROM suppliers WHERE 1=1';
    const params = [];

    if (active !== undefined) {
      query += ' AND active = ?';
      params.push(active === 'true' ? 1 : 0);
    }

    query += ' ORDER BY business_name ASC';
    const suppliers = await db.all(query, params);
    res.json(suppliers);
  } catch (error) {
    console.error('Error obteniendo proveedores:', error);
    res.status(500).json({ error: 'Error obteniendo proveedores' });
  }
}

export async function createPurchaseOrder(req, res) {
  try {
    const { supplierId, orderNumber, expectedDelivery, totalAmount, notes } = req.body;

    if (!supplierId) {
      return res.status(400).json({ error: 'Proveedor requerido' });
    }

    const db = await getDatabase();
    const poId = uuidv4();

    await db.run(
      `INSERT INTO purchase_orders (id, supplier_id, order_number, order_date, expected_delivery, status, total_amount, notes)
       VALUES (?, ?, ?, ?, ?, 'pendiente', ?, ?)`,
      [poId, supplierId, orderNumber || null, new Date().toISOString(), expectedDelivery || null, totalAmount || null, notes || null]
    );

    res.status(201).json({ success: true, id: poId });
  } catch (error) {
    console.error('Error creando orden de compra:', error);
    res.status(500).json({ error: 'Error creando orden de compra' });
  }
}

export async function getPurchaseOrders(req, res) {
  try {
    const { supplierId, status } = req.query;
    const db = await getDatabase();

    let query = `SELECT po.*, s.business_name FROM purchase_orders po 
                 JOIN suppliers s ON po.supplier_id = s.id 
                 WHERE 1=1`;
    const params = [];

    if (supplierId) {
      query += ' AND po.supplier_id = ?';
      params.push(supplierId);
    }

    if (status) {
      query += ' AND po.status = ?';
      params.push(status);
    }

    query += ' ORDER BY po.order_date DESC';
    const orders = await db.all(query, params);
    res.json(orders);
  } catch (error) {
    console.error('Error obteniendo órdenes de compra:', error);
    res.status(500).json({ error: 'Error obteniendo órdenes de compra' });
  }
}

export async function updatePurchaseOrderStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const db = await getDatabase();

    await db.run(
      'UPDATE purchase_orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, id]
    );

    res.json({ success: true, message: 'Estado actualizado' });
  } catch (error) {
    console.error('Error actualizando orden de compra:', error);
    res.status(500).json({ error: 'Error actualizando orden de compra' });
  }
}
