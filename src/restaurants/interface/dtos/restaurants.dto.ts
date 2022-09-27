import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { PaginationInput, PaginationOutput } from "../../../common/dtos/pagenation.dto";
import { RestaurantEntity } from "../../infra/db/entities/restaurant.entity";

@InputType()
export class RestaurantsInput extends PaginationInput {
    restaurantId: number;
}

@ObjectType()
export class RestaurantsOutput extends PaginationOutput {
    @Field(type=> [RestaurantEntity], {nullable: true})
    restaurants? : RestaurantEntity[];
}