import { ICommand } from "@nestjs/cqrs";
import { UserEntity } from "src/users/infra/db/entities/user.entity";

export class CreateRestaurnatCommand implements ICommand {
    constructor(
        readonly name : string,
        readonly coverImage : string,
        readonly address : string,
        readonly categoryName : string,
        readonly authOwner : UserEntity,
    ) {}
}