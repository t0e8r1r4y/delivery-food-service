import { DataSource } from "typeorm"
import { User } from "../entities/user.entity"

export const userRepository = [
    {
        provide: 'USER_REPOSITOTY',
        useFactory: (dataSource : DataSource) => dataSource.getRepository(User),
        inject: ['DATA_SOURCE'],
    },
];