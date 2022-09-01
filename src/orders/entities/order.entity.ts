import { Field, Float, InputType, ObjectType, registerEnumType } from "@nestjs/graphql";
import { CoreEntity } from "../../common/entities/core.entity";
import { Dish } from "../../restaurants/entities/dish.entitiy";
import { Restaurant } from "../../restaurants/entities/restaurant.entity";
import { User } from "../../users/entities/user.entity";
import { Column, Entity, JoinTable, ManyToMany, ManyToOne } from "typeorm";
import { OrderItem } from "./order-item.entity";
import { IsEnum, IsNumber } from "class-validator";

export enum OrderStatus {
    Pending = 'Pending',
    Cooking = 'Cooking',
    PickedUp = 'PickedUp',
    Delivered = 'Delivered',
}

registerEnumType( OrderStatus, {name: 'OrderStatus'} );

@InputType('OrderInputType', { isAbstract: true } )
@ObjectType()
@Entity()
export class Order extends CoreEntity {
    
    @Field(type => User, {nullable: true})
    @ManyToOne(
        type => User,
        user => user.orders,
        { onDelete: 'SET NULL', nullable:true }
    )
    customer? : User;

    @Field( type => User, {nullable:true} )
    @ManyToOne(
        type => User,
        user => user.riders,
        { onDelete: 'SET NULL', nullable:true }
    )
    driver?: User;

    @Field(type => Restaurant)
    @ManyToOne(
        type => Restaurant,
        restaurant => restaurant.orders,
        { onDelete: 'SET NULL', nullable: true}
    )
    restaurant: Restaurant;

    @Field(type => [OrderItem])
    @ManyToMany(type => OrderItem)
    @JoinTable()
    items: OrderItem[];

    @Column({nullable:true})
    @Field(type => Float)
    @IsNumber()
    total: number;

    @Column({type: 'enum', enum: OrderStatus})
    @Field(type => OrderStatus)
    @IsEnum(OrderStatus)
    status : OrderStatus;
}