import { Repository } from "typeorm";
import { UserEntity } from "../entities/user.entity";
import { CreateAccountInput } from "../../../interface/dtos/create-acoount.dto";
import { TryCatch } from "../../../../common/method-decorator/trycatch.decorator";
import { IUserRepository } from "../../../domain/repository/iuser.repository";
import { InjectRepository } from "@nestjs/typeorm";
import { Injectable } from "@nestjs/common";


// NestJS에서 권장하는 방식으로 Repository를 작성하였습니다.
@Injectable()
export class UserRepository implements IUserRepository {

    private connection = null;

    constructor( 
        @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>
    ) {
        this.connection = this.userRepository.manager.connection;
    }

    @TryCatch('/UserRepository/getUserAccountBy')
    async getUserAccountBy( 
        key: string | number
    ) : Promise<UserEntity> {
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
            throw new Error(`/${key}의 사용자를 찾을 수 없습니다.`);
        }
        return user;
    }

    @TryCatch('/UserRepository/beUserAccountExistByEmail')
    async beUserAccountExistByEmail (
        email: string
    ) : Promise<boolean> {
        const user = await this.userRepository.findOne({
            where : { email : email },
        });
        if(user) {
            throw new Error('/이미 가입 된 계정입니다.');
        }
        return true;
    }

    @TryCatch('/UserRepository/createUserAccount')
    async createUserAccount (
        { email, password, role }: CreateAccountInput
    ) : Promise<UserEntity> {
        const user = await this.userRepository.create( {email, password, role} );
        if(!user) {
            throw new Error('/계정을 생성 할 수 없습니다.');
        }
        return user;
    }

    @TryCatch('/UserRepository/saveUserAccount')
    async saveUserAccount( 
        user: UserEntity 
    ) : Promise<UserEntity> {

        let saveEntity = null;
        let errorMsg : string = null;

        const queryRunner = await this.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            saveEntity = await queryRunner.manager.save(user);
        } catch (error) {
            await queryRunner.rollbackTransaction();
            errorMsg = error.message;
        } finally {
            await queryRunner.release();
        }

        if(errorMsg !== null) {
            throw new Error('/'+errorMsg);
        }

        return saveEntity;
    }

    @TryCatch('/UserRepository/commitTransaction')
    async commitTransaction() 
    : Promise<boolean> {

        let errorMsg : string = null;

        const queryRunner = await this.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            await queryRunner.commitTransaction();
        } catch (error) {
            errorMsg = error.message;
        } finally {
            await queryRunner.release();
        }

        if(errorMsg !== null) {
            throw new Error('/'+errorMsg);
        }

        return true;
    }

    @TryCatch('/UserRepository/rollbackTransaction')
    async rollbackTransaction() : Promise<boolean> {

        let errorMsg : string = null;

        const queryRunner = await this.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            await queryRunner.rollbackTransaction();
        } catch (error) {
            errorMsg = error.message;
        } finally {
            await queryRunner.release()
        }

        if(errorMsg !== null) {
            throw new Error('/'+errorMsg);
        }

        return true;
    }

    // TODO - delete도 수동으로 transaction을 처리하도록 수정 필요 ( 일관성 확보 목적 )
    @TryCatch('/UserRepository/deleteUserAccount')
    async deleteUserAccount (
        user : UserEntity
    ) : Promise<boolean> {
        const result = await this.userRepository.delete({
            id : user.id
        })

        if(result.affected !== 1) {
            throw new Error('/정상적으로 삭제되지 않았습니다. ');
        }

        return true;
    }
    
}