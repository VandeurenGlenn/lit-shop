import nodemailer from 'nodemailer'
import { config } from '../helpers/config.js'
const transporter = nodemailer.createTransport({
  service: config.email.service,
  auth: {
    user: config.email.auth.user,
    pass: config.email.auth.pass
  }
})

export const sendMail = async (to, subject, html) => {
  return transporter.sendMail({
    from: config.email.sender,
    to,
    subject,
    html
  })
}

export const sendOrderMail = async (order, amount, email, shipping) => {
  const html = `
        <h1>Bestelling ontvangen</h1>
        <p>Hartelijk dank voor uw bestelling.</p>
        <p> We sturen je een email van zodra je bestelling verzonden is.</p>
        <p><a href="https://hellonewme.be/order?order=${order}">Klik hier</a> om je bestelling te bekijken.</p>
        <p>Order ID: ${order}</p>
        <p>Order total: ${amount}</p>
    `
  return sendMail(email, 'Bestelling Ontvangen', html)
}

export const sendOrderCanceledMail = async (order, amount, email, reason = 'door klant') => {
  const html = `
        <h1>Order canceled</h1>
        <p>We hebben uw bestelling verwijderd.</p>
        <p>Als u vragen heeft, aarzel dan niet om contact met ons op te nemen.</p>
        <p>Order ID: ${order}</p>
        <p>Order total: ${amount}</p>

        <strong>Reden voor annulering: ${reason}</strong>
    `
  return sendMail(email, 'Bestelling verwijderd', html)
}
