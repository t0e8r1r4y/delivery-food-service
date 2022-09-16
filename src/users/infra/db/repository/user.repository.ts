import { Repository } from "typeorm";
import { UserEntity } from "../entities/user.entity";
import { CreateAccountInput } from "../../../interface/dtos/create-acoount.dto";
import { TryCatch } from "../../../../common/decorator/trycatch.decorator";
import { repositoryResult } from "../../../interface/dtos/repository-result.dto";
import { IUserRepository } from "../../../domain/repository/iuser.repository";
import { InjectRepository } from "@nestjs/typeorm";
import { Injectable } from "@nestjs/common";


@Injectable()
export class UserRepository implements IUserRepository {

    private connection = null;

    constructor( 
        @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>
    ) {
        this.connection = this.userRepository.manager.connection;
    }

    @TryCatch('not found UserAccount - ')
    async getUserAccountBy( 
        key: string | number
    ) : Promise<repositoryResult> {
        let user = null;
        switch ( typeof key ) {
            case 'string': {
                user = await this.userRepository.findOne({
                    where : {email : key},
                    select : ['id', 'email', 'password']
                })
                break;
            }
            case 'number' : {
                user = await this.userRepository.findOne({
                    where : {id : key},
                    select : [ 'id', 'email', 'password' ]
                })
                break;
            }
            default:
                break;
        }
        if(!user) {
            throw new Error(`${key}의 사용자를 찾을 수 없습니다.`);
        }
        return { ok: true, user: user };
    }

    @TryCatch('already exist in UserRepository - ')
    async beUserAccountExistByEmail (
        email: string
    ) : Promise<repositoryResult> {
        const user = await this.userRepository.findOne({
            where : { email : email },
        });
        if(user) {
            throw new Error('이미 가입 된 계정입니다.');
        }
        return { ok: true, };
    }

    @TryCatch('Fail to create UserEntity instance - ')
    async createUserAccount (
        { email, password, role }: CreateAccountInput
    ) : Promise<repositoryResult> {
        const user = await this.userRepository.create( {email, password, role} );
        if(!user) {
            throw new Error('계정을 생성 할 수 없습니다.');
        }
        return { ok : true, user: user }
    }

    async saveUserAccount( 
        user: UserEntity 
    ) : Promise<repositoryResult> {
        let isResult : repositoryResult = { ok: false, };

        const queryRunner = await this.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            await queryRunner.manager.save(user);
        } catch (error) {
            isResult.ok = false;
            isResult.error = error;
        } finally {
            await queryRunner.release()
            isResult.ok = true;
            isResult.user = user;
        }

        return isResult;
    }

    async commitTransaction() 
    : Promise<repositoryResult> {
        let isResult : repositoryResult = {ok:false};

        const queryRunner = await this.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            await queryRunner.commitTransaction();
        } catch (error) {
            isResult.ok = false;
            isResult.error = error;
        } finally {
            await queryRunner.release()
            isResult.ok = true;
        }


        return isResult;
    }

    async rollbackTransaction() : Promise<repositoryResult> {
        let isResult : repositoryResult = {ok:false};;

        const queryRunner = await this.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            await queryRunner.rollbackTransaction();
        } catch (error) {
            isResult.ok = false;
            isResult.error = error;
        } finally {
            await queryRunner.release()
            isResult.ok = true;
        }

        return isResult;
    }

    @TryCatch('Fail to delete UserAccount - ')
    async deleteUserAccount (
        user : UserEntity
    ) : Promise<repositoryResult> {
        const result = await this.userRepository.delete({
            id : user.id
        })

        if(result.affected !== 1) {
            throw new Error('정상적으로 삭제되지 않았습니다. ');
        }

        return { ok:true, };
    }
    
}