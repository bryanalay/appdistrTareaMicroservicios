import pool from '../utils/db.js'

const messageController = {
  crearMensaje: async (username, mensaje) => {
    try {
      const result = await pool.query(
        'INSERT INTO messages ( username, content) VALUES ($1, $2)',
        [username, mensaje]
      )
      if (result.rowCount === 1) {
        console.log('mensaje guardado en base de datos')
      } else {
        throw new Error('No se pudo guardar el mensaje')
      }
    } catch (error) {
      console.log('error al guardar mensaje', error)
    }
  },
  getAllMessages: async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM messages order by id')

      res.status(200).json(result.rows)
    } catch (error) {
      res
        .status(500)
        .json({ message: 'Error al obtener mensajes', error: error.message })
    }
  }
}

export { messageController }
