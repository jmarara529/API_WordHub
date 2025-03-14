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
- En caso de utilizar la conexion segura para el cifrado instalar tambien:
    ```bash
    npm install https fs
    ```

## IMPORTANTE
En la raiz del proyecto hay que crear un archivo llamado ".env" para establecer las credenciales de la base de datos con el contenido:
```env
DB_HOST=<URL>
DB_USER=<TU_USUARIO>
DB_PASSWORD=<TU_CONTRASEÑA>
DB_DATABASE=<DATABASE>
```
**sustituir <> por tus credenciales**
 ejemplo:
```env
DB_HOST=example.net
DB_USER=user
DB_PASSWORD=password
DB_DATABASE=MyDatabase
```

## Ejecución
para ejecutar el proyecto podemos usar:
```bash
npm start
```
Este ejecutará API-http.json.
en caso de querer ejecutar la versión preparada para https y usar el cifrado:
```bash
node API-https.js
```
**recuerda**
Añadir las rutas de los certificados en el archivo .env:
```env
PRIVATE_KEY_SSL=ruta/privkey.pem
PRIVATE_CERT_SSL=ruta/fullchain.pem
```

---

## USO DE LA API

Rutas disponibles
### Usuarios
#### POST
```url
<url>/register
```


Descripción: Registra un nuevo usuario.

Cuerpo (JSON):

```json
{
    "nombre": "Nombre del usuario",
    "email": "usuario@example.com",
    "contraseña": "mi_contraseña_segura"
}
```
Respuestas:

+ 201 Created: Usuario creado con éxito.

+ 400 Bad Request: Datos inválidos o faltantes.

#### POST
```url
<url>/login
```
Descripción: Autentica al usuario y devuelve un token JWT.

Cuerpo (JSON):

```json
{
    "email": "usuario@example.com",
    "contraseña": "mi_contraseña_segura"
}
```
Respuestas:

+ 200 OK: Autenticación exitosa con el token.

+ 401 Unauthorized: Credenciales inválidas.

#### PUT
```url
<url>/usuarios/:id
```
Descripción: Modifica la información de un usuario existente.

Headers:
```header
Authorization: Bearer <token>
```
Cuerpo (JSON)
```json
{
    "nombre": "Nuevo Nombre",
    "email": "nuevo_email@ejemplo.com",
    "contraseña": "nueva_contraseña"
}
```
Respuestas:

+ 200 OK: Usuario modificado con éxito.

+ 400 Bad Request: Datos inválidos o faltantes.

+ 401 Unauthorized: Token inválido o no proporcionado.

#### delete
```url
<url>/usuarios/:id
```
Descripción: Elimina un usuario existente.

Headers:
```header
Authorization: Bearer <token>
```
Respuestas:

+ 200 OK: Usuario eliminado con éxito.

+ 401 Unauthorized: Token inválido o no proporcionado.

### Publicaciones
#### GET
```url
<url>/publicaciones/todas
```
Descripción: Obtiene todas las publicaciones.

Respuestas:

+ 200 OK: Lista de publicaciones.

+ 500 Internal Server Error: Error al obtener datos.

#### GET
```url
<url>/publicaciones
```
Descripción: Obtiene las publicaciones del usuario logeado.

Headers:
```header
Authorization: Bearer <token>
```

Respuestas:

+ 200 OK: Lista de publicaciones.

+ 500 Internal Server Error: Error al obtener datos.

#### GET
```url
<url>/publicaciones/:id
```
Descripción: Obtiene la publicación por id.

```json
{
    "id": "id_publicacion"
}
```

Respuestas:

+ 200 OK: Lista de publicaciones.

+ 500 Internal Server Error: Error al obtener datos.

#### POST
```url
<url>/publicaciones
```
Descripción: Crea una nueva publicación. Requiere autenticación.

Encabezados:
```header
Authorization: Bearer <token>
```
Cuerpo (JSON):

```json
{
    "titulo": "Mi publicación",
    "contenido": "El contenido de mi publicación."
}
```
Respuestas:

+ 201 Created: Publicación creada con éxito.

+ 400 Bad Request: Datos inválidos.

+ 401 Unauthorized: Token no válido o faltante.

#### PUT
```url
<url>/publicaciones/:id
```
Descripción: Actualiza una publicación existente. Requiere autenticación.

Encabezados:

```header
Authorization: Bearer <token>
```
Cuerpo (JSON):

```json
{
    "titulo": "Título actualizado",
    "contenido": "Contenido actualizado."
}
```
Respuestas:

+ 200 OK: Publicación actualizada con éxito.

+ 400 Bad Request: Datos inválidos.

+ 401 Unauthorized: Token no válido o faltante.

+ 403 Forbidden: Permiso denegado.

#### DELETE 
```url
<url>/publicaciones/:id
```
Descripción: Elimina una publicación y sus comentarios relacionados. Requiere autenticación.

