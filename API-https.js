const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
require('dotenv').config();
const https = require('https'); // Importar HTTPS
const fs = require('fs'); // Importar FS para leer los certificados

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

// Middleware para verificar el token
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (token) {
        jwt.verify(token, 'your_secret_key', (err, decoded) => {
            if (err) {
                return res.status(401).json({ message: 'Token inválido' });
            } else {
                req.userId = decoded.id;
                next();
            }
        });
    } else {
        res.status(401).json({ message: 'Token no proporcionado' });
    }
};

// Ruta para el registro de usuarios
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

// Ruta para modificar un usuario
app.put('/usuarios/:id',
    [
        verifyToken,
        body('nombre').optional().notEmpty().withMessage('El nombre no puede estar vacío'),
        body('email').optional().isEmail().withMessage('El email debe ser válido'),
        body('contraseña').optional().isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres')
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errores: errors.array() });
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
    }
);

// Ruta para eliminar un usuario
app.delete('/usuarios/:id', verifyToken, (req, res) => {
    const query = 'DELETE FROM usuarios WHERE id = ?';
    db.query(query, [req.params.id], (err, result) => {
        if (err) throw err;
        res.json({ message: 'Usuario eliminado' });
    });
});


// Ruta para el inicio de sesión
app.post('/login', (req, res) => {
    const { email, contraseña } = req.body;
    const query = 'SELECT * FROM usuarios WHERE email = ?';
    db.query(query, [email], (err, results) => {
        if (err) throw err;
        if (results.length > 0) {
            const user = results[0];
            if (bcrypt.compareSync(contraseña, user.contraseña)) {
                const token = jwt.sign({ id: user.id }, 'your_secret_key', { expiresIn: '1h' });
                res.json({ token });
            } else {
                res.status(401).json({ message: 'Credenciales inválidas' });
            }
        } else {
            res.status(401).json({ message: 'Credenciales inválidas' });
        }
    });
});

// Ruta para obtener todas las publicaciones
app.get('/publicaciones/todas', (req, res) => {
    const query = 'SELECT * FROM publicaciones';
    db.query(query, (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

// Ruta para obtener todas las publicaciones del usuario logueado
app.get('/publicaciones', verifyToken, (req, res) => {
    const query = 'SELECT * FROM publicaciones WHERE usuario_id = ?';
    db.query(query, [req.userId], (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

// Ruta para obtener publicacion por id
app.get('/publicaciones/:id', (req, res) => {
    const query = 'SELECT * FROM publicaciones WHERE id = ?';
    db.query(query, [req.params.id], (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

// Ruta para crear una nueva publicación
app.post('/publicaciones',
    [
        verifyToken,
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

// Ruta para editar una publicación
app.put('/publicaciones/:id',
    [
        verifyToken,
        body('titulo').notEmpty().withMessage('El título es obligatorio'),
        body('contenido').notEmpty().withMessage('El contenido es obligatorio')
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errores: errors.array() });
        }

        const { titulo, contenido } = req.body;
        const query = 'UPDATE publicaciones SET titulo = ?, contenido = ? WHERE id = ? AND usuario_id = ?';
        db.query(query, [titulo, contenido, req.params.id, req.userId], (err, result) => {
            if (err) throw err;
            res.json({ id: req.params.id, titulo, contenido });
        });
    }
);

// Ruta para eliminar una publicación
app.delete('/publicaciones/:id', verifyToken, (req, res) => {
    const deleteCommentsQuery = 'DELETE FROM comentarios WHERE publicación_id = ?';
    db.query(deleteCommentsQuery, [req.params.id], (err) => {
        if (err) return res.status(500).json({ message: 'Error al eliminar comentarios', error: err });

        const deletePublicationQuery = 'DELETE FROM publicaciones WHERE id = ? AND usuario_id = ?';
        db.query(deletePublicationQuery, [req.params.id, req.userId], (err, result) => {
            if (err) return res.status(500).json({ message: 'Error al eliminar publicación', error: err });

            res.json({ message: 'Publicación y comentarios eliminados' });
        });
    });
});

// Ruta para obtener todos los comentarios de una publicación
app.get('/publicaciones/:id/comentarios', (req, res) => {
    const query = 'SELECT * FROM comentarios WHERE publicación_id = ?';
    db.query(query, [req.params.id], (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

// Ruta para crear un nuevo comentario en una publicación
app.post('/publicaciones/:id/comentarios',
    [
        verifyToken,
        body('contenido').notEmpty().withMessage('El contenido es obligatorio')
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errores: errors.array() });
        }

        const { contenido } = req.body;
        const query = 'INSERT INTO comentarios (publicación_id, usuario_id, contenido) VALUES (?, ?, ?)';
        db.query(query, [req.params.id, req.userId, contenido], (err, result) => {
            if (err) throw err;
            res.json({
                id: result.insertId,
                publicación_id: req.params.id,
                usuario_id: req.userId,
                contenido
            });
        });
    }
);

// Ruta para editar un comentario
app.put('/comentarios/:id',
    [
        verifyToken,
        body('contenido').notEmpty().withMessage('El contenido es obligatorio')
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errores: errors.array() });
        }

        const { contenido } = req.body;
        const query = 'UPDATE comentarios SET contenido = ? WHERE id = ? AND usuario_id = ?';
        db.query(query, [contenido, req.params.id, req.userId], (err, result) => {
            if (err) throw err;
            res.json({ id: req.params.id, contenido });
        });
    }
);

// Ruta para eliminar un comentario
app.delete('/comentarios/:id', verifyToken, (req, res) => {
    const query = 'DELETE FROM comentarios WHERE id = ? AND usuario_id = ?';
    db.query(query, [req.params.id, req.userId], (err, result) => {
        if (err) throw err;
        res.json({ message: 'Comentario eliminado' });
    });
});

// Configurar los certificados SSL generados por Let's Encrypt
const options = {
    key: fs.readFileSync(process.env.PRIVATE_KEY_SSL),
    cert: fs.readFileSync(process.env.PRIVATE_CERT_SSL),
};

// Iniciar el servidor HTTPS
const port = 3000;
https.createServer(options, app).listen(port, () => {
    console.log(`Servidor seguro corriendo en https://localhost:${port}`);
});