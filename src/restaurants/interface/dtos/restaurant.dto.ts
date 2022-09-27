import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { CoreOutput } from "../../../common/dtos/output.dto";
import { RestaurantEntity } from "../../infra/db/entities/restaurant.entity";


@InputType()
export class RestaurantInput {
    @Field(tpye => Number)
    restaurantId : number;
}

@ObjectType()
export class RestaurantOutput extends CoreOutput {
    @Field(type => RestaurantEntity, {nullable: true})
    restaurant?: RestaurantEntity;
}