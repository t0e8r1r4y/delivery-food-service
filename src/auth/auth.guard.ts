import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { QueryBus } from "@nestjs/cqrs";
import { GqlExecutionContext } from "@nestjs/graphql";
import { GetUserInfoQuery } from "../users/application/query/get-user-info.query";
import { JwtService } from "../jwt/jwt.service";
import { AllowedRoles } from "./role.decorator";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private readonly reflector : Reflector,
        private readonly jwtService : JwtService,
        private readonly queryBus : QueryBus,
    ) {}
    async canActivate(context: ExecutionContext)
    {
        const roles = this.reflector.get<AllowedRoles>('roles', context.getHandler(), );
        
        if(!roles) {
            return true;
        }

        const graphqlContext = GqlExecutionContext.create(context).getContext();
        const token = graphqlContext.token;

        if(!token) {
            return false;
        }

        const decoded = this.jwtService.verify(token.toString());

        if( !(typeof decoded === 'object' && decoded.hasOwnProperty('id')) ) {
            return false;
        }

        const getUserInfoQuery = new GetUserInfoQuery( decoded['id'] );
        const { user } = await this.queryBus.execute( getUserInfoQuery );

        if(!user) {
            return false;
        }

        graphqlContext['user'] = user;

        if(roles.includes('Any')) {
            return true;
        }

        return roles.includes(user.role);
    
    }
    
}