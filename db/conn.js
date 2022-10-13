const {Sequelize} = require('sequelize')

const sequelize = new Sequelize('api_nodemailer','root', '',{
    host:'localhost',
    dialect:'mysql',
})
try{
    sequelize.authenticate()
    console.log('Conectado ao MYSQL!!')
}catch(error){
    console.log(`Não foi possivel se connectar:${error}`)
}

 module.exports = sequelize
