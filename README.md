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
### 🔹 Servidor Local (HTTP)  
```bash
npm start
```  

### 🔹 Servidor Seguro (HTTPS)  
```bash
node API-https.js
```  

**Asegúrate de tener los certificados SSL configurados en `.env`.**  

---

## 🔹 Uso de la API  
📌 **Formato de Autenticación:**  
Todas las rutas protegidas requieren autenticación con el siguiente header:  
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

📌 **Ejemplo de respuesta exitosa:**  
```json
{
    "token": "eyJhbGciOiJIUzI1NiIsIn..."
}
```  

---

### 📌 Obtener Usuario por ID  
```http
GET /usuarios/:id
```  
📌 **Headers:**  
```http
Authorization: Bearer <tu_token_jwt>
```  

---

### 📌 Modificar Usuario  
```http
PUT /usuarios/:id
```  
📌 **Headers:**  
```http
Authorization: Bearer <tu_token_jwt>
```  

📌 **Cuerpo (JSON):**  
```json
{
    "nombre": "Nuevo Nombre",
    "email": "nuevo_email@ejemplo.com",
    "contraseña": "nueva_contraseña"
}
```  

---

### 📌 Eliminar Usuario  
```http
DELETE /usuarios/:id
```  
📌 **Headers:**  
```http
Authorization: Bearer <tu_token_jwt>
```  

---

## 🟢 Rutas de Publicaciones  
### 📌 Obtener todas las publicaciones  
```http
GET /publicaciones/todas
```  

### 📌 Obtener publicaciones del usuario autenticado  
```http
GET /publicaciones
```  
📌 **Headers:**  
```http
Authorization: Bearer <tu_token_jwt>
```  

### 📌 Crear una nueva publicación  
```http
POST /publicaciones
```  
📌 **Headers:**  
```http
Authorization: Bearer <tu_token_jwt>
```  

📌 **Cuerpo (JSON):**  
```json
{
    "titulo": "Mi primera publicación",
    "contenido": "Este es el contenido de la publicación."
}
```  

---

### 📌 Editar una publicación  
```http
PUT /publicaciones/:id
```  
📌 **Headers:**  
```http
Authorization: Bearer <tu_token_jwt>
```  

📌 **Cuerpo (JSON):**  
```json
{
    "titulo": "Título actualizado",
    "contenido": "Contenido actualizado de la publicación."
}
```  

---

### 📌 Eliminar una publicación  
```http
DELETE /publicaciones/:id
```  
📌 **Headers:**  
```http
Authorization: Bearer <tu_token_jwt>
```  

---

## 🟢 Rutas de Comentarios  
### 📌 Obtener todos los comentarios de una publicación  
```http
GET /publicaciones/:id/comentarios
```  

### 📌 Crear un nuevo comentario  
```http
POST /publicaciones/:id/comentarios
```  
📌 **Headers:**  
```http
Authorization: Bearer <tu_token_jwt>
```  

📌 **Cuerpo (JSON):**  
```json
{
    "contenido": "Este es mi comentario."
}
```  

---

### 📌 Editar un comentario  
```http
PUT /comentarios/:id
```  
📌 **Headers:**  
```http
Authorization: Bearer <tu_token_jwt>
```  

📌 **Cuerpo (JSON):**  
```json
{
    "contenido": "Comentario actualizado."
}
```  

---

### 📌 Eliminar un comentario  
```http
DELETE /comentarios/:id
```  
📌 **Headers:**  
```http
Authorization: Bearer <tu_token_jwt>
```  

---

## 🔹 Base de Datos  

### 📌 Tablas  

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

## 🔹 Manejo de errores  
- **400 Bad Request**: Datos inválidos o faltantes.  
- **401 Unauthorized**: Token no válido o no proporcionado.  
- **403 Forbidden**: Permiso denegado.  
- **404 Not Found**: Recurso no encontrado.  
- **500 Internal Server Error**: Error interno en el servidor o en la base de datos.  

---

## ✅ Conclusión  
🚀 **API segura y optimizada con autenticación JWT.**  
