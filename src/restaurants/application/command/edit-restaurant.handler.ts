import { Injectable } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { EditRestaurantCommand } from "./edit-restaurant.command";
import { TryCatchService } from "../../../common/method-decorator/trycatch-transaction.decorator";
import { EditRestaurantInput, EditRestaurantOutput } from "../../../restaurants/interface/dtos/edit-restaurant.dto";

@Injectable()
@CommandHandler(EditRestaurantCommand)
export class EditRestaurantHandler implements ICommandHandler<EditRestaurantCommand> {
    constructor() {}

    @TryCatchService('/EditRestaurantHandler/execute')
    async execute(command: EditRestaurantCommand): Promise<EditRestaurantOutput> {
        const { restaurantId, authOwner } = command;
        // 수정할 레스토랑 찾기
        // 레스토랑과 입력으로 받은 주인이 동일한 id인지 확인
        // 수정 값 반영
        // 수정 값 저장

        return { ok: true, };
    }
}