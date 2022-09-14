export interface IEmailService {
    sendUserAccountJoinVerification : ( email, code) => Promise<void>;
}