import { Args, Mutation, Resolver, Query } from "@nestjs/graphql";
import { Role } from "../auth/role.decorator";
import { AuthUser } from "../auth/auth-user.decorator";
import { User } from "../users/entities/user.entity";
import { CreateOrderInput, CreateOrderOutput } from "./dtos/create-order.dto";
import { Order } from "./entities/order.entity";
import { OrderService } from "./order.service";
import { GetOrdersInput, GetOrdersOutput } from "./dtos/get-orders.dto";
import { GetOrderInput, GetOrderOutput } from "./dtos/get-order.dto";


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
}
