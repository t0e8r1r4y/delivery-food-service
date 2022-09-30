import { ICommand } from "@nestjs/cqrs";
import { UserEntity } from "src/users/infra/db/entities/user.entity";

export class EditRestaurantCommand implements ICommand {
    constructor(
        readonly restaurantId : number,
        readonly name : string,
        readonly coverImage : string,
        readonly address : string,
        readonly categoryName : string,
        readonly authOwner : UserEntity,
    ) {}
}