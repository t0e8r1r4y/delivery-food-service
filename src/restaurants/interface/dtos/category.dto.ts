import {Field, InputType, ObjectType } from "@nestjs/graphql";
import { PaginationInput, PaginationOutput } from "../../../common/dtos/pagenation.dto";
import { CategoryEntity } from "../../infra/db/entities/category.entity";

@InputType()
export class CategoryInput extends PaginationInput {
    @Field(type=> String)
    slug: string;
}

@ObjectType()
export class CategoryOutput extends PaginationOutput {
    @Field(type => CategoryEntity, {nullable: true})
    category?:CategoryEntity;
}