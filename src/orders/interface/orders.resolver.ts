import { Args, Mutation, Resolver, Query, Subscription } from "@nestjs/graphql";
import { Role } from "../../auth/role.decorator";
import { AuthUser } from "../../auth/auth-user.decorator";
import { UserEntity } from "../../users/infra/db/entities/user.entity";
import { CreateOrderInput, CreateOrderOutput } from "./dtos/create-order.dto";
import { Order } from "../infra/db/entities/order.entity";
import { OrderService } from "../application/service/order.service";
import { GetOrdersInput, GetOrdersOutput } from "./dtos/get-orders.dto";
import { GetOrderInput, GetOrderOutput } from "./dtos/get-order.dto";
import { EditOrderInput, EditOrderOutput } from "./dtos/edit-order.dto";
import { PubSub } from "graphql-subscriptions";
import { Inject } from "@nestjs/common";
import { NEW_COOKED_ORDER, NEW_ORDER_UPDATE, NEW_PENDING_ORDER, PUB_SUB } from "../../common/common.constants";
import { OrderUpdatesInput } from "./dtos/order-updates.dto";
import { TakeOrderInput, TakeOrderOutput } from "./dtos/take-order.dto";


@Resolver(of => Order)
export class OrderResolver {
    constructor(
        private readonly ordersService: OrderService,
        @Inject(PUB_SUB) private readonly pubSub : PubSub,
    ) {}

    @Mutation(returns => CreateOrderOutput)
    @Role(['Client'])
    async createOrder(
        @AuthUser() customer : UserEntity,
        @Args('input')
        createOrderInput : CreateOrderInput,
    ) : Promise<CreateOrderOutput> {
        return this.ordersService.createOrder(customer, createOrderInput);
    }

    @Query(returns => GetOrdersOutput)
    @Role(['Any'])
    async getOrders(
        @AuthUser() user : UserEntity,
        @Args('input') getOrdersInput : GetOrdersInput,
    ) : Promise<GetOrdersOutput> {
        return this.ordersService.getOrders(user, getOrdersInput);
    }

    @Query(returns => GetOrderOutput)
    @Role(['Any'])
    async getOrder(
        @AuthUser() user : UserEntity,
        @Args('input') getOrderInput : GetOrderInput,
    ) : Promise<GetOrderOutput> {
        return this.ordersService.getOrder(user, getOrderInput);
    }

    @Mutation(returns => EditOrderOutput)
    @Role(['Any'])
    async editOrder(
        @AuthUser() user: UserEntity,
        @Args('input') editOrderInput : EditOrderInput
    ) : Promise<EditOrderOutput> {
        return this.ordersService.editOrder(user, editOrderInput);
    }

    @Subscription(returns => Order, {
        filter : ({pendingOrder : {ownerId}}, _, context) => {
            return ownerId === context.user.id;
        },
        resolve : ({pendingOrder : {order}}) => {
            return order;
        },
    })
    @Role(['Owner'])
    pendingOrder() {
        return this.pubSub.asyncIterator(NEW_PENDING_ORDER);
    }

    @Subscription(returns => Order)
    @Role(['Delivery'])
    cookedOrders() {
        return this.pubSub.asyncIterator(NEW_COOKED_ORDER);
    }

    @Subscription(returns => Order, {
        filter : (
            { orderUpdates: order} : {orderUpdates : Order},
            {input} : {input: OrderUpdatesInput},
            {user} : {user: UserEntity},
        ) => {
            if(
                // 셋다 아니라면 관계자가 아님
                order.driverId !== user.id &&
                order.customerId !== user.id &&
                order.restaurant.owenrId !== user.id
            ) {
                return false;
            }
            return order.id === input.id;
        },
    })
    @Role(['Any'])
    orderUpdates(@Args('input') orderUpdatesInput : OrderUpdatesInput ) {
        return this.pubSub.asyncIterator(NEW_ORDER_UPDATE);
    }

    @Mutation(returns => TakeOrderOutput)
    @Role(["Delivery"])
    takeOrder(
        @AuthUser() driver: UserEntity,
        @Args('input') takeOrderInput :  TakeOrderInput 
    ) : Promise<TakeOrderOutput> {
        return this.ordersService.takeOrder(driver,takeOrderInput);
    } 

}
