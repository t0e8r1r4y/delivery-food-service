import { InputType, PickType } from "@nestjs/graphql";
import { Order } from "../../infra/db/entities/order.entity";

@InputType()
export class OrderUpdatesInput extends PickType(Order, ['id']) {}