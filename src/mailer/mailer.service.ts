import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// import { createTransport, SendMailOptions, Transporter } from 'nodemailer';
import { SendMailDto } from './dto/send-mail.dto';
import { Resend } from 'resend'

@Injectable()
export class MailerService {
  private resend: Resend
  constructor(private config: ConfigService) {
    this.resend = new Resend(this.config.get<string>('RESEND_API_KEY'))
  }


  async sendMail(mailData: SendMailDto) {
    const { sender, recipients, subject, html} = mailData
    
    const {data, error} = await this.resend.emails.send({
      from: sender,
      to: recipients,
      subject,
      html,
    })

    if (data) {
      return {success: true}
    }

    if (error) {
      return { success: false}
    }
  }

}
