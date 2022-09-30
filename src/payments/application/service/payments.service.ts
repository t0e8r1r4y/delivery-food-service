import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "../../../users/infra/db/entities/user.entity";
import { LessThan, Repository } from "typeorm";
import { CreatePaymentInput, CreatePaymentOutput } from "../../interface/dtos/create-payment.dto";
import { PaymentEntity } from "../../infra/db/entities/payment.entity";
import { RestaurantEntity } from "../../../restaurants/infra/db/entities/restaurant.entity";
import { GetPaymentOutput } from "../../interface/dtos/get-payment.dto";
import { Interval } from '@nestjs/schedule';

@Injectable()
export class PaymentService {
    constructor(
        @InjectRepository(PaymentEntity)
        private readonly payments : Repository<PaymentEntity>,
        @InjectRepository(RestaurantEntity)
        private readonly restaurants : Repository<RestaurantEntity>
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