import { Field, InputType, Int, ObjectType, PickType } from "@nestjs/graphql";
import { DishOption } from "../../restaurants/entities/dish.entitiy";
import { CoreOutput } from "../../common/dtos/output.dto";
import { Order } from "../entities/order.entity";

@InputType()
class CreateOrderItemInput{
    @Field(type=> Int)
    dishId : number;

    @Field(type=>DishOption, {nullable: true})
    options?: DishOption[];
}

@InputType()
// export class CreateOrderInput extends PickType(Order, ['items']) {
export class CreateOrderInput {
    @Field(type=> Int)
    restaurantId: number;

    @Field(type => [CreateOrderItemInput])
    items: CreateOrderItemInput[];
}

@ObjectType()
export class CreateOrderOutput extends CoreOutput {}