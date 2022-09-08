import { ICommand } from '@nestjs/cqrs';

export class VerifyEmailCommand implements ICommand {
    constructor( readonly code : string ) {}
}