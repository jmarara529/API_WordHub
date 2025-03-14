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
    console.log('Conectado a la base de datos');
});

// Clave secreta para JWT
const JWT_SECRET = process.env.JWT_SECRET || 'clave_segura_super_secreta';

// Middleware para verificar token JWT
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Token no proporcionado o inválido' });
    }

    const token = authHeader.split(" ")[1];
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Token inválido' });
        }
        req.userId = decoded.id;
        next();
    });
};

// 📌 REGISTRO DE USUARIO
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

// 📌 INICIO DE SESIÓN
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

// 📌 OBTENER TODAS LAS PUBLICACIONES
app.get('/publicaciones/todas', (req, res) => {
    const query = 'SELECT * FROM publicaciones';
    db.query(query, (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

// 📌 OBTENER PUBLICACIONES DEL USUARIO AUTENTICADO
app.get('/publicaciones', verifyToken, (req, res) => {
    const query = 'SELECT * FROM publicaciones WHERE usuario_id = ?';
    db.query(query, [req.userId], (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

// 📌 OBTENER UNA PUBLICACIÓN POR ID
app.get('/publicaciones/:id', (req, res) => {
    const query = 'SELECT * FROM publicaciones WHERE id = ?';
    db.query(query, [req.params.id], (err, results) => {
        if (err) throw err;
        if (results.length > 0) {
            res.json(results[0]);
        } else {
            res.status(404).json({ message: 'Publicación no encontrada' });
        }
    });
});

// 📌 CREAR UNA NUEVA PUBLICACIÓN (Requiere autenticación)
app.post('/publicaciones', verifyToken, 
    [
        body('titulo').notEmpty().withMessage('El título es obligatorio'),
        body('contenido').notEmpty().withMessage('El contenido es obligatorio')
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errores: errors.array() });
        }

        const { titulo, contenido } = req.body;
        const query = 'INSERT INTO publicaciones (usuario_id, titulo, contenido) VALUES (?, ?, ?)';
        db.query(query, [req.userId, titulo, contenido], (err, result) => {
            if (err) throw err;
            res.json({ id: result.insertId, usuario_id: req.userId, titulo, contenido });
        });
    }
);

// 📌 OBTENER TODOS LOS COMENTARIOS DE UNA PUBLICACIÓN
app.get('/publicaciones/:id/comentarios', (req, res) => {
    const query = 'SELECT * FROM comentarios WHERE publicacion_id = ?';
    db.query(query, [req.params.id], (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

// 📌 CREAR UN NUEVO COMENTARIO
app.post('/publicaciones/:id/comentarios', verifyToken,
    [
        body('contenido').notEmpty().withMessage('El contenido es obligatorio')
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errores: errors.array() });
        }

        const { contenido } = req.body;
        const query = 'INSERT INTO comentarios (publicacion_id, usuario_id, contenido) VALUES (?, ?, ?)';
        db.query(query, [req.params.id, req.userId, contenido], (err, result) => {
            if (err) throw err;
            res.json({ id: result.insertId, publicacion_id: req.params.id, usuario_id: req.userId, contenido });
        });
    }
);

// 📌 EDITAR UN COMENTARIO (Solo el autor puede hacerlo)
app.put('/comentarios/:id', verifyToken,
    [
        body('contenido').notEmpty().withMessage('El contenido es obligatorio')
    ],
    (req, res) => {
        const { contenido } = req.body;
        const query = 'UPDATE comentarios SET contenido = ? WHERE id = ? AND usuario_id = ?';
        db.query(query, [contenido, req.params.id, req.userId], (err, result) => {
            if (err) throw err;
            res.json({ id: req.params.id, contenido });
        });
    }
);

// 📌 ELIMINAR UN COMENTARIO (Solo el autor puede hacerlo)
app.delete('/comentarios/:id', verifyToken, (req, res) => {
    const query = 'DELETE FROM comentarios WHERE id = ? AND usuario_id = ?';
    db.query(query, [req.params.id, req.userId], (err, result) => {
        if (err) throw err;
        res.json({ message: 'Comentario eliminado' });
    });
});


const port = 3000;
https.createServer(options, app).listen(port, () => {
    console.log(`Servidor seguro corriendo en http://localhost:${port}`);
});
