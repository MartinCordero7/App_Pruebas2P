import { getDatabase } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

export async function createBilling(req, res) {
  try {
    const { unitId, amount, type, description, dueDate } = req.body;

    if (!unitId || amount === undefined || amount === null || !type) {
      return res.status(400).json({ error: 'Faltan campos requeridos (Unidad, Monto o Tipo)' });
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount < 0) {
      return res.status(400).json({ error: 'El monto debe ser un número positivo' });
    }

    const db = await getDatabase();

    // Validar si la unidad existe
    const unit = await db.get('SELECT id FROM units WHERE id = ?', [unitId]);
    if (!unit) {
      return res.status(404).json({ error: 'La unidad especificada no existe' });
    }

    const billingId = uuidv4();
    const billingDate = new Date().toISOString();

    await db.run(
      `INSERT INTO billing (id, unit_id, billing_date, due_date, amount, type, description, paid, interest_amount)
       VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0)`,
      [billingId, unitId, billingDate, dueDate || new Date(Date.now() + 30*24*60*60*1000).toISOString(), numericAmount, type, description || null]
    );

    res.status(201).json({ success: true, id: billingId });
  } catch (error) {
    console.error('Error creando facturación:', error);
    res.status(500).json({ error: 'Error creando facturación' });
  }
}

export async function generateMonthlyBilling(req, res) {
  try {
    const db = await getDatabase();
    const units = await db.all('SELECT id, aliquot FROM units');
    const baseAmount = req.body.baseAmount || 1000; // Monto base de expensa

    const billingId = uuidv4();
    const billingDate = new Date().toISOString();
    const dueDate = new Date(Date.now() + 30*24*60*60*1000).toISOString();

    let createdBillings = 0;

    for (const unit of units) {
      const amount = baseAmount * parseFloat(unit.aliquot);
      await db.run(
        `INSERT INTO billing (id, unit_id, billing_date, due_date, amount, type, description, paid, interest_amount)
         VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0)`,
        [uuidv4(), unit.id, billingDate, dueDate, amount, 'ordinaria', 'Cuota mensual']
      );
      createdBillings++;
    }

    res.json({ success: true, createdBillings, message: `Facturación generada para ${createdBillings} unidades` });
  } catch (error) {
    console.error('Error generando facturación mensual:', error);
    res.status(500).json({ error: 'Error generando facturación mensual' });
  }
}

export async function getBilling(req, res) {
  try {
    const { unitId, paid, fromDate, toDate } = req.query;
    const db = await getDatabase();

    let query = 'SELECT b.*, u.unit_number, r.first_name, r.last_name FROM billing b JOIN units u ON b.unit_id = u.id LEFT JOIN residents r ON u.owner_id = r.id WHERE 1=1';
    const params = [];

    if (unitId) {
      query += ' AND b.unit_id = ?';
      params.push(unitId);
    }

    if (paid !== undefined) {
      query += ' AND b.paid = ?';
      params.push(paid === 'true' ? 1 : 0);
    }

    if (fromDate) {
      query += ' AND b.billing_date >= ?';
      params.push(fromDate);
    }

    if (toDate) {
      query += ' AND b.billing_date <= ?';
      params.push(toDate);
    }

    query += ' ORDER BY b.billing_date DESC';

    const billing = await db.all(query, params);
    res.json(billing);
  } catch (error) {
    console.error('Error obteniendo facturación:', error);
    res.status(500).json({ error: 'Error obteniendo facturación' });
  }
}

