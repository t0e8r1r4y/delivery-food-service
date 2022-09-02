import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Restaurant } from "../restaurants/entities/restaurant.entity";
import { User, UserRole } from "../users/entities/user.entity";
import { Repository } from "typeorm";
import { CreateOrderInput, CreateOrderOutput } from "./dtos/create-order.dto";
import { Order, OrderStatus } from "./entities/order.entity";
import { OrderItem } from "./entities/order-item.entity";
import { Dish } from "../restaurants/entities/dish.entitiy";
import { GetOrdersInput, GetOrdersOutput } from "./dtos/get-orders.dto";
import { GetOrderInput, GetOrderOutput } from "./dtos/get-order.dto";
import { EditOrderInput, EditOrderOutput } from "./dtos/edit-order.dto";

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

    async getOrders (
        user : User,
        getOrdersInput : GetOrdersInput,
    ) : Promise<GetOrdersOutput> {
        const status = getOrdersInput.status;
        try {
            let orders : Order[];
            switch (user.role) {
                case UserRole.Client : {
                    orders = await this.orders.find(
                        {
                            where : {
                                customer : {
                                    id : user.id,
                                },
                                ... ( status && { status } )
                            }
                        }
                    );
                    break;
                }
                case UserRole.Delivery : {
                    orders = await this.orders.find(
                        {
                            where : {
                                driver : {
                                    id : user.id,
                                },
                                ... ( status && { status } )
                            }
                        }
                    );
                    break;
                }
                case UserRole.Owner : {
                    const restaurants = await this.restaurants.find(
                        {
                            where : {
                                owner : {
                                    id : user.id,
                                }
                            },
                            relations: ['orders'],
                        }
                    );

                    orders = restaurants.map(restaurants => restaurants.orders).flat(1);
                    if(status) {
                        orders = orders.filter(order => order.status === status );
                    }

                    break;
                }   
                default:
                    break;
            }

            return { ok: true, orders : orders };

        } catch (error) {
            console.log(error);
            return {ok:false, error:"주문을 찾을 수 없습니다."};
        }
    }

    async getOrder(
        user:User, getOrderInput : GetOrderInput
    ) : Promise<GetOrderOutput> {
        try {
            const order = await this.orders.findOne(
                {
                    where: {
                        id : getOrderInput.id,
                    },
                    relations : ['restaurant'],
                }
            );

            if( !order ) {
                return { ok: false, error: "주문을 찾을 수 없습니다."};
            }

            if(!this.canSeeOrder(user, order)) {
                return {ok: false, error: "사용자 정보가 불일치 합니다."};
            }

            return { ok: true, order };

        } catch (error) {
            return { ok: false, error: "주문을 찾지 못했습니다." };
        }
    }


    async editOrder(
        user: User,
        editOrderInput : EditOrderInput
    ) : Promise<EditOrderOutput> {
        try {
            const order = await this.orders.findOne(
                {
                    where : {
                        id : editOrderInput.id,
                    },
                    relations: ['restaurant'],
                }
            )

            if(!order) {
                return { ok: false, error: "수정할 주문을 찾지 못했습니다. "};
            }

            if(!this.canSeeOrder(user, order)){
                return {ok:false, error: "수정할 수 없습니다. "};
            }

            let canEdit = true;
            if(user.role === UserRole.Client) {
                canEdit = false;
            }

            // 주문을 수정 할 수 있는 사람은 누가 있을까? -> 여기서 상황이 복잡해 진다.
            if(user.role === UserRole.Owner){
                // 주인인 경우에 수정이 가능한 경우는
                if(editOrderInput.status !== OrderStatus.Cooking && editOrderInput.status !== OrderStatus.Cooked) {
                    canEdit = false;
                }
            }

            if(user.role === UserRole.Delivery) {
                // 배달원의 경우 수정이 가능한 경우는
                if(editOrderInput.status !== OrderStatus.PickedUp && editOrderInput.status !== OrderStatus.Delivered ) {
                    canEdit = false;
                }
            }

            if(!canEdit) {
                return {ok:false, error: "수정을 할 수 있는 사람이 아닙니다. "};
            }

            await this.orders.save([
                {
                    id: editOrderInput.id,
                    status: editOrderInput.status,
                }
            ]);

            return {ok:true, };
        } catch (error) {
            console.log(error);
            return {ok:false, error: "주문을 수정 할 수 없습니다."};
        }
    }


    canSeeOrder(
        user : User,
        order : Order
    ) : boolean {
        let canSee = true;
        if(user.role === UserRole.Client && order.customerId !== user.id ) { canSee = false };
        if(user.role === UserRole.Delivery && order.driverId !== user.id ) { canSee = false };
        if(user.role === UserRole.Owner && order.restaurant.owenrId !== user.id ) { canSee = false };

        return canSee;
    }

}