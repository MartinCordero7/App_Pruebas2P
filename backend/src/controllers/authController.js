import { getDatabase } from '../config/database.js';
import jwt from 'jwt-simple';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_change_this_in_production';

export async function register(req, res) {
  try {
    const { username, email, password, firstName, lastName, role = 'resident' } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Faltan campos requeridos (Usuario, Email o Contraseña)' });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Formato de correo electrónico inválido' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    const db = await getDatabase();

    // Verificar si usuario ya existe
    const existing = await db.get('SELECT id FROM users WHERE username = ? OR email = ?', [username, email]);
    if (existing) {
      return res.status(409).json({ error: 'El nombre de usuario o correo electrónico ya está registrado' });
    }

    // Hash de contraseña
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    // Crear usuario
    await db.run(
      `INSERT INTO users (id, username, email, password, first_name, last_name, role) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, username, email, hashedPassword, firstName || '', lastName || '', role]
    );

    // Generar token
    const token = jwt.encode({
      id: userId,
      username,
      email,
      role
    }, JWT_SECRET);

    res.status(201).json({
      success: true,
      user: { id: userId, username, email, role },
      token
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error en registro' });
  }
}

export async function login(req, res) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
    }

    const db = await getDatabase();

    // Buscar usuario
    const user = await db.get('SELECT * FROM users WHERE username = ?', [username]);
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Validar contraseña
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Generar token
    const token = jwt.encode({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    }, JWT_SECRET);

    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name
      },
      token
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error en login' });
  }
}

export async function getProfile(req, res) {
  try {
    const db = await getDatabase();
    const user = await db.get('SELECT id, username, email, role, first_name, last_name, phone FROM users WHERE id = ?', [req.user.id]);

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    res.status(500).json({ error: 'Error obteniendo perfil' });
  }
}

export async function updateProfile(req, res) {
  try {
    const { firstName, lastName, phone } = req.body;
    const db = await getDatabase();

    await db.run(
      'UPDATE users SET first_name = ?, last_name = ?, phone = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [firstName || '', lastName || '', phone || '', req.user.id]
    );

    res.json({ success: true, message: 'Perfil actualizado' });
  } catch (error) {
    console.error('Error actualizando perfil:', error);
    res.status(500).json({ error: 'Error actualizando perfil' });
  }
}
