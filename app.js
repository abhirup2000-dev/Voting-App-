const express = require('express')
const app = express()

app.use(express.json())



const port = 3004
app.listen(port, ()=>{
  console.log(`Server running on http://localhost:${port}`)
})