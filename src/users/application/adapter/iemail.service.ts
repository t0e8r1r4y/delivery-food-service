export interface IEmailService {
    sendUserAccountJoinVerification : ( email : string, code : string ) => Promise<void>;
}