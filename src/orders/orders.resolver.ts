import { Args, Mutation, Resolver, Query, Subscription } from "@nestjs/graphql";
import { Role } from "../auth/role.decorator";
import { AuthUser } from "../auth/auth-user.decorator";
import { User } from "../users/infra/entities/user.entity";
import { CreateOrderInput, CreateOrderOutput } from "./dtos/create-order.dto";
import { Order } from "./entities/order.entity";
import { OrderService } from "./order.service";
import { GetOrdersInput, GetOrdersOutput } from "./dtos/get-orders.dto";
import { GetOrderInput, GetOrderOutput } from "./dtos/get-order.dto";
import { EditOrderInput, EditOrderOutput } from "./dtos/edit-order.dto";
import {PubSub} from "graphql-subscriptions";
import { Inject } from "@nestjs/common";
import { NEW_COOKED_ORDER, NEW_ORDER_UPDATE, NEW_PENDING_ORDER, PUB_SUB } from "../common/common.constants";
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
        return this.ordersService.editOrder(user, editOrderInput);
    }

    @Subscription(returns => Order, {
        filter : ({pendingOrder : {ownerId}}, _, context) => {
            return ownerId === context.user.id;
        },
        resolve : ({pendingOrder : {order}}) => {
            // console.log(order);
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

    // 해당 주문과 관련된 모든 유저들이 정보를 전달 받을 수 있어야 함
    @Subscription(returns => Order, {
        filter : (
            { orderUpdates: order} : {orderUpdates : Order},
            {input} : {input: OrderUpdatesInput},
            {user} : {user: User},
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
        @AuthUser() driver: User,
        @Args('input') takeOrderInput :  TakeOrderInput 
    ) : Promise<TakeOrderOutput> {
        return this.ordersService.takeOrder(driver,takeOrderInput);
    } 


/*
// 테스트 코드
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
*/
}
