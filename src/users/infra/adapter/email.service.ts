import { Injectable } from "@nestjs/common";
import { IEmailService } from "../../../users/application/adapter/iemail.service";
import { MailService as ExternalEmailService } from '../../../mail/mail.service'

@Injectable()
export class EmailService implements IEmailService {

    constructor(
        private emailService: ExternalEmailService,
    ) {}

    async sendUserAccountJoinVerification(email: any, code: any) : Promise<void> {
        this.emailService.sendVerificationEmail(email, code);
    }
}