/**
 * findOne
 *  - where : email / 
 *  - where : email / select : ['id', 'password']
 *  - where : id
 *  - 
 * 
 * Create
 * 
 * Save
 * 
 * Delete
 * 
 * 
 */

import { Repository } from "typeorm";
import { User } from "../entities/user.entity";

export interface UserRepository extends Repository<User> {
    this: Repository<User>

    getUserAccountByEmail( email : string ) : Promise<User>;
    getUserAccountById( id : number ) : Promise<User>;
    createUserAccount( user : User ) : Promise<User>
    saveUserAccount( user : User ) : Promise<User>;
    deleteUserAccount( user : User ) : Promise<any>;
}

export const customUserRepositoryMethod : Partial<UserRepository> = {
    getUserAccountByEmail: async function (email: string): Promise<User> {
        throw new Error("Function not implemented.");
    },

    getUserAccountById: async function ( id : number ) : Promise<User> {
        throw new Error("Function not implemented.");
    },

    createUserAccount: async function ( user : User ) : Promise<User> {
        throw new Error("Function not implemented.");
    },

    saveUserAccount: async function ( user : User ) : Promise<User> {
        throw new Error("Function not implemented.");
    }
}