import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction } from "express";
import { UsersService } from "../users/users.service";
import { JwtService } from "./jwt.service";

@Injectable()
export class JwtMiddleware implements NestMiddleware {

    constructor(private readonly jwtService: JwtService, private readonly userService: UsersService) {}

    async use(req: Request, res: Response, next: NextFunction) {
        if('x-jwt' in req.headers) {
            const token = req.headers['x-jwt'];
            const decoded = this.jwtService.verify(token.toString());

            if(typeof decoded === 'object' && decoded.hasOwnProperty('id') ) {

                try {
                    const {user, ok} = await this.userService.findById(decoded['id']);

                    if(ok){
                        req['user'] = user;
                    }
                } catch (error) {
                    
                }
            }
        }
        next();
    }
}