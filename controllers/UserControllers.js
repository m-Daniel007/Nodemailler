require("dotenv").config();
const User = require("../models/User");
const db = require("../db/conn");
const { EmailVerificacao, RecuperaSenha } = require("../helpers/Emails");
const bcrypt = require("bcrypt");
const crypto = require('crypto');


module.exports = class UserController {
  static async criaUsuario(req, res) {
    const { name, email, password } = req.body;

    if (!name) {
      return res.status(422).json({ message: "O nome é obrigatório" });
    }
    if (!email) {
      return res.status(422).json({ message: "O e-mail é obrigatório" });
    }

    if (!password) {
      return res.status(422).json({ message: "A senha é obrigatória" });
    }
    const userExists = await User.findOne({ where: { email: email } });

    if (userExists) {
      return res.status(422).json({ message: "O usuário já está cadastrado!" });
    }

    const passwordHash = await bcrypt.hashSync(password.toString(), 12);

    try {
      const usuario = await User.create({
        name,
        email,
        password: passwordHash,
        verifica_email: false,
      });

      const hashUserId = bcrypt.hashSync(usuario.id.toString(), 12);
      const endereco = process.env.BASE_URL + hashUserId;
      const emailVerificacao = new EmailVerificacao(usuario, endereco);
      emailVerificacao.enviaEmail().catch(console.log);

      return res.status(201).json({ message: "Usuario criado com sucesso, por favor verifique seu email!" });
    } catch (error) {
      return res.status(500).json(error.message);
    }
  }

  static async pegaUsuarios(req, res) {
    try {
      const user = await User.findAll({
        attributes: ["id", "name", "email", "verifica_email"],
        order: [
            ["id", "DESC"]
        ],
      });
      res.status(200).json(user);
    } catch (error) {
      return res.status(500).json(error.message);
    }
  }

  static async verificaEmail(req, res) {
    const { id } = req.params;

    try {
      const usuario = await User.findOne({ where: { id: id } });

      if (!usuario) {
        res.status(404).json({ message: `Usuário ${id} não encontrado!` });
        return;
      }

      if (usuario.verifica_email === true) {
        res.status(422).json({ message: `O email ${usuario.email} já está confirmado!` });
        return;
      }

      const emailConfirmado = await usuario.update({ verifica_email: true },
       { where: { id } });

      res.status(200).json({message: `O email do usuário  ${emailConfirmado.name} foi confirmado`,});

    } catch (error) {
      return res.status(500).json(error.message);
    }
  }

  static async login(req, res) {
    const { email, password } = req.body;

    try {
      if (!email) {
        return res.status(422).json({ message: "O e-mail é obrigatório" });
      }

      if (!password) {
        return res.status(422).json({ message: "A senha é obrigatória" });
      }

      const user = await User.findOne({ where: { email: email } });

      if (!user) {
        return res.status(404).json({ message: "O usuário não foi encontrado!" });
      }

      const checkPassword = await bcrypt.compare(password.toString(),user.password);

      if (!checkPassword) {
       return res.status(403).json({ message: "Dados invalidos!" });
      }

      if (user.verifica_email === false) {
        return res.status(422).json({ message: `Por favor, para  fazer login com usuário ${user.email},verifique seu e-mail !`});
      }

     return res.status(200).json({message:`PARABÉNS ${user.name.toUpperCase()}, você está logado!` })

    } catch (error) {
      return res.status(500).json(error.message);
    }

  }

  static async recuperarSenha(req,res){

    const { email } = req.body

    try {
      if (!email) {
        return res.status(422).json({ message: "O e-mail é obrigatório" });
      }
      const user = await User.findOne({ where: {email:email} })

      if(!user){
        return res.status(404).json({ message: "O usuário não foi encontrado!" });
      }

      const novaSenha = crypto.randomBytes(4).toString('HEX')
      const endereco = process.env.BASE_URL_RECURAR_SENHA ;
      const alteracaoSenha = new RecuperaSenha(user, endereco, novaSenha);
      alteracaoSenha.enviaEmail().catch(console.log);

      const senhaAlterada = await bcrypt.hashSync(novaSenha,8)

      await user.update({
        password:senhaAlterada
      }, {where: {email:email} })
      
   
      return res.status(200).json({message:`Sua nova senha foi enviada para o email:${user.email}!`})

    } catch (error) {
      return res.status(500).json(error.message);
    }

  }

  static async alterarDados(req,res){

    const { id } = req.params

    const user = await User.findByPk(id)

    if(!user){
      return res.status(404).json({message:` O usuário com Id ${id}, não foi encontrado!`})
    }

  const  {name, email,password}  = req.body

  if (!name) {
    return res.status(422).json({ message: "O nome é obrigatório" });
  }
  if (!email) {
    return res.status(422).json({ message: "O e-mail é obrigatório" });
  }

  if (!password) {
    return res.status(422).json({ message: "A senha é obrigatória" });
  }

  const passwordHash = await bcrypt.hashSync(password.toString(), 12);

  const novasInfos = {
    name, 
    email,
    password:passwordHash
  }

  try {
    
    await user.update(novasInfos,{where: {id:Number(id) }})
    return res.status(200).json({message:`Os dados do usuário ${user.name}, foram atualizados!`})
    
  } catch (error) {
    return res.status(500).json(error.message);
  }

  



  
  }

};
