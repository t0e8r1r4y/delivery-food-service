import { Field, ObjectType } from "@nestjs/graphql";
import { CoreOutput } from "../../../common/dtos/output.dto";
import { Payment } from "../../infra/db/entities/payment.entity";

@ObjectType()
export class GetPaymentOutput extends CoreOutput {
    @Field(tpye => [Payment], {nullable : true})
    payments? : Payment[]
}