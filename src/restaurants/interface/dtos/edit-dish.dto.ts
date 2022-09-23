import { Field, InputType, Int, ObjectType, PartialType, PickType } from "@nestjs/graphql";
import { CoreOutput } from "../../../common/dtos/output.dto";
import { Dish } from "../../infra/db/entities/dish.entitiy";

@InputType()
export class EditDishInput extends PickType(
    PartialType(Dish), [
        'name',
        'options',
        'price',
        'description',
    ]
) {
    @Field(type=>Int)
    dishId : number;
}

@ObjectType()
export class EditDishOutput extends CoreOutput {}