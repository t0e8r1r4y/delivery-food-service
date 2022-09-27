import { Field, InputType, Int, ObjectType, PickType } from "@nestjs/graphql";
import { CoreOutput } from "../../../common/dtos/output.dto";
import { DishEntity } from "../../infra/db/entities/dish.entitiy";


@InputType()
export class CreateDishInput extends PickType(DishEntity, [
    'name',
    'price',
    'description',
    'options',
]){
    @Field(type => Int)
    restaurantId:number;
}

@ObjectType()
export class CreateDishOutput extends CoreOutput {}