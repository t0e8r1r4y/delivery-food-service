import { Field, ObjectType } from "@nestjs/graphql";
import { CoreOutput } from "../../../common/dtos/output.dto";
import { PaymentEntity } from "../../infra/db/entities/payment.entity";

@ObjectType()
export class GetPaymentOutput extends CoreOutput {
    @Field(tpye => [PaymentEntity], {nullable : true})
    payments? : PaymentEntity[]
}