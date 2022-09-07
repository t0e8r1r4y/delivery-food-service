import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Test{
    @PrimaryGeneratedColumn()
    id: number;

    @Column({length : 500})
    name: string
}