import { ICommand } from "@nestjs/cqrs";
import { UserEntity } from "src/users/infra/db/entities/user.entity";

export class DeleteRestaurantCommand implements ICommand {
    constructor(
        readonly restaurantId : number,
        readonly authOwner : UserEntity,
    ) {}
}