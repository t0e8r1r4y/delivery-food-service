import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { CoreEntity } from "../../../../common/entities/core.entity";
import { BeforeInsert, Column, Entity, JoinColumn, OneToOne } from "typeorm";
import { UserEntity } from "./user.entity";
import { v4 as uuidv4 } from 'uuid';

@InputType({isAbstract: true})
@ObjectType()
@Entity('verification')
export class VerificationEntity extends CoreEntity{

    @Column()
    @Field(type => String)
    code : string;

    @OneToOne(tpye => UserEntity, {onDelete: "CASCADE"})
    @JoinColumn()
    user : UserEntity;

    @BeforeInsert()
    createCode() : void {
        this.code = uuidv4();
    }
}