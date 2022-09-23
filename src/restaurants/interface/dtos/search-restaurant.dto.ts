import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { PaginationInput, PaginationOutput } from "../../../common/dtos/pagenation.dto";
import { RestaurantEntity } from "../../infra/db/entities/restaurant.entity";

@InputType()
export class SearchRestaurantInput extends PaginationInput{
    @Field(type => String)
    query: string;
}


@ObjectType()
export class SearchRestaurantOutput extends PaginationOutput {
    @Field(type => [RestaurantEntity], { nullable: true })
    restaurants?: RestaurantEntity[];
}