
// tsconfig 관련 이슈 -> 경로를 기정하는 부분에서 ./과 src 설정에 따른 차이로 정상적으로 안됨
import { CoreEntity } from "../../common/entities/core.entity"
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany } from "typeorm";
import { Field, InputType, ObjectType, registerEnumType } from "@nestjs/graphql";
import * as bcrypt from 'bcrypt';
import { InternalServerErrorException } from "@nestjs/common";
import { IsBoolean, IsEmail, IsEnum, IsString } from "class-validator";
import { Restaurant } from "../../restaurants/entities/restaurant.entity";
import { Order } from "../../orders/entities/order.entity";
import { Payment } from "../../payments/entities/payment.entity";

export enum UserRole {
    Client = 'Client',
    Owner = 'Owner',
    Delivery = 'Delivery',
}

registerEnumType( UserRole, { name:'UserRole'} );

@InputType( 'UserInputType' ,{isAbstract: true})
@ObjectType()
@Entity()
export class User extends CoreEntity {
    @Column({unique: true})
    @Field(type => String)
    @IsEmail()
    email : string;

    @Column({select:false}) // 쿼리 수행 시 선택적으로 가져올 수 있다는 것
    @Field(type => String)
    @IsString()
    password : string;

    @Column({type:'enum', enum:UserRole})
    @Field(type => UserRole)
    @IsEnum(UserRole)
    role : UserRole;

    @Column({default: false})
    @Field(type=>Boolean)
    @IsBoolean()
    verified : boolean;

    @Field(type=> [Restaurant])
    @OneToMany(
        type => Restaurant,
        restaurant => restaurant.owner
    )
    restaurants: Restaurant[]

    @Field(type=> [Order])
    @OneToMany(
        type => Order,
        order => order.customer,
    )
    orders: Order[]

    @Field(type=> [Payment])
    @OneToMany(
        type => Payment,
        payment => payment.user,
        {eager : true}
    )
    payments: Payment[]

    @Field(type=> [Order])
    @OneToMany(
        type => Order,
        order => order.driver,
    )
    riders: Order[]

    @BeforeInsert()
    @BeforeUpdate() // 왜 안됨?
    async hassPassword() : Promise<void> {
        if(this.password) {
            // 비미런호를 변경하지 않는데 자꾸 업데이트 되는 부분을 막기 위한 처리 로직
            try {
                this.password = await bcrypt.hash(this.password, 10); // 단방향 hash, 변환해서 저장하고 다시 역 변환은 불가능하다.
            } catch (error) {
                console.log(error);
                throw new InternalServerErrorException();
            }
        }
    }

    async checkPassword(pw:string) : Promise<boolean> {
        try {
            const ok = await bcrypt.compare(pw, this.password);
            return ok;
        } catch (error) {
            console.log(error);
            throw new InternalServerErrorException();
        }
    }
}