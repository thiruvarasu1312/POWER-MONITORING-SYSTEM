import express from 'express'
import mysql from 'mysql2'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

/* ------------------ MySQL Connection ------------------ */
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
})

db.connect((err) => {
  if (err) {
    console.error('❌ MySQL connection failed:', err.message)
    return
  }
  console.log('✅ MySQL Connected Successfully')
})

/* ------------------ JWT Verification Middleware ------------------ */
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'No token provided' })
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Invalid or expired token' })
    }
    req.user = decoded
    next()
  })
}

/* ------------------ SIGNUP API ------------------ */
app.post('/api/signup', (req, res) => {
  const { email, password, name, role } = req.body

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Email, password, and name required' })
  }

  const hashedPassword = bcrypt.hashSync(password, 10)
  const sql = 'INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)'

  db.query(sql, [email, hashedPassword, name, role || 'operator'], (err, results) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: 'Email already exists' })
      }
      return res.status(500).json({ error: 'Database error: ' + err.message })
    }

    res.status(201).json({
      message: 'User registered successfully',
      userId: results.insertId,
      email
    })
  })
})

/* ------------------ LOGIN API ------------------ */
app.post('/api/login', (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' })
  }

  const sql = 'SELECT * FROM users WHERE email = ?'

  db.query(sql, [email], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' })
    }

    if (results.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const user = results[0]
    const isMatch = bcrypt.compareSync(password, user.password_hash)

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    )

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    })
  })
})

/* ------------------ GET USER PROFILE (Protected) ------------------ */
app.get('/api/profile', verifyToken, (req, res) => {
  const sql = 'SELECT id, email, name, role FROM users WHERE id = ?'

  db.query(sql, [req.user.id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' })
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json(results[0])
  })
})

/* ------------------ GET ALL MACHINES (Protected) ------------------ */
app.get('/api/machines', verifyToken, (req, res) => {
  // Allow all authenticated users to see all machines
  const sql = 'SELECT * FROM machines ORDER BY created_at DESC'

  db.query(sql, [], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' })
    }
    res.json(results || [])
  })
})

/* ------------------ GET MACHINE DETAILS (Protected) ------------------ */
app.get('/api/machines/:id', verifyToken, (req, res) => {
  const sql = 'SELECT * FROM machines WHERE id = ?'

  db.query(sql, [req.params.id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' })
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Machine not found' })
    }

    res.json(results[0])
  })
})

/* ------------------ ADD NEW MACHINE (Protected) ------------------ */
app.post('/api/machines', verifyToken, (req, res) => {
  const { name, model, status } = req.body

  if (!name) {
    return res.status(400).json({ error: 'Machine name required' })
  }

  // Check if machine with same name already exists for this user
  db.query('SELECT id FROM machines WHERE name = ? AND user_id = ?', [name, req.user.id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' })
    }

    if (results.length > 0) {
      return res.status(400).json({ error: 'A machine with this name already exists' })
    }

    // Insert new machine
    const { type, location, rated_power, description } = req.body
    const sql = 'INSERT INTO machines (name, model, type, location, rated_power, description, status, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'

    db.query(sql, [name, model || 'Unknown', type, location, rated_power, description, status || 'active', req.user.id], (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Database error: ' + err.message })
      }

      res.status(201).json({
        message: 'Machine added successfully',
        machineId: results.insertId
      })
    })
  })
})

/* ------------------ UPDATE MACHINE (Protected) ------------------ */
app.put('/api/machines/:id', verifyToken, (req, res) => {
  const { name, model, type, location, rated_power, description, status } = req.body

  const sql = 'UPDATE machines SET name = ?, model = ?, type = ?, location = ?, rated_power = ?, description = ?, status = ? WHERE id = ? AND user_id = ?'

  db.query(sql, [name, model, type, location, rated_power, description, status, req.params.id, req.user.id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' })
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Machine not found' })
    }

    res.json({ message: 'Machine updated successfully' })
  })
})

/* ------------------ DELETE MACHINE (Protected) ------------------ */
app.delete('/api/machines/:id', verifyToken, (req, res) => {
  const sql = 'DELETE FROM machines WHERE id = ? AND user_id = ?'

  db.query(sql, [req.params.id, req.user.id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' })
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Machine not found' })
    }

    res.json({ message: 'Machine deleted successfully' })
  })
})

/* ------------------ GET ALERTS (Protected) ------------------ */
app.get('/api/alerts', verifyToken, (req, res) => {
  // Show alerts for all machines
  const sql = `SELECT a.*, m.name as machine_name FROM alerts a 
               JOIN machines m ON a.machine_id = m.id 
               ORDER BY a.created_at DESC LIMIT 50`

  db.query(sql, [], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' })
    }
    // Map machine_name to machine field expected by frontend
    const mappedResults = results.map(r => ({ ...r, machine: r.machine_name }))
    res.json(mappedResults || [])
  })
})

/* ------------------ CREATE ALERT (Protected) ------------------ */
app.post('/api/alerts', verifyToken, (req, res) => {
  const { machine_id, alert_type, severity, message } = req.body

  if (!machine_id || !alert_type) {
    return res.status(400).json({ error: 'Machine ID and alert type required' })
  }

  const sql = 'INSERT INTO alerts (machine_id, alert_type, severity, message) VALUES (?, ?, ?, ?)'

  db.query(sql, [machine_id, alert_type, severity || 'medium', message || ''], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' })
    }

    res.status(201).json({
      message: 'Alert created successfully',
      alertId: results.insertId
    })
  })
})

/* ------------------ RESOLVE ALERT (Protected) ------------------ */
app.put('/api/alerts/:id/resolve', verifyToken, (req, res) => {
  const sql = 'UPDATE alerts SET resolved = 1 WHERE id = ?'

  db.query(sql, [req.params.id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' })
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Alert not found' })
    }

    res.json({ message: 'Alert resolved successfully' })
  })
})

/* ------------------ HEALTH CHECK API ------------------ */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'Backend is running ✅',
    timestamp: new Date(),
    database: 'Connected'
  })
})

/* ------------------ 404 Handler ------------------ */
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

/* ------------------ START SERVER ------------------ */
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`📊 Health Check: http://localhost:${PORT}/api/health`)
  console.log(`🔐 JWT Secret: ${process.env.JWT_SECRET?.substring(0, 10)}...`)
})