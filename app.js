const express = require('express')
const app = express()

const DatabaseConnect = require('./app/config/dcon')
DatabaseConnect()

app.use(express.json())



const port = 3004
app.listen(port, ()=>{
  console.log(`Server running on Host http://localhost:${port}`)
})