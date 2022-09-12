import { CustomRepository } from "../../../../common/typeorm-ex.decorator";
import { Repository } from "typeorm";
import { User } from "../../entities/user.entity";
import { CreateAccountInput } from "../../../interface/dtos/create-acoount.dto";
import { TryCatch } from "../../../../common/trycatch.decorator";
import { repositoryResult } from "../../../interface/dtos/repository-result.dtp";
import { IUserRepository } from "../../../domain/repository/iuser.repository";

@CustomRepository(User)
export class UserRepository extends Repository<User> implements IUserRepository {

    @TryCatch('Error at getUserAccountByEmail - ')
    async getUserAccountByEmail( email : string ) : Promise<repositoryResult> {
        const userAccount = await this.findOne({
            where : { email : email },
            select : ['id', 'password']
        })

        if(!userAccount) {
            throw new Error('해당 계정으로 이미 가입 된 계정이 없습니다.');
        }

        return { ok: true, user : userAccount };
    }

    @TryCatch('Error at beUserAccountExistByEmail - ')
    async beUserAccountExistByEmail( email : string ) : Promise<repositoryResult> {
        const userAccount = await this.findOne({
            where : { email : email },
        })

        if(userAccount) {
            throw new Error('이미 가입 된 계정입니다.');
        }

        return { ok: true, user : null };
    }


    @TryCatch('Error at getUserAccountById - ')
    async getUserAccountById( id : number ) : Promise<repositoryResult> {
        const userAccount = await this.findOne({
            where: {id: id},
        });

        if(!userAccount) {
            throw new Error(`${id}의 사용자를 찾을 수 없습니다.`); 
        }

        return {ok:true, user:userAccount};
    }

    @TryCatch('Error at createAccountAndSave - ')
    async createAccountAndSave( { email, password, role} : CreateAccountInput ) : Promise<repositoryResult> {
        const result = await this.save(
            this.create( {email, password, role} ),
        );

        if(!result) {
            throw new Error('계정 생성에 실패했습니다.');
        }

        return { ok: true, user : result };
    }

    @TryCatch('Error at saveUserAccount - ')
    async saveUserAccount( user : User ) : Promise<repositoryResult> {
        const result = await this.save(user);

        if(!result) {
            throw new Error('계정 저장에 실패했습니다.');
        }

        return { ok:true, user:result };
    }
    
}