Encabezados:

```header
Authorization: Bearer <token>
```
Respuestas:

+ 200 OK: Publicación y comentarios eliminados con éxito.

+ 401 Unauthorized: Token no válido o faltante.

+ 403 Forbidden: Permiso denegado.

### Comentarios
#### GET
```url
<url>/publicaciones/:id/comentarios
```
Descripción: Obtiene todos los comentarios de una publicación.

Respuestas:

+ 200 OK: Lista de comentarios.

+ 404 Not Found: La publicación no existe.

#### POST
```url
<url>/publicaciones/:id/comentarios
```
Descripción: Crea un nuevo comentario en una publicación. Requiere autenticación.

Encabezados:

```header
Authorization: Bearer <token>
```
Cuerpo (JSON):

```json
{
    "contenido": "Este es mi comentario."
}
```
Respuestas:

+ 201 Created: Comentario creado con éxito.

+ 400 Bad Request: Datos inválidos.

+ 401 Unauthorized: Token no válido o faltante.

+ 404 Not Found: La publicación no existe.

#### PUT
```url
<url>/comentarios/:id
```
Descripción: Actualiza un comentario existente. Requiere autenticación.

Encabezados:

```header
Authorization: Bearer <token>
```
Cuerpo (JSON):

```json
{
    "contenido": "Comentario actualizado."
}
```
Respuestas:

+ 200 OK: Comentario actualizado con éxito.

+ 400 Bad Request: Datos inválidos.

+ 401 Unauthorized: Token no válido o faltante.

+ 403 Forbidden: Permiso denegado.

#### DELETE
```url
<url>/comentarios/:id
```
Descripción: Elimina un comentario existente. Requiere autenticación.

Encabezados:

```header
Authorization: Bearer <token>
```
Respuestas:

+ 200 OK: Comentario eliminado con éxito.

+ 401 Unauthorized: Token no válido o faltante.

+ 403 Forbidden: Permiso denegado.

---

## Validaciones implementadas

**Usuarios:**

+ nombre: Obligatorio.

+ email: Formato válido.

+ contraseña: Mínimo 6 caracteres.

**Publicaciones:**

+ titulo: Obligatorio.

+ contenido: Obligatorio.

**Comentarios:**

+ contenido: Obligatorio.

---

## Manejo de errores

+ 400 Bad Request: Datos inválidos o faltantes.

+ 401 Unauthorized: Token no válido o no proporcionado.

+ 403 Forbidden: Permiso denegado.

+ 500 Internal Server Error: Error interno en el servidor o en la base de datos.

---

## Base de Datos
### Tablas
+ usuarios
```sql
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    contraseña VARCHAR(100) NOT NULL
);
```
+ publicaciones
```sql
CREATE TABLE publicaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    titulo VARCHAR(100) NOT NULL,
    contenido TEXT NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);
```
+ comentarios
```sql
CREATE TABLE comentarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    publicación_id INT NOT NULL,
    usuario_id INT NOT NULL,
    contenido TEXT NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (publicación_id) REFERENCES publicaciones(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);
```

### Restricciones

```sql
ALTER TABLE comentarios
DROP FOREIGN KEY comentarios_ibfk_1;

ALTER TABLE comentarios
ADD CONSTRAINT comentarios_ibfk_1
FOREIGN KEY (publicación_id) REFERENCES publicaciones(id)
ON DELETE CASCADE;
```

* Esto permite que al eliminar una publicacion, los comentarios asociados a esta se borren en cascada
---
```sql
ALTER TABLE publicaciones
ADD CONSTRAINT fk_publicaciones_usuario
FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
ON DELETE CASCADE;
```
* Esto permite que al eliminar una cuenta, los comentarios asociados a esta se borren en cascada


---
```sql
ALTER TABLE comentarios
ADD CONSTRAINT fk_comentarios_usuario
FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
ON DELETE CASCADE;
```
* Esto permite que al eliminar una cuenta, las publicaciones asociadas a esta se borren en cascada


### Índices
```sql
-- Índice en la columna usuario_id de la tabla publicaciones
CREATE INDEX idx_usuario_id ON publicaciones(usuario_id);

-- Índice en la columna publicación_id de la tabla comentarios
CREATE INDEX idx_publicacion_id ON comentarios(publicación_id);

-- Índice en la columna usuario_id de la tabla comentarios
CREATE INDEX idx_usuario_id_comentarios ON comentarios(usuario_id);

-- Índice en la columna email de la tabla usuarios (para acelerar el inicio de sesión)
CREATE INDEX idx_email ON usuarios(email);
```

- usuarios.email: Acelera la autenticación.

- publicaciones.usuario_id: Búsquedas de publicaciones por usuario.

- comentarios.publicación_id y comentarios.usuario_id: Búsquedas rápidas de comentarios.