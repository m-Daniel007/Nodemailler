const nodemailer = require("nodemailer");

class Email {
  async enviaEmail() {
    const transportador = nodemailer.createTransport({
      host: "smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: "ed47aa3cf09881",
        pass: "1a380824b1421d",
      },
    });
    const info = await transportador.sendMail(this);
  }
}

class EmailVerificacao extends Email {
  constructor(usuario, endereco) {
    super();
    this.from = '"Api-Cadastro"<noreply@api-cadastro.com.br>';
    this.to = usuario.email;
    this.subject = "Confirmação de e-mail";
    this.html = `<h1>Olá ${usuario.name},</h1> verifique o email ${usuario.email} aqui <a href="${endereco}">${endereco}</a>`;
  }
}

class RecuperaSenha extends Email {
  constructor(usuario, endereco, senha) {
    super();
    this.from = '"Api-Cadastro"<noreply@api-cadastro.com.br>';
    this.to = usuario.email;
    this.subject = "Recuperação de senha";
    this.html = `<h1>Olá ${usuario.name},</h1> <p>Sua nova senha é ${senha}</p>Clique no link abaixo: <br> <a href="${endereco}">${endereco}</a>`;
  }
}

module.exports = { EmailVerificacao, RecuperaSenha };
