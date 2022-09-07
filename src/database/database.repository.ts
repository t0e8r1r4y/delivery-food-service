import { User } from "../users/entities/user.entity";
import { DataSource  } from "typeorm";
import { Verification } from "../users/entities/verification.entity";
import { Restaurant } from "../restaurants/entities/restaurant.entity";
import { Dish } from "../restaurants/entities/dish.entitiy";
import { Category } from "../restaurants/entities/category.entity";
import { Order } from "../orders/entities/order.entity";
import { OrderItem } from "../orders/entities/order-item.entity";
import { Payment } from "../payments/entities/payment.entity";
import { Test } from "../test/test.entity"


export const databaseProviders = [
    {
        provide : 'DATA_SOURCE',
        useFactory:async () => {
            const dataSource = new DataSource({
                type: 'postgres',
                host: process.env.DB_HOST,
                port: +process.env.DB_PORT,
                username: process.env.DB_USERNAME,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME,
                synchronize: process.env.NODE_ENV !== 'prod',
                logging: process.env.NODE_ENV !== 'prod' && process.env.NODE_ENV !== 'test',
                entities: [Test]
            });
            
            return dataSource.initialize();
        }
    }
];