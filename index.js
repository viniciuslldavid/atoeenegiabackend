const express = require('express');
     const nodemailer = require('nodemailer');
     const cors = require('cors');
     require('dotenv').config({ path: './.env' });

     const app = express();

     // Configura CORS
     app.use(cors({
       origin: ['http://localhost:5173', 'https://aotenergia.netlify.app']
     }));
     app.use(express.json());

     // Log das variáveis de ambiente
     console.log('Configurações de email:', {
       host: process.env.EMAIL_HOST,
       port: process.env.EMAIL_PORT,
       user: process.env.EMAIL_USER,
       to: process.env.TO_EMAIL
     });

     // Rota para manter o serviço ativo
     app.get('/ping', (req, res) => res.status(200).json({ message: 'Alive' }));

     app.post('/send', async (req, res) => {
       const { name, email, phone, subject, message } = req.body;

       // Validação básica
       if (!name || !email || !subject || !message) {
         return res.status(400).json({ message: 'Campos obrigatórios não preenchidos' });
       }

       const transporter = nodemailer.createTransport({
         host: process.env.EMAIL_HOST,
         port: parseInt(process.env.EMAIL_PORT),
         secure: process.env.EMAIL_PORT === '465', // true para 465, false para 587
         auth: {
           user: process.env.EMAIL_USER,
           pass: process.env.EMAIL_PASS,
         },
       });

       try {
         await transporter.sendMail({
           from: `"Contato Ato Energia" <${process.env.EMAIL_USER}>`,
           to: process.env.TO_EMAIL,
           subject: `Nova Mensagem de Contato: ${subject}`,
           html: `
             <!DOCTYPE html>
             <html lang="pt-BR">
             <head>
               <meta charset="UTF-8">
               <meta name="viewport" content="width=device-width, initial-scale=1.0">
               <style>
                 body {
                   font-family: Arial, sans-serif;
                   background-color: #f4f4f4;
                   margin: 0;
                   padding: 0;
                 }
                 .container {
                   max-width: 600px;
                   margin: 20px auto;
                   background-color: #ffffff;
                   border-radius: 8px;
                   box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                   overflow: hidden;
                 }
                 .header {
                   background: linear-gradient(to right, #2563eb, #1e40af);
                   padding: 20px;
                   text-align: center;
                 }
                 .header img {
                   max-width: 150px;
                 }
                 .content {
                   padding: 20px;
                   color: #333333;
                 }
                 .content h2 {
                   color: #1e40af;
                   font-size: 24px;
                   margin-bottom: 20px;
                 }
                 .content p {
                   font-size: 16px;
                   line-height: 1.6;
                   margin: 10px 0;
                 }
                 .content .label {
                   font-weight: bold;
                   color: #1e40af;
                 }
                 .footer {
                   background-color: #f4f4f4;
                   padding: 15px;
                   text-align: center;
                   font-size: 14px;
                   color: #666666;
                 }
                 .footer a {
                   color: #2563eb;
                   text-decoration: none;
                 }
                 @media only screen and (max-width: 600px) {
                   .container {
                     width: 100%;
                     margin: 10px;
                   }
                   .header img {
                     max-width: 120px;
                   }
                   .content h2 {
                     font-size: 20px;
                   }
                   .content p {
                     font-size: 14px;
                   }
                 }
               </style>
             </head>
             <body>
               <div class="container">
                 <div class="header">
                   <img src="https://solutudo-cdn.s3-sa-east-1.amazonaws.com/prod/adv_ads/62b31950-8c24-4af2-b5ab-79a7ac1e09ff/62ff8c4f-27a8-4cdb-9226-33f8ac1e09ff.png" alt="Ato Energia Logo" />
                 </div>
                 <div class="content">
                   <h2>Nova Mensagem de Contato</h2>
                   <p>Prezado(a) equipe Ato Energia,</p>
                   <p>Uma nova mensagem foi recebida através do formulário de contato do site. Abaixo estão os detalhes:</p>
                   <p><span class="label">Nome:</span> ${name}</p>
                   <p><span class="label">Email:</span> ${email}</p>
                   <p><span class="label">Telefone:</span> ${phone || 'Não informado'}</p>
                   <p><span class="label">Assunto:</span> ${subject}</p>
                   <p><span class="label">Mensagem:</span><br>${message}</p>
                   <p>Por favor, entre em contato com o remetente o mais breve possível.</p>
                 </div>
                 <div class="footer">
                   <p>Ato Energia | Soluções em Energia Sustentável</p>
                   <p>Avenida Belarmino Cotta Pacheco, 411, Santa Mônica, Uberlândia, MG, 38408-168</p>
                   <p><a href="mailto:contato@atoenergia.com">contato@atoenergia.com</a> | (34) 98421-4728</p>
                   <p><a href="https://www.atoenergia.com">www.atoenergia.com</a></p>
                 </div>
               </div>
             </body>
             </html>
           `,
         });
         res.status(200).json({ message: 'E-mail enviado com sucesso!' });
       } catch (err) {
         console.error('Erro ao enviar e-mail:', err.message, err.stack);
         res.status(500).json({ message: 'Erro ao enviar e-mail.', error: err.message });
       }
     });

     // Rota de teste para email
     app.get('/test-email', async (req, res) => {
       const transporter = nodemailer.createTransport({
         host: process.env.EMAIL_HOST,
         port: parseInt(process.env.EMAIL_PORT),
         secure: process.env.EMAIL_PORT === '465',
         auth: {
           user: process.env.EMAIL_USER,
           pass: process.env.EMAIL_PASS,
         },
       });

       try {
         await transporter.sendMail({
           from: `"Contato Ato Energia" <${process.env.EMAIL_USER}>`,
           to: process.env.TO_EMAIL,
           subject: 'Teste de Email',
           html: '<p>Este é um email de teste.</p>',
         });
         res.status(200).json({ message: 'Email de teste enviado com sucesso!' });
       } catch (err) {
         console.error('Erro no teste de email:', err);
         res.status(500).json({ message: 'Erro ao enviar email de teste.', error: err.message });
       }
     });

     const PORT = process.env.PORT || 5000;
     app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));