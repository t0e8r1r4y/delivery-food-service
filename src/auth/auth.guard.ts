import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { GqlExecutionContext } from "@nestjs/graphql";
import { JwtService } from "../jwt/jwt.service";
import { UsersService } from "../users/users.service";
import { AllowedRoles } from "./role.decorator";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private readonly reflector : Reflector,
        private readonly jwtService : JwtService,
        private readonly userService : UsersService,
    ) {}
    async canActivate(context: ExecutionContext)
    {
        console.log(context);

        const roles = this.reflector.get<AllowedRoles>('roles', context.getHandler(), );
        
        if(!roles) {
            return true;
        }

        const graphqlContext = GqlExecutionContext.create(context).getContext();
        const token = graphqlContext.token;

        // console.log(token);

        if(token)
        {
            console.log("token!!!!!");
            const decoded = this.jwtService.verify(token.toString());

            if(typeof decoded === 'object' && decoded.hasOwnProperty('id')) {
                const { user } = await this.userService.findById(decoded['id']);
                if(!user) {
                    return false;
                }
        
                graphqlContext['user'] = user;

                if(roles.includes('Any')) {
                    return true;
                }
                
                return roles.includes(user.role);
            } else {
                return false;
            }
        } else {
            console.log("token is not");
            return false;
        }
    
    }
    
}