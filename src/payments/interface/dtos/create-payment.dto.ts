import { InputType, ObjectType, PickType } from "@nestjs/graphql";
import { CoreOutput } from "../../../common/dtos/output.dto";
import { PaymentEntity } from "../../infra/db/entities/payment.entity";

@InputType()
export class CreatePaymentInput extends PickType(PaymentEntity, ['transactionId', 'restaurantId']) {
}

@ObjectType()
export class CreatePaymentOutput extends CoreOutput {}