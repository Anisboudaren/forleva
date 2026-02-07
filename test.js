const { Client } = require('pg')

const client = new Client({
  host: '127.0.0.1',
  port: 5432,
  database: 'forleva_db',
  user: 'forleva_user',
  password: 'forleva_password',
})

client.connect()
  .then(() => {
    console.log('✅ Connected successfully!')
    return client.query('SELECT current_user, current_database()')
  })
  .then(result => {
    console.log('User:', result.rows[0].current_user)
    console.log('Database:', result.rows[0].current_database)
    client.end()
  })
  .catch(err => {
    console.error('❌ Connection failed:', err.message)
    client.end()
  })