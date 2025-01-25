import pool from '../utils/db.js'
import { customAlphabet } from 'nanoid'
import bcrypt from 'bcrypt'
import { generarToken } from '../utils/auth.js'

const userController = {
  crearUsuario: async (req, res) => {
    try {
      const generateId = customAlphabet('1234567890abcdef', 4)
      const id = generateId()

      // Extrae la información del cuerpo de la solicitud
      const { username, password } = req.body
      console.log(req)
      //Valida que los campos requeridos no estén vacíos
      if (!username || !password) {
        return res
          .status(400)
          .json({ message: 'Username y contraseña son requeridos' })
      }

      //Hashea la contraseña antes de almacenarla
      const saltRounds = 10
      const hashedPassword = await bcrypt.hash(password, saltRounds)

      // Inserta el usuario en la base de datos
      const result = await pool.query(
        'INSERT INTO userdb (id, username, passwordd) VALUES ($1, $2, $3)',
        [id, username, hashedPassword]
      )

      res
        .status(201)
        .json({ message: 'Usuario creado', data: { id, username } })
    } catch (error) {
      res
        .status(500)
        .json({ message: 'Error al crear usuario', error: error.message })
    }
  },
  eliminarUsuario: async (req, res) => {
    try {
      const { id } = req.params

      const result = await pool.query('DELETE FROM userdb WHERE id = $1', [id])

      if (result.rowCount === 0) {
        return res.status(404).json({ message: 'Usuario no encontrado' })
      }

      res.status(200).json({ message: 'Usuario eliminado' })
    } catch (error) {
      res
        .status(500)
        .json({ message: 'Error al eliminar usuario', error: error.message })
    }
  },
  login: async (req, res) => {
    const { username, password } = req.body

    try {
      const result = await pool.query(
        'SELECT * FROM userdb WHERE username = $1',
        [username]
      )

      if (result.rowCount === 0) {
        return res.status(401).json({ message: 'Usuario no encontrado' })
      }

      const usuario = result.rows[0]
      // Suponiendo que usas bcrypt para las contraseñas.
      const passwordValido = await bcrypt.compare(password, usuario.passwordd)

      if (!passwordValido) {
        return res.status(401).json({ message: 'Contraseña incorrecta' })
      }

      const token = generarToken(usuario)
      res.status(200).json({ message: 'Inicio de sesión exitoso', token })
    } catch (error) {
      res
        .status(500)
        .json({ message: 'Error al autenticar', error: error.message })
    }
  }
}

export { userController }
