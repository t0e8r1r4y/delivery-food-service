import { Field, ObjectType } from "@nestjs/graphql";
import { CoreOutput } from "../../../common/dtos/output.dto";
import { CategoryEntity } from "../../infra/db/entities/category.entity";

@ObjectType()
export class AllCategoriesOutput extends CoreOutput{
    @Field(type => [CategoryEntity], {nullable:true})
    categories?:CategoryEntity[]
}