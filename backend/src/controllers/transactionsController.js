import { getDatabase } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

export async function createTransaction(req, res) {
  try {
    const { type, category, amount, description, reference, accountId } = req.body;

    if (!type || !category || !amount) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    const db = await getDatabase();
    const transactionId = uuidv4();

    await db.run(
      `INSERT INTO transactions (id, type, category, amount, description, reference, transaction_date, account_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [transactionId, type, category, amount, description || null, reference || null, new Date().toISOString(), accountId || null]
    );

    res.status(201).json({ success: true, id: transactionId });
  } catch (error) {
    console.error('Error creando transacción:', error);
    res.status(500).json({ error: 'Error creando transacción' });
  }
}

export async function getTransactions(req, res) {
  try {
    const { type, category, fromDate, toDate } = req.query;
    const db = await getDatabase();

    let query = 'SELECT * FROM transactions WHERE 1=1';
    const params = [];

    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    if (fromDate) {
      query += ' AND transaction_date >= ?';
      params.push(fromDate);
    }

    if (toDate) {
      query += ' AND transaction_date <= ?';
      params.push(toDate);
    }

    query += ' ORDER BY transaction_date DESC';
    const transactions = await db.all(query, params);
    res.json(transactions);
  } catch (error) {
    console.error('Error obteniendo transacciones:', error);
    res.status(500).json({ error: 'Error obteniendo transacciones' });
  }
}

export async function getFinancialReport(req, res) {
  try {
    const { fromDate, toDate } = req.query;
    const db = await getDatabase();

    let dateFilter = '';
    const params = [];

    if (fromDate && toDate) {
      dateFilter = ' AND transaction_date BETWEEN ? AND ?';
      params.push(fromDate, toDate);
    }

    // Ingresos
    const incomeByCategory = await db.all(
      `SELECT category, SUM(amount) as total FROM transactions WHERE type = 'ingreso'${dateFilter} GROUP BY category`,
      params
    );

    // Egresos
    const expensesByCategory = await db.all(
      `SELECT category, SUM(amount) as total FROM transactions WHERE type = 'egreso'${dateFilter} GROUP BY category`,
      params
    );

    // Totales
    const totalIncome = incomeByCategory.reduce((sum, c) => sum + parseFloat(c.total || 0), 0);
    const totalExpenses = expensesByCategory.reduce((sum, c) => sum + parseFloat(c.total || 0), 0);

    res.json({
      period: { fromDate, toDate },
      income: { byCategory: incomeByCategory, total: totalIncome },
      expenses: { byCategory: expensesByCategory, total: totalExpenses },
      balance: totalIncome - totalExpenses,
      profit_margin: totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0
    });
  } catch (error) {
    console.error('Error generando reporte financiero:', error);
    res.status(500).json({ error: 'Error generando reporte financiero' });
  }
}

export async function getCashFlowReport(req, res) {
  try {
    const { month } = req.query;
    const db = await getDatabase();

    const monthFilter = month ? `AND strftime('%Y-%m', transaction_date) = ?` : '';
    const params = month ? [month] : [];

    const dailyFlow = await db.all(
      `SELECT DATE(transaction_date) as date,
              SUM(CASE WHEN type = 'ingreso' THEN amount ELSE 0 END) as daily_income,
              SUM(CASE WHEN type = 'egreso' THEN amount ELSE 0 END) as daily_expenses
       FROM transactions
       WHERE 1=1 ${monthFilter}
       GROUP BY DATE(transaction_date)
       ORDER BY date ASC`,
      params
    );

    res.json({ cashFlow: dailyFlow });
  } catch (error) {
    console.error('Error obteniendo flujo de caja:', error);
    res.status(500).json({ error: 'Error obteniendo flujo de caja' });
  }
}

export async function generateBalanceSheet(req, res) {
  try {
    const db = await getDatabase();

    const totalIncome = await db.get('SELECT SUM(amount) as total FROM transactions WHERE type = ?', ['ingreso']);
    const totalExpenses = await db.get('SELECT SUM(amount) as total FROM transactions WHERE type = ?', ['egreso']);
    const balance = (totalIncome.total || 0) - (totalExpenses.total || 0);

    res.json({
      assets: totalIncome.total || 0,
      liabilities: totalExpenses.total || 0,
      equity: balance,
      total: balance
    });
  } catch (error) {
    console.error('Error generando balance general:', error);
    res.status(500).json({ error: 'Error generando balance general' });
  }
}
