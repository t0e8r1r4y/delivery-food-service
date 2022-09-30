import { Injectable } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { EditRestaurantCommand } from "./edit-restaurant.command";
import { TryCatchService } from "../../../common/method-decorator/trycatch-transaction.decorator";
import { EditRestaurantInput, EditRestaurantOutput } from "../../../restaurants/interface/dtos/edit-restaurant.dto";
import { RestaurantRepository } from "../../../restaurants/infra/db/repository/restaurant.repository";
import { CategoryService } from "../service/category.service";
import { CategoryEntity } from "src/restaurants/infra/db/entities/category.entity";

@Injectable()
@CommandHandler(EditRestaurantCommand)
export class EditRestaurantHandler implements ICommandHandler<EditRestaurantCommand> {
    constructor(
        private readonly restaurantRepo : RestaurantRepository,
        private readonly categoryServise : CategoryService,
    ) {}

    @TryCatchService('/EditRestaurantHandler/execute')
    async execute(command: EditRestaurantCommand): Promise<EditRestaurantOutput> {
        const { restaurantId, authOwner, name, coverImage, address, categoryName } = command;
        // 수정할 레스토랑 찾기
        const restaurant = await this.restaurantRepo.getOneRestaurantById(restaurantId);
        // 레스토랑과 입력으로 받은 주인이 동일한 id인지 확인
        if( restaurant.owenrId !== authOwner.id ){
            throw new Error('/조회한 레스토랑의 점주 정보와 입력받은 정보가 일치하지 않습니다.');
        }
        // 레스토랑 관련 수정 값 변경
        if( name ) {
            restaurant.name = name;
        }
        // cover Image 관련 수정
        if( coverImage ) {
            restaurant.coverImage = coverImage;
        }
        // 주소 수정
        if( address ) {
            restaurant.address = address;
        }
        // 카테고리 수정
        let category : CategoryEntity = null;
        if(categoryName) {
            category = await this.categoryServise.getOrCreateCategory(categoryName);
        }
        // 수정 값 저장
        await this.restaurantRepo.saveRestaurant(restaurant);
        await this.restaurantRepo.commitTransaction();

        return { ok: true, };
    }
}