export async function recordPayment(req, res) {
  try {
    const { billingId, amount, paymentMethod, reference } = req.body;

    if (!billingId || !amount) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    const db = await getDatabase();
    const paymentId = uuidv4();

    // Registrar pago
    await db.run(
      `INSERT INTO payments (id, billing_id, amount, payment_date, payment_method, reference)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [paymentId, billingId, amount, new Date().toISOString(), paymentMethod || 'transferencia', reference || null]
    );

    // Actualizar facturación
    const billing = await db.get('SELECT * FROM billing WHERE id = ?', [billingId]);
    const totalPaid = (billing.amount || 0) + (await db.get('SELECT SUM(amount) as total FROM payments WHERE billing_id = ?', [billingId])).total;

    if (totalPaid >= billing.amount) {
      await db.run('UPDATE billing SET paid = 1, payment_date = ? WHERE id = ?', [new Date().toISOString(), billingId]);
    }

    res.status(201).json({ success: true, id: paymentId, message: 'Pago registrado' });
  } catch (error) {
    console.error('Error registrando pago:', error);
    res.status(500).json({ error: 'Error registrando pago' });
  }
}

export async function getDelinquentReport(req, res) {
  try {
    const db = await getDatabase();

    const delinquent = await db.all(`
      SELECT u.id, u.unit_number, r.first_name, r.last_name, r.email, r.phone,
             SUM(b.amount + b.interest_amount) as total_debt,
             COUNT(*) as pending_bills,
             MAX(b.due_date) as last_due_date
      FROM billing b
      JOIN units u ON b.unit_id = u.id
      LEFT JOIN residents r ON u.owner_id = r.id
      WHERE b.paid = 0 AND b.due_date < datetime('now')
      GROUP BY u.id
      ORDER BY total_debt DESC
    `);

    const totalDebt = delinquent.reduce((sum, d) => sum + parseFloat(d.total_debt || 0), 0);

    res.json({
      totalDelinquent: delinquent.length,
      totalDebt,
      delinquent
    });
  } catch (error) {
    console.error('Error obteniendo reporte de morosos:', error);
    res.status(500).json({ error: 'Error obteniendo reporte de morosos' });
  }
}

export async function createPaymentAgreement(req, res) {
  try {
    const { unitId, startDate, endDate, totalAmount, monthlyAmount } = req.body;

    if (!unitId || !totalAmount || !monthlyAmount) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    const db = await getDatabase();
    const agreementId = uuidv4();

    await db.run(
      `INSERT INTO payment_agreements (id, unit_id, start_date, end_date, total_amount, monthly_amount, status)
       VALUES (?, ?, ?, ?, ?, ?, 'activo')`,
      [agreementId, unitId, startDate, endDate, totalAmount, monthlyAmount]
    );

    res.status(201).json({ success: true, id: agreementId });
  } catch (error) {
    console.error('Error creando convenio de pago:', error);
    res.status(500).json({ error: 'Error creando convenio de pago' });
  }
}

export async function getPaymentAgreements(req, res) {
  try {
    const { unitId, status } = req.query;
    const db = await getDatabase();

    let query = 'SELECT pa.*, u.unit_number, r.first_name, r.last_name FROM payment_agreements pa JOIN units u ON pa.unit_id = u.id LEFT JOIN residents r ON u.owner_id = r.id WHERE 1=1';
    const params = [];

    if (unitId) {
      query += ' AND pa.unit_id = ?';
      params.push(unitId);
    }

    if (status) {
      query += ' AND pa.status = ?';
      params.push(status);
    }

    const agreements = await db.all(query, params);
    res.json(agreements);
  } catch (error) {
    console.error('Error obteniendo convenios:', error);
    res.status(500).json({ error: 'Error obteniendo convenios' });
  }
}

export async function calculateInterest(req, res) {
  try {
    const { billingId, interestRate } = req.body;
    const db = await getDatabase();

    const billing = await db.get('SELECT * FROM billing WHERE id = ?', [billingId]);
    if (!billing) {
      return res.status(404).json({ error: 'Facturación no encontrada' });
    }

    const daysOverdue = Math.floor((Date.now() - new Date(billing.due_date).getTime()) / (1000 * 60 * 60 * 24));
    if (daysOverdue <= 0) {
      return res.json({ interestAmount: 0 });
    }

    const interestAmount = (billing.amount * (interestRate / 100) * daysOverdue) / 30; // Interés diario

    await db.run(
      'UPDATE billing SET interest_amount = ? WHERE id = ?',
      [interestAmount, billingId]
    );

    res.json({ success: true, interestAmount });
  } catch (error) {
    console.error('Error calculando interés:', error);
    res.status(500).json({ error: 'Error calculando interés' });
  }
}
