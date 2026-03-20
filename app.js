const express = require('express')
const app = express()

app.use(express.json())

const DatabaseConnect = require('./app/config/dbcon')
DatabaseConnect()




const port = 3004
app.listen(port, ()=>{
  console.log(`Server running on Host http://localhost:${port}`)
})