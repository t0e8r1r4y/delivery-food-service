import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { CoreEntity } from "../../common/entities/core.entity";
import { BeforeInsert, Column, Entity, JoinColumn, OneToOne } from "typeorm";
import { User } from "./user.entity";
import { v4 as uuidv4 } from 'uuid';

// Verification은 User와 1:1 관계이다.
// 접근의 주체에 따라서 @JoinColum에 대해서 사용위치가 달라진다.
// Verification에서 User에 접근하고 싶다면 JoinColum은 Verification 쪽에 작성되어야 함
@InputType({isAbstract: true})
@ObjectType()
@Entity()
export class Verification extends CoreEntity{

    @Column()
    @Field(type => String)
    code : string;

    @OneToOne(tpye => User, {onDelete: "CASCADE"}) // user를 삭제하면 verification도 함께 삭제
    @JoinColumn()
    user : User;

    @BeforeInsert()
    createCode() : void {
        this.code = uuidv4();
    }
}