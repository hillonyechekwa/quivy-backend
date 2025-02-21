

export class SendMailDto {
    sender?: string
    recipients: string[]
    subject: string
    html: string
}
