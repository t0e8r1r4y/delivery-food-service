import { Args, Mutation, Resolver,Query } from "@nestjs/graphql";
import { AuthUser } from "../auth/auth-user.decorator";
import { Role } from "../auth/role.decorator";
import { User } from "../users/infra/entities/user.entity";
import { CreatePaymentInput, CreatePaymentOutput } from "./dtos/create-payment.dto";
import { GetPaymentOutput } from "./dtos/get-payment.dto";
import { Payment } from "./entities/payment.entity";
import { PaymentService } from "./payments.service";

@Resolver(of => Payment)
export class PaymentResolver {
    constructor(
        private readonly paymentService : PaymentService
    ){}

    @Mutation(returns => CreatePaymentOutput)
    @Role(['Owner'])
    createPayment(
        @AuthUser() owner : User,
        @Args('input') createPaymentInput : CreatePaymentInput
    ) : Promise<CreatePaymentOutput> {
        return this.paymentService.createPayment(owner, createPaymentInput);
    }

    @Query(returns => GetPaymentOutput)
    @Role(['Owner'])
    getPayments(
        @AuthUser() user : User
    ) : Promise<GetPaymentOutput> {
        return this.paymentService.getPayments(user);
    }
}