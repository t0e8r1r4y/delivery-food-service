import {Field, InputType, ObjectType } from "@nestjs/graphql";
import { PaginationInput, PaginationOutput } from "../../../common/dtos/pagenation.dto";
import { Category } from "../../infra/db/entities/category.entity";

@InputType()
export class CategoryInput extends PaginationInput {
    @Field(type=> String)
    slug: string;
}

@ObjectType()
export class CategoryOutput extends PaginationOutput {
    @Field(type => Category, {nullable: true})
    category?:Category;
}