import { Args, Mutation, Resolver, Query, Subscription } from "@nestjs/graphql";
import { Role } from "../auth/role.decorator";
import { AuthUser } from "../auth/auth-user.decorator";
import { User } from "../users/entities/user.entity";
import { CreateOrderInput, CreateOrderOutput } from "./dtos/create-order.dto";
import { Order } from "./entities/order.entity";
import { OrderService } from "./order.service";
import { GetOrdersInput, GetOrdersOutput } from "./dtos/get-orders.dto";
import { GetOrderInput, GetOrderOutput } from "./dtos/get-order.dto";
import { EditOrderInput, EditOrderOutput } from "./dtos/edit-order.dto";
import {PubSub} from "graphql-subscriptions";

const pubSub = new PubSub();

@Resolver(of => Order)
export class OrderResolver {
    constructor(private readonly ordersService: OrderService) {}

    @Mutation(returns => CreateOrderOutput)
    @Role(['Client'])
    async createOrder(
        @AuthUser() customer : User,
        @Args('input')
        createOrderInput : CreateOrderInput,
    ) : Promise<CreateOrderOutput> {
        return this.ordersService.createOrder(customer, createOrderInput);
    }

    @Query(returns => GetOrdersOutput)
    @Role(['Any'])
    async getOrders(
        @AuthUser() user : User,
        @Args('input') getOrdersInput : GetOrdersInput,
    ) : Promise<GetOrdersOutput> {
        return this.ordersService.getOrders(user, getOrdersInput);
    }

    @Query(returns => GetOrderOutput)
    @Role(['Any'])
    async getOrder(
        @AuthUser() user : User,
        @Args('input') getOrderInput : GetOrderInput,
    ) : Promise<GetOrderOutput> {
        return this.ordersService.getOrder(user, getOrderInput);
    }

    @Mutation(returns => EditOrderOutput)
    @Role(['Any'])
    async editOrder(
        @AuthUser() user: User,
        @Args('input') editOrderInput : EditOrderInput
    ) : Promise<EditOrderOutput> {
        return
    }

    // 주문을 업데이트하면 이벤트 발생을 알린다.
    @Mutation(returns => Boolean)
    potatoReady() {
        pubSub.publish('trig', {
            orderSubscription: 'test ok. I can do it.',
        });
        return true;
    }

    @Subscription(returns => String)
    @Role(['Any'])
    orderSubscription(@AuthUser() user : User) {
        // console.log(user);
        return pubSub.asyncIterator('trig');
    }
}
