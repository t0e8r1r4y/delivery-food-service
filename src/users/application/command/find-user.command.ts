import { ICommand } from '@nestjs/cqrs';

export class FindUserById implements ICommand {
    constructor(readonly id : number) {}
}