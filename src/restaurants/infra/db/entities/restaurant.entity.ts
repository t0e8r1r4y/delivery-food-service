import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { IsString, Length } from "class-validator";
import { CoreEntity } from "../../../../common/entities/core.entity";
import { Column, Entity, ManyToOne, OneToMany, RelationId } from "typeorm";
import { Category } from "./category.entity";
import { UserEntity } from "../../../../users/infra/db/entities/user.entity";
import { Dish } from "./dish.entitiy";
import { Order } from "../../../../orders/entities/order.entity";

@InputType( 'RestuarnatInputType' , {isAbstract:true})
@ObjectType()
@Entity('restaurant') 
export class RestaurantEntity extends CoreEntity {
    
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

    @Field(type => UserEntity)
    @ManyToOne(
        tpye => UserEntity, 
        user => user.restaurants,
        { onDelete: 'CASCADE' },
    )
    owner: UserEntity;

    @Field(type=> [Order])
    @OneToMany(
        type => Order,
        order => order.restaurant,
    )
    orders: Order[]

    @RelationId((restaurant : RestaurantEntity) => restaurant.owner )
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