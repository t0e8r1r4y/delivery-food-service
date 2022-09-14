import { ICommand } from "@nestjs/cqrs";

export class EditUserCommand implements ICommand {
    constructor(
        readonly id : number,
        readonly email? : string,
        readonly password? : string,
    ) {}
}