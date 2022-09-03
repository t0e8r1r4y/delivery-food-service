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
import { Inject } from "@nestjs/common";
import { PUB_SUB } from "../common/common.constants";


@Resolver(of => Order)
export class OrderResolver {
    constructor(
        private readonly ordersService: OrderService,
        @Inject(PUB_SUB) private readonly pubSub : PubSub,
    ) {}

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
    async potatoReady(
        @Args('trigId') trigId : number,
    ) {
        this.pubSub.publish('trig', {
            orderSubscription : trigId,
            // orderSubscription: 'test ok. I can do it.',
        });
        return true;
    }

    @Subscription(returns => String, {
        // 말그대로 걸러준다.
        filter : (payload, variables) => {
            // console.log(payload, variables);
            return payload.orderSubscription === variables.trigId;
        },
        // 걸러진 값에서 보여주고 싶은 값으로 변환을 하여 최종적으로 asyncIterator하도록 한다.
        resolve : (payload, args, context, info) => {
            console.log(payload);
            return  `Test ${payload.orderSubscription} is right?`;
        },
    })
    @Role(['Any'])
    orderSubscription(
        // @AuthUser() user : User
        @Args('trigId') trigId : number,
    ) {
        // console.log(user);
        return this.pubSub.asyncIterator('trig');
    }
}
