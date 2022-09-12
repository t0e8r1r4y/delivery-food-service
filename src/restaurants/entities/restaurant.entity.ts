import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { IsString, Length } from "class-validator";
import { CoreEntity } from "../../common/entities/core.entity";
import { Column, Entity, ManyToOne, OneToMany, RelationId } from "typeorm";
import { Category } from "./category.entity";
import { User } from "../../users/infra/entities/user.entity";
import { Dish } from "./dish.entitiy";
import { Order } from "../../orders/entities/order.entity";

// GraphQL과 TypeORM을 함께 사용함 - DB에 model을 생성하고 자동으로 graphQL에 스키마를 작성하기 위한 목적
// Entity를 기준으로 dto를 변경하도록 함
// 테스트는 graphql, database, validation을 위한 3번 테스트가 필요함
@InputType( 'RestuarnatInputType' , {isAbstract:true})
@ObjectType()   // for graphQL
@Entity()       // for typeORM
export class Restaurant extends CoreEntity {
    
    // describe restaurant side of graphQL
    @Field(type => String)
    @Column()
    @IsString()
    @Length(5)
    name : string;

    @Field(type => String)
    @Column()
    @IsString()
    coverImage : string;

    @Field(type=>String, {nullable: true})
    @Column()
    @IsString()
    address : string;

    @Field(type => Category, {nullable: true})
    @ManyToOne(
        tpye => Category, 
        category =>category.restaurants,
        { nullable: true, onDelete: 'SET NULL', eager: true },
    )
    category: Category;

    @Field(type => User)
    @ManyToOne(
        tpye => User, 
        user => user.restaurants,
        { onDelete: 'CASCADE' },
    )
    owner: User;

    @Field(type=> [Order])
    @OneToMany(
        type => Order,
        order => order.restaurant,
    )
    orders: Order[]

    @RelationId((restaurant : Restaurant) => restaurant.owner )
    owenrId : number;

    @Field(type => [Dish], {nullable: true})
    @OneToMany(
        type => Dish,
        dish => dish.restaurant,
    )
    menu: Dish[];

    @Field(type => Boolean)
    @Column({default : false})
    isPromoted : boolean;

    @Field(type => Date, {nullable : true})
    @Column({nullable : true})
    promotedUntil? : Date;
}