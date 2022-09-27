import { Injectable } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { DeleteRestaurantCommand } from "./delete-restaurant.command";
import { TryCatchService } from "../../../common/method-decorator/trycatch-transaction.decorator";
import { DeleteRestaurantOutput } from "../../../restaurants/interface/dtos/delete-restaurant.dto";
import { RestaurantRepository } from "src/restaurants/infra/db/repository/restaurant.repository";
import { CategoryService } from "../service/category.service";

@Injectable()
@CommandHandler(DeleteRestaurantCommand)
export class DeleteRestaurantHandler implements ICommandHandler<DeleteRestaurantCommand>{
    constructor(
        private readonly restaurantRepository : RestaurantRepository,
    ){}

    @TryCatchService('/DeleteRestaurantHandler/execute')
    async execute(command: DeleteRestaurantCommand): Promise<DeleteRestaurantOutput> {
        const { restaurantId, authOwner } = command;
        //삭제할 레스토랑을 찾는다.
        const restaurant = await this.restaurantRepository.getOneRestaurantById(restaurantId);
        // 입력받은 주인정보와 레스토랑 주인이 일치하는지 확인한다.
        if(restaurant.owenrId != authOwner.id) {
            throw new Error('/입력 받은 사용자가 소유한 레스토랑이 아닙니다.');
        }
        // 일치하면 삭제한다.
        await this.restaurantRepository.deleteRestaurant(restaurant);
        // 커밋하여 영구 반영한다.
        await this.restaurantRepository.commitTransaction();
        return { ok : true }
    }
}