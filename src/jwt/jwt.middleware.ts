import { Injectable, NestMiddleware } from "@nestjs/common";
import { QueryBus } from "@nestjs/cqrs";
import { NextFunction } from "express";
import { GetUserInfoQuery } from "../users/application/query/get-user-info.query";
import { JwtService } from "./jwt.service";

@Injectable()
export class JwtMiddleware implements NestMiddleware {

    constructor(
        private readonly jwtService: JwtService,
        private readonly queryBus : QueryBus,
    ) {}

    async use(req: Request, res: Response, next: NextFunction) {
        if('x-jwt' in req.headers) {
            const token = req.headers['x-jwt'];
            const decoded = this.jwtService.verify(token.toString());

            if(typeof decoded === 'object' && decoded.hasOwnProperty('id') ) {

                try {
                    const getUserInfoQuery = new GetUserInfoQuery( decoded['id'] );
                    const { user, ok } = await this.queryBus.execute( getUserInfoQuery );

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