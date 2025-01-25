import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
dotenv.config()

const secret = process.env.SECRET

const generarToken = (usuario) => {
  // El payload incluye información básica del usuario.
  const payload = {
    id: usuario.id,
    username: usuario.username
  }

  // Genera el token con un tiempo de expiración.
  return jwt.sign(payload, secret, { expiresIn: '1h' })
}

const jstMiddleware = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1] // Formato: "Bearer <token>"

  if (!token) {
    return res.status(401).json({ message: 'No se proporcionó un token' })
  }

  try {
    const decoded = jwt.verify(token, secret) // Decodifica el token.
    req.usuario = decoded // Adjunta el payload al objeto `req`.
    next()
  } catch (error) {
    return res.status(403).json({ message: 'Token inválido o expirado' })
  }
}

const verifyTokenSocket = (socket, next) => {
  const token = socket.handshake.auth.token // El cliente envía el token al conectarse

  if (!token) {
    const err = new Error('Token no proporcionado')
    err.data = { status: 401 }
    return next(err) // Devuelve un error al cliente
  }

  try {
    const decoded = jwt.verify(token, secret)
    socket.user = decoded // Agrega los datos del usuario al socket
    next() // Continúa- con la conexión
  } catch (error) {
    const err = new Error('Token inválido')
    err.data = { status: 403 }
    return next(err) // Devuelve un error al cliente
  }
}

export { generarToken, jstMiddleware, verifyTokenSocket }
