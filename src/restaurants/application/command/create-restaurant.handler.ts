import { TryCatchService } from "../../../common/method-decorator/trycatch-transaction.decorator";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreateRestaurnatCommand } from "./create-restaurant.command";
import { CreateRestaurnatOutput } from "../../../restaurants/interface/dtos/create-restaurant.dto";
import { Injectable } from "@nestjs/common";
import { RestaurantRepository } from "../../../restaurants/infra/db/repository/restaurant.repository";
import { CategoryService } from "../service/category.service";

@Injectable()
@CommandHandler(CreateRestaurnatCommand)
export class CreateRestaurnatHandler implements ICommandHandler<CreateRestaurnatCommand> {
    constructor(
        private readonly restaurantRepo : RestaurantRepository,
        private readonly categoryServise : CategoryService,
    ) {}

    // TODO - 레스토랑 생성 로직에서 레스토랑 트랜잭션이 실패하는 경우 카테고리 생성은 롤백을 해야되는지, 아니면 그냥 두는지 고민이 필요함.
    //        개인적인  생각으로는 실패로 retry 로직을 구현하더라도 동일한 값이 반복해서 들어 올 것이므로, 크게 문제가 되지 않는다면 일단 그냥 두는 것이 방법이라고 생각함.
    @TryCatchService('/CreateRestaurnatHandler/execute')
    async execute(
        command: CreateRestaurnatCommand
    ): Promise<CreateRestaurnatOutput> {
        const { name, coverImage, address, categoryName, authOwner } = command;
        // 레스토랑 생성
        const newGenRestaurant = await this.restaurantRepo.createRestaurant({name, coverImage, address, categoryName});
        // 유저는 입력 받은 유저
        newGenRestaurant.owner = authOwner;
        // 입력 받은 카테고리 네임이 있으면 가져오고 없으면 생성 -> 별도의 카테고리 서비스로 분리함
        let category = await this.categoryServise.getOrCreateCategory(categoryName);
        // 레스토랑 카테고리 추가
        newGenRestaurant.category = category;
        // 레스토랑 저장
        await this.restaurantRepo.saveRestaurant(newGenRestaurant);
        // 성공 시 true
        return { ok: true }
    }
}