import { Test } from "@nestjs/testing";
import { CONFIG_OPTIONS } from "src/common/common.constants";
import { MailService } from "./mail.service"

import got from 'got';
import * as FormData from 'form-data';

jest.mock('got');
jest.mock('form-data');

const TEST_DOMAIN = 'test-domain';

describe('MailService Test', () => {
    let service : MailService;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                MailService,
                {
                    provide: CONFIG_OPTIONS,
                    useValue: {
                        apiKey: 'test-apiKey',
                        domain: TEST_DOMAIN,
                        fromEmail: 'test-fromEmail',
                    }
                }
            ]
        }).compile();
        service = module.get<MailService>(MailService);
    })

    it('should be defined', () => {
        expect(service).toBeDefined();
    })

    it.todo('sendBerificationEmail');
    describe('sendVerificationEmail', () => {
        it('sendEmail 메서드를 호출합니다. ', () => {
            const sendVerificationEmailInput = {
                email: 'email',
                code: 'code',
            };

            // spy function을 사용하지 않으면 다른 it 테스트 케이스에서 영향을 주게 된다.
            // service.sendEmail = jest.fn();
            jest.spyOn(service, 'sendEmail').mockImplementation(async() => true);
            service.sendVerificationEmail(
                sendVerificationEmailInput.email,
                sendVerificationEmailInput.code,
            );

            expect(service.sendEmail).toHaveBeenCalledTimes(1);
            expect(service.sendEmail).toHaveBeenCalledWith(
                'Verify Your Email',
                'test',
                [
                    { key: 'code', value: sendVerificationEmailInput.code },
                    { key: 'username', value: sendVerificationEmailInput.email },
                ],
            );
        });
    });

    // 아래 코드는 서비스에서 직접 작성한 코드로, 해당 값을 Mocking Param으로 사용
    // 'Verify Your Email', 'test', [
    //     {key: 'code', value: code },
    //     {key: 'username', value: email } ]

    it.todo('sendEmail');
    describe('sendEmail', () => {
        it('send email', async () => {
            const sendVerificationEmailInput = {
                email: 'email',
                code: 'code',
            };

            const sendEmailInput = {
                subject : 'Verify Your Email',
                template : 'test',
                emailVars :[
                    {key: 'code', value: sendVerificationEmailInput.code }, 
                    {key: 'username', value: sendVerificationEmailInput.email }
                ]
            };

            const isTrue = service.sendEmail(sendEmailInput.subject, sendEmailInput.template, sendEmailInput.emailVars);
            const formSpy = jest.spyOn(FormData.prototype, "append");
            // sendEmailInput에서 배열로 주어지는 갯수만큼 값을 더해가는 구조.
            // 다만 테스트에서 아래와 같이 길이 값을 넣어주는 것이 적절한지, 아니면 정답을 하드코딩해서 넣어주는 것이 맞는지 의문
            expect(formSpy).toHaveBeenCalledTimes( 4 + sendEmailInput.emailVars.length );

            expect(got.post).toHaveBeenCalledTimes(1);
            expect(got.post).toHaveBeenCalledWith(
                `https://api.mailgun.net/v3/${TEST_DOMAIN}/messages`,
                expect.any(Object),
            );
            expect(isTrue).toBeTruthy();
        });

        it('got에서 실패하는 경우 false를 리턴함.',async () => {
            jest.spyOn(got, 'post').mockImplementation(() => {
                throw new Error();
            });
           const isFalse = await service.sendEmail("","",[]); 
           expect(isFalse).toBeFalsy();
        });
    })

}); // end UT