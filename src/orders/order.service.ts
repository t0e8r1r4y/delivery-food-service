import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Restaurant } from "../restaurants/entities/restaurant.entity";
import { User } from "../users/entities/user.entity";
import { Repository } from "typeorm";
import { CreateOrderInput, CreateOrderOutput } from "./dtos/create-order.dto";
import { Order } from "./entities/order.entity";

@Injectable()
export class OrderService {
    constructor(
        @InjectRepository(Order)
        private readonly orders: Repository<Order>,
        @InjectRepository(Restaurant)
        private readonly restaurants: Repository<Restaurant>,
    ) {}

    async createOrder(
        customer : User,
        createOrderInput : CreateOrderInput,
    ) : Promise<CreateOrderOutput> {
        try {
            // 레스토랑을 찾는다.
            const restaurant = await this.restaurants.findOne(
                {
                    where : {
                        id : createOrderInput.restaurantId,
                    }
                }
            );

            if(!restaurant) {
                return {ok:false, error: "주문을 할 레스토랑을 찾지 못했습니다."};
            }
        } catch (error) {
            console.log(error);
            return {ok:false, error:"주문을 생성할 수 없습니다."};
        }
    }

}