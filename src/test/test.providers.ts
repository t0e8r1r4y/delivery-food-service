import { DataSource } from "typeorm";
import { Test } from "./test.entity"

// 공식문서에서 권장하는 방식
export const testProviders = [{
    provide: 'TEST_REPOSITORY',
    useFactory: (dataSource : DataSource) => dataSource.getRepository(Test).extend({
        getById( id : number ) {
            return this.findOne({
                where : {
                    id: id,
                }
            })
        }
    }),
    inject: ['DATA_SOURCE']
}];