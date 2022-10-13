const express = require('express')
const app = express()
const morgan =require('morgan')
const router = require('./rotas')
const conn = require('./db/conn')
const User = require('./models/User')



app.use(express.json())
app.use(morgan('dev'))
app.use('/',router)


conn.sync()
.then(()=>{
  app.listen(3000);
}).catch((err)=>console.log(err))
