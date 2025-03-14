# Documentación de la API

## Descripción
Esta API permite gestionar usuarios, publicaciones y comentarios, incluyendo autenticación mediante tokens JWT. Es robusta, segura y optimizada para un rendimiento eficiente.

---

## Requisitos Previos
- **Node.js** (versión 14+ recomendada).
- **MySQL** instalado y configurado.
- Instala las dependencias necesarias ejecutando:
    ```bash
    npm install express mysql2 body-parser bcryptjs jsonwebtoken express-validator dotenv
    ```
- En caso de utilizar la conexión segura para el cifrado, instala también:
    ```bash
    npm install https fs
    ```

## Configuración
1. Crea un archivo `.env` en la raíz del proyecto con las credenciales de la base de datos y configuración del servidor:
    ```env
    DB_HOST=<URL>
    DB_USER=<TU_USUARIO>
    DB_PASSWORD=<TU_CONTRASEÑA>
    DB_DATABASE=<DATABASE>
    PRIVATE_KEY_SSL=<ruta/privkey.pem>      #solo en caso de conexiones https
    PRIVATE_CERT_SSL=<ruta/fullchain.pem>   #solo en caso de conexiones https
    ```
    **Nota**: Sustituye `<...>` por tus valores reales.

2. Configura los certificados SSL si usas HTTPS.

---

## Ejecución
Para ejecutar el proyecto, utiliza uno de los siguientes comandos:

- **Versión HTTP**:
    ```bash
    npm start
    ```
    Esto ejecutará `API-http.js`.

- **Versión HTTPS**:
    ```bash
    node API-https.js
    ```
    **Nota**: Asegúrate de que las rutas de los certificados SSL estén configuradas en el archivo `.env`.

---

## Uso de la API

### Rutas disponibles

#### Usuarios

##### Registro de usuario
```url
POST <url>/register
```
**Descripción**: Registra un nuevo usuario.

**Cuerpo (JSON)**:
```json
{
    "nombre": "Nombre del usuario",
    "email": "usuario@example.com",
    "contraseña": "mi_contraseña_segura"
}
```

**Respuestas**:
- **201 Created**: Usuario creado con éxito.
- **400 Bad Request**: Datos inválidos o faltantes.

---

##### Inicio de sesión
```url
POST <url>/login
```
**Descripción**: Autentica al usuario y devuelve un token JWT.

**Cuerpo (JSON)**:
```json
{
    "email": "usuario@example.com",
    "contraseña": "mi_contraseña_segura"
}
```

**Respuestas**:
- **200 OK**: Autenticación exitosa con el token.
- **401 Unauthorized**: Credenciales inválidas.

---

##### Modificar usuario
```url
PUT <url>/usuarios/:id
```
**Descripción**: Modifica la información de un usuario existente.

**Headers**:
```header
Authorization: Bearer <token>
```

**Cuerpo (JSON)**:
```json
{
    "nombre": "Nuevo Nombre",
    "email": "nuevo_email@ejemplo.com",
    "contraseña": "nueva_contraseña"
}
```

**Respuestas**:
- **200 OK**: Usuario modificado con éxito.
- **400 Bad Request**: Datos inválidos o faltantes.
- **401 Unauthorized**: Token inválido o no proporcionado.

---

##### Obtener usuario por ID
```url
GET <url>/usuarios/:id
```
**Descripción**: Obtiene la información de un usuario por su ID.

**Headers**:
```header
Authorization: Bearer <token>
```

**Respuestas**:
- **200 OK**: Usuario obtenido con éxito.
    ```json
    {
        "id": 1,
        "nombre": "Juan Pérez",
        "email": "juan.perez@example.com"
    }
    ```
- **404 Not Found**: Usuario no encontrado.
    ```json
    {
        "message": "Usuario no encontrado"
    }
    ```
- **401 Unauthorized**: Token inválido o no proporcionado.
    ```json
    {
        "message": "Token no proporcionado"
    }
    ```

---

##### Eliminar usuario
```url
DELETE <url>/usuarios/:id
```
**Descripción**: Elimina un usuario existente.

**Headers**:
```header
Authorization: Bearer <token>
```

**Respuestas**:
- **200 OK**: Usuario eliminado con éxito.
    ```json
    {
        "message": "Usuario eliminado"
    }
    ```
- **401 Unauthorized**: Token inválido o no proporcionado.
    ```json
    {
        "message": "Token no proporcionado"
    }
    ```
- **500 Internal Server Error**: Error al eliminar el usuario.
    ```json
    {
        "message": "Error al eliminar el usuario",
        "error": "Detalles del error"
    }
    ```

---

#### Publicaciones

##### Obtener todas las publicaciones
```url
GET <url>/publicaciones/todas
```
**Descripción**: Obtiene todas las publicaciones.

**Respuestas**:
- **200 OK**: Lista de publicaciones.
- **500 Internal Server Error**: Error al obtener datos.

---

##### Crear una publicación
```url
POST <url>/publicaciones
```
**Descripción**: Crea una nueva publicación. Requiere autenticación.

**Headers**:
```header
Authorization: Bearer <token>
```

**Cuerpo (JSON)**:
```json
{
    "titulo": "Mi publicación",
    "contenido": "El contenido de mi publicación."
}
```

**Respuestas**:
- **201 Created**: Publicación creada con éxito.
- **400 Bad Request**: Datos inválidos.
- **401 Unauthorized**: Token no válido o faltante.

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
