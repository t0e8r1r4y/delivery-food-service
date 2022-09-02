import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Restaurant } from "../restaurants/entities/restaurant.entity";
import { User } from "../users/entities/user.entity";
import { Repository } from "typeorm";
import { CreateOrderInput, CreateOrderOutput } from "./dtos/create-order.dto";
import { Order } from "./entities/order.entity";
import { OrderItem } from "./entities/order-item.entity";
import { Dish } from "../restaurants/entities/dish.entitiy";

@Injectable()
export class OrderService {
    constructor(
        @InjectRepository(Order)
        private readonly orders: Repository<Order>,
        @InjectRepository(OrderItem)
        private readonly orderItems: Repository<OrderItem>,
        @InjectRepository(Restaurant)
        private readonly restaurants: Repository<Restaurant>,
        @InjectRepository(Dish)
        private readonly dishes: Repository<Dish>
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


            // 최종 주문 금액
            let orderFinalPrice = 0;
            const orderItems: OrderItem[] = [];
            for(const item of createOrderInput.items) {
                const dish = await this.dishes.findOne({
                    where : {
                        id : item.dishId,
                    }
                })

                if( !dish ) {
                    return {
                        ok: false,
                        error: "주문 할 레스토랑에서 디시를 찾을 수 없습니다. "
                    }
                }

                // console.log(dish.options);
                let dishFinalPrice = dish.price;

                // @TODO - 도메인 로직에서 2중 반복문은 복잡도가 매우 높아짐. -> 분리 필요
                for( const itemOption of item.options ) {
                    const dishOption = dish.options.find(
                        dishOption => dishOption.name === itemOption.name,
                    );

                    if(dishOption) {
                        // console.log(itemOption.name);
                        if(dishOption.extra) {
                            // console.log(`USD + ${dishOption.extra}`);
                            dishFinalPrice += dishOption.extra;
                        } else {
                            const dishOptionChoice = dishOption.choices.find(
                                optionChoice => optionChoice.name === itemOption.choice,
                            );
                            
                            if(dishOptionChoice){
                                if(dishOptionChoice.extra) {
                                    // console.log(`USD + ${dishOptionChoice.extra}`);
                                    dishFinalPrice += dishOptionChoice.extra;
                                }
                            }
                        }
                        
                    }
                }

                orderFinalPrice += dishFinalPrice;
                const orderItem = await this.orderItems.save(
                    this.orderItems.create({
                        dish,
                        options: item.options,
                    })
                );
                orderItems.push(orderItem);
            }

            console.log(orderFinalPrice);
            // createOrderInput.items.forEach( async item => { // 해당 로직을 사용하면 resolver에서 reteurn을 인지 못함
            //     // console.log(item);
            //     const dish = await this.dishes.findOne({
            //         where : {
            //             id : item.dishId,
            //         }
            //     });

            //     if(!dish) {
            //         // abort this while thing
            //         return { ok: false, error: "주문하고자 하는 음식을 찾지 못했습니다. "};
            //     }

            //     await this.orderItems.save(
            //         this.orderItems.create({
            //             dish,
            //             options : item.options,
            //         })
            //     );
            // });

            const order = await this.orders.save(
                this.orders.create({
                    customer,
                    restaurant,
                    total : orderFinalPrice,
                    items: orderItems,
                })
            );

            if(!order) {
                return { ok: false, error: "주문을 생성하지 못했습니다. "};
            }

            return {ok:true};
        } catch (error) {
            console.log(error);
            return {ok:false, error:"주문을 생성할 수 없습니다."};
        }
    }

}