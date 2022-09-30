import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { IsString, Length } from "class-validator";
import { CoreEntity } from "../../../../common/entities/core.entity";
import { Column, Entity, OneToMany } from "typeorm";
import { RestaurantEntity } from "./restaurant.entity";
import { type } from "os";

// GraphQL과 TypeORM을 함께 사용함 - DB에 model을 생성하고 자동으로 graphQL에 스키마를 작성하기 위한 목적
// Entity를 기준으로 dto를 변경하도록 함
// 테스트는 graphql, database, validation을 위한 3번 테스트가 필요함
@InputType( 'CategoryInputType'  ,{isAbstract:true})
@ObjectType()   // for graphQL
@Entity('category')       // for typeORM
export class CategoryEntity extends CoreEntity {
    
    // describe restaurant side of graphQL
    @Field(type => String)
    @Column({unique : true})
    @IsString()
    @Length(5)
    name : string;

    @Field(type => String, {nullable: true})
    @Column( {nullable: true} )
    @IsString()
    coverImage : string;

    @Field(type=>String)
    @Column({unique:true})
    @IsString()
    slug : string;

    @Field(type => [RestaurantEntity])
    @OneToMany(
        type => RestaurantEntity,
        restaurant => restaurant.category,
    )
    restaurants: RestaurantEntity[];

}