const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});

db.connect((err) => {
    if (err) throw err;
    console.log('✅ Conectado a la base de datos');
});

// 🔐 Clave secreta desde .env
const JWT_SECRET = process.env.JWT_SECRET || 'clave_segura_super_secreta';

// Middleware para verificar el token con formato "Bearer <token>"
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Token no proporcionado o inválido' });
    }

    const token = authHeader.split(" ")[1]; // Extrae solo el token
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Token inválido' });
        }
        req.userId = decoded.id;
        next();
    });
};

// 📌 Ruta para registrar usuarios
app.post('/register',
    [
        body('nombre').notEmpty().withMessage('El nombre es obligatorio'),
        body('email').isEmail().withMessage('El email debe ser válido'),
        body('contraseña').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres')
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errores: errors.array() });
        }

        const { nombre, email, contraseña } = req.body;
        const hash = bcrypt.hashSync(contraseña, 10);
        const query = 'INSERT INTO usuarios (nombre, email, contraseña) VALUES (?, ?, ?)';
        db.query(query, [nombre, email, hash], (err, result) => {
            if (err) throw err;
            res.json({ id: result.insertId, nombre, email });
        });
    }
);

// 📌 Modificar un usuario (solo el dueño puede hacerlo)
app.put('/usuarios/:id', verifyToken, (req, res) => {
    if (req.userId !== parseInt(req.params.id)) {
        return res.status(403).json({ message: 'No tienes permiso para modificar este usuario' });
    }

    const { nombre, email, contraseña } = req.body;
    let query = 'UPDATE usuarios SET ';
    const updates = [];
    const values = [];

    if (nombre) {
        updates.push('nombre = ?');
        values.push(nombre);
    }
    if (email) {
        updates.push('email = ?');
        values.push(email);
    }
    if (contraseña) {
        updates.push('contraseña = ?');
        values.push(bcrypt.hashSync(contraseña, 10));
    }

    query += updates.join(', ') + ' WHERE id = ?';
    values.push(req.params.id);

    db.query(query, values, (err, result) => {
        if (err) throw err;
        res.json({ id: req.params.id, nombre, email });
    });
});

// 📌 Eliminar un usuario (solo el dueño puede hacerlo)
app.delete('/usuarios/:id', verifyToken, (req, res) => {
    if (req.userId !== parseInt(req.params.id)) {
        return res.status(403).json({ message: 'No tienes permiso para eliminar este usuario' });
    }

    const query = 'DELETE FROM usuarios WHERE id = ?';
    db.query(query, [req.params.id], (err, result) => {
        if (err) throw err;
        res.json({ message: 'Usuario eliminado' });
    });
});

// 📌 Iniciar sesión
app.post('/login', (req, res) => {
    const { email, contraseña } = req.body;
    const query = 'SELECT * FROM usuarios WHERE email = ?';
    db.query(query, [email], (err, results) => {
        if (err) throw err;
        if (results.length > 0) {
            const user = results[0];
            if (bcrypt.compareSync(contraseña, user.contraseña)) {
                const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1h' });
                res.json({ token });
            } else {
                res.status(401).json({ message: 'Credenciales inválidas' });
            }
        } else {
            res.status(401).json({ message: 'Credenciales inválidas' });
        }
    });
});

// 📌 Editar una publicación (solo el autor puede hacerlo)
app.put('/publicaciones/:id', verifyToken, (req, res) => {
    const { titulo, contenido } = req.body;
    const checkQuery = 'SELECT usuario_id FROM publicaciones WHERE id = ?';

    db.query(checkQuery, [req.params.id], (err, results) => {
        if (err) throw err;
        if (results.length === 0) {
            return res.status(404).json({ message: 'Publicación no encontrada' });
        }
        if (results[0].usuario_id !== req.userId) {
            return res.status(403).json({ message: 'No tienes permiso para editar esta publicación' });
        }

        const updateQuery = 'UPDATE publicaciones SET titulo = ?, contenido = ? WHERE id = ?';
        db.query(updateQuery, [titulo, contenido, req.params.id], (err, result) => {
            if (err) throw err;
            res.json({ id: req.params.id, titulo, contenido });
        });
    });
});

// 📌 Eliminar una publicación (solo el autor puede hacerlo)
app.delete('/publicaciones/:id', verifyToken, (req, res) => {
    const checkQuery = 'SELECT usuario_id FROM publicaciones WHERE id = ?';

    db.query(checkQuery, [req.params.id], (err, results) => {
        if (err) throw err;
        if (results.length === 0) {
            return res.status(404).json({ message: 'Publicación no encontrada' });
        }
        if (results[0].usuario_id !== req.userId) {
            return res.status(403).json({ message: 'No tienes permiso para eliminar esta publicación' });
        }

        const deleteQuery = 'DELETE FROM publicaciones WHERE id = ?';
        db.query(deleteQuery, [req.params.id], (err, result) => {
            if (err) throw err;
            res.json({ message: 'Publicación eliminada' });
        });
    });
});

// 📌 Eliminar un comentario (solo el autor puede hacerlo)
app.delete('/comentarios/:id', verifyToken, (req, res) => {
    const checkQuery = 'SELECT usuario_id FROM comentarios WHERE id = ?';

    db.query(checkQuery, [req.params.id], (err, results) => {
        if (err) throw err;
        if (results.length === 0) {
            return res.status(404).json({ message: 'Comentario no encontrado' });
        }
        if (results[0].usuario_id !== req.userId) {
            return res.status(403).json({ message: 'No tienes permiso para eliminar este comentario' });
        }

        const deleteQuery = 'DELETE FROM comentarios WHERE id = ?';
        db.query(deleteQuery, [req.params.id], (err, result) => {
            if (err) throw err;
            res.json({ message: 'Comentario eliminado' });
        });
    });
});

// 🚀 Iniciar el servidor
const port = 3000;
app.listen(port, () => {
    console.log(`✅ Servidor corriendo en http://localhost:${port}`);
});
