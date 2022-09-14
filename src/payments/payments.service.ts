import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "../users/infra/db/entities/user.entity";
import { LessThan, Repository } from "typeorm";
import { CreatePaymentInput, CreatePaymentOutput } from "./dtos/create-payment.dto";
import { Payment } from "./entities/payment.entity";
import { Restaurant } from "../restaurants/entities/restaurant.entity";
import { GetPaymentOutput } from "./dtos/get-payment.dto";
import { Cron,Interval } from '@nestjs/schedule';

@Injectable()
export class PaymentService {
    constructor(
        @InjectRepository(Payment)
        private readonly payments : Repository<Payment>,
        @InjectRepository(Restaurant)
        private readonly restaurants : Repository<Restaurant>
    ) {}

    async createPayment (
        owner : UserEntity,
        createPaymentInput : CreatePaymentInput
    ) : Promise<CreatePaymentOutput> {
        try {
            const restaurant = await this.restaurants.findOne({
                where : {
                    id :  createPaymentInput.restaurantId,
                }
            });

            if(!restaurant) {
                return { ok: false, error: "레스토랑을 찾을 수 없습니다. "};
            }

            if(restaurant.owenrId !== owner.id) {
                return {ok:false, error: "수정할 수 없는 사용자 입니다."};
            }

            const payment = await this.payments.save(
                this.payments.create(
                    {
                        transactionId : createPaymentInput.transactionId,
                        user : owner,
                        restaurant : restaurant,          
                    }
                ),
            );
            
            restaurant.isPromoted = true;
            const date = new Date();
            date.setDate(date.getDate() + 7);
            restaurant.promotedUntil = date;

            this.restaurants.save(restaurant);

            return {ok: true};
        } catch (error) {
            console.log(error);
            return {ok:false, error: "결제를 생성 할 수 없습니다."};
        }
    }

    async getPayments(
        user: UserEntity
    ) : Promise<GetPaymentOutput> {
        try {

            console.log(user);
            const payments = await this.payments.find({
                where : {
                    user : {
                        id : user.id
                    }
                }
                
            })

            return {ok : true, payments }
        } catch (error) {
            console.log(error);
            return {ok: false, error: "결제 내용을 찾을 수 없습니다." };
        }
    } 

    @Interval(2000)
    async checkPromotedRestaurants() {
        try {
            const restaurants = await this.restaurants.find({
                where : {
                    isPromoted : true,
                    promotedUntil : LessThan(new Date()),
                }
            });

            restaurants.forEach( async restaurant => {
                restaurant.isPromoted = false;
                restaurant.promotedUntil = null;
                await this.restaurants.save(restaurant);
            });
        } catch (error) {
            
        }
    }

/*
    // 테스트 코드
    @Cron('30 * * * * *')
    checkForPayments() {
        console.log('Checking')
    }

    @Interval(30000)
    checkForPaymentsAsInterval() {
        console.log('teset interval ')
    }
*/
}