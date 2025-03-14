# 📌 Documentación de la API WordHub  

## 📖 Descripción
Esta API permite gestionar **usuarios, publicaciones y comentarios**, con autenticación mediante **JWT (JSON Web Token)**. Está diseñada para ser **segura, eficiente y fácil de usar**.  

### 🚀 Características:
✔ **Autenticación segura con JWT**  
✔ **CRUD de usuarios, publicaciones y comentarios**  
✔ **Protección con tokens en todas las rutas privadas**  
✔ **Persistencia de sesión con almacenamiento del token**  
✔ **Uso de HTTPS con certificados SSL**  

---

## 🔹 Requisitos Previos
- **Node.js** (versión 18+ recomendada).  
- **Docker y Docker Compose** (para la versión con contenedores).  
- **MySQL** instalado y configurado.  
- **Certificados SSL** si usas HTTPS.  

### 🔹 Instalación de dependencias:
```bash
npm install
```

Si necesitas instalar solo las dependencias específicas:
```bash
npm install express mysql2 body-parser bcryptjs jsonwebtoken express-validator dotenv
```

Si usas HTTPS:
```bash
npm install https fs
```

---

## 🔹 Configuración
### 1️⃣ **Crea un archivo `.env` en la raíz del proyecto:**
```ini
# Configuración de la Base de Datos
DB_HOST=<URL>
DB_USER=<TU_USUARIO>
DB_PASSWORD=<TU_CONTRASEÑA>
DB_DATABASE=<DATABASE>

# Configuración del Servidor
JWT_SECRET=<clave_super_segura>

# Solo si usas HTTPS
PRIVATE_KEY_SSL=<ruta/privkey.pem>
PRIVATE_CERT_SSL=<ruta/fullchain.pem>
```
📌 **Reemplaza `<...>` con tus valores reales.**  

---

## 🚀 Ejecución
Para iniciar la API, usa uno de los siguientes métodos:  

### 🔹 Opción 1: Servidor Local (HTTP)
```bash
npm start
```
Ejecuta `API-http.js`.  

### 🔹 Opción 2: Servidor Seguro (HTTPS)
```bash
node API-https.js
```
**Asegúrate de tener los certificados SSL configurados en `.env`.**  

### 🔹 Opción 3: Docker Compose
Si usas **Docker**, inicia la API con:
```bash
docker-compose up -d
```
Para detenerla:
```bash
docker-compose down
```
Para reconstruir y actualizar dependencias:
```bash
docker-compose build --no-cache && docker-compose up -d
```

---

## 🔹 Uso de la API
📌 **Formato de Autenticación:**  
Todas las rutas protegidas requieren autenticación con `Bearer Token`.  
**Ejemplo en Headers:**  
```http
Authorization: Bearer <tu_token_jwt>
```

---

## 🟢 Rutas de Usuarios
### 📌 Registro de usuario
```http
POST /register
```
📌 **Cuerpo (JSON)**  
```json
{
    "nombre": "Juan Pérez",
    "email": "juan@example.com",
    "contraseña": "mi_contraseña_segura"
}
```
📌 **Respuestas:**  
- `201 Created`: Usuario creado.  
- `400 Bad Request`: Datos inválidos o faltantes.  

---

### 📌 Inicio de sesión
```http
POST /login
```
📌 **Cuerpo (JSON)**  
```json
{
    "email": "juan@example.com",
    "contraseña": "mi_contraseña_segura"
}
```
📌 **Respuestas:**  
- `200 OK`: Devuelve un `token JWT`.  
- `401 Unauthorized`: Credenciales inválidas.  

📌 **Ejemplo de Respuesta Exitosa:**  
```json
{
    "token": "eyJhbGciOiJIUzI1NiIsIn..."
}
```

---

### 📌 Obtener Usuario por ID (Requiere Token)
```http
GET /usuarios/:id
```
📌 **Respuestas:**  
- `200 OK`: Devuelve los datos del usuario.  
- `401 Unauthorized`: Token inválido o no proporcionado.  
- `404 Not Found`: Usuario no encontrado.  

📌 **Ejemplo de Respuesta Exitosa:**  
```json
{
    "id": 1,
    "nombre": "Juan Pérez",
    "email": "juan@example.com"
}
```

---

### 📌 Modificar Usuario (Solo el Propietario)
```http
PUT /usuarios/:id
```
📌 **Requiere Token en los Headers**  
📌 **Cuerpo (JSON):**  
```json
{
    "nombre": "Nuevo Nombre",
    "email": "nuevo_email@ejemplo.com",
    "contraseña": "nueva_contraseña"
}
```
📌 **Respuestas:**  
- `200 OK`: Usuario actualizado.  
- `403 Forbidden`: No tienes permiso.  

---

### 📌 Eliminar Usuario
```http
DELETE /usuarios/:id
```
📌 **Solo el dueño de la cuenta puede eliminarse.**  
📌 **Respuestas:**  
- `200 OK`: Usuario eliminado.  
- `403 Forbidden`: No tienes permiso.  

---

## Base de Datos

### Tablas

#### Usuarios
```sql
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    contraseña VARCHAR(100) NOT NULL
);
```

#### Publicaciones
```sql
CREATE TABLE publicaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    titulo VARCHAR(100) NOT NULL,
    contenido TEXT NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);
```

#### Comentarios
```sql
CREATE TABLE comentarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    publicacion_id INT NOT NULL,
    usuario_id INT NOT NULL,
    contenido TEXT NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (publicacion_id) REFERENCES publicaciones(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);
```

---

## Índices
```sql
-- Índice en la columna email de la tabla usuarios
CREATE INDEX idx_email ON usuarios(email);

-- Índice en la columna usuario_id de la tabla publicaciones
CREATE INDEX idx_usuario_id ON publicaciones(usuario_id);

-- Índices en la tabla comentarios
CREATE INDEX idx_publicacion_id ON comentarios(publicacion_id);
CREATE INDEX idx_usuario_id_comentarios ON comentarios(usuario_id);
```

---

## Validaciones implementadas

**Usuarios**:
- `nombre`: Obligatorio.
- `email`: Formato válido.
- `contraseña`: Mínimo 6 caracteres.

**Publicaciones**:
- `titulo`: Obligatorio.
- `contenido`: Obligatorio.

**Comentarios**:
- `contenido`: Obligatorio.

---

## Manejo de errores

- **400 Bad Request**: Datos inválidos o faltantes.
- **401 Unauthorized**: Token no válido o no proporcionado.
- **403 Forbidden**: Permiso denegado.
- **404 Not Found**: Recurso no encontrado.
- **500 Internal Server Error**: Error interno en el servidor o en la base de datos.

---

## Notas finales
- Asegúrate de proteger las claves y tokens sensibles.
- Realiza pruebas exhaustivas con herramientas como Postman.
- Implementa medidas de seguridad adicionales como rate limiting y protección contra ataques de fuerza bruta.


## ✅ Conclusión
🔹 **API segura y optimizada con autenticación JWT.**  
🔹 **Protección contra acceso no autorizado.**  
🔹 **Persistencia de sesión con tokens.**  

🚀 **¡Lista para producción!**  
