import got from "got";
import * as FormData from 'form-data' // https://github.com/form-data/form-data/issues/484
import { Inject, Injectable } from "@nestjs/common";
import { CONFIG_OPTIONS } from "../common/common.constants";
import { EmailVar, MailModuleOptions } from "./mail.interfaces";

@Injectable()
export class MailService {
    constructor(
        @Inject(CONFIG_OPTIONS) private readonly options: MailModuleOptions
    ) {}


    sendVerificationEmail(email: string, code:string) {
        this.sendEmail('Verify Your Email', 'test', [
            { key: 'code', value: code },
            { key: 'username', value: email }
        ]);
    }

    /**
     * 메일건에서 사용하는 입력양식입니다. 아래 내용에 맞추어 post 코드를 작성
     * 
     * 'YXBpOllPVVJfQVBJX0tFWQ=='
     * curl -s --user 'api:YOUR_API_KEY' \
	 * https://api.mailgun.net/v3/YOUR_DOMAIN_NAME/messages \
	 * -F from='Excited User <mailgun@YOUR_DOMAIN_NAME>' \
	 * -F to=YOU@YOUR_DOMAIN_NAME \
	 * -F to=bar@example.com \
	 * -F subject='Hello' \
	 * -F text='Testing some Mailgun awesomeness!'
     */
    async sendEmail( 
        subject : string, template : string, eamilVars : EmailVar[] 
    ) : Promise<Boolean> {
        const form = new FormData();
        form.append('from', `Terry form Number Eats <mailgun@${this.options.domain}>`)
        form.append('to', `terryakishin0814@gmail.com`);
        form.append('subject', subject);
        form.append('template', template);
        eamilVars.forEach(eVar => form.append(`v:${eVar.key}`, eVar.value));

        try {
            await got.post(
                `https://api.mailgun.net/v3/${this.options.domain}/messages`, 
                {
                    headers: {
                        "Authorization": `Basic ${Buffer.from(`api:${this.options.apiKey}`).toString('base64')}`
                    },
                body: form,
            });
            
            return true;
        } catch (error) {
            console.log(error);
            return false;
        }
    }
}

