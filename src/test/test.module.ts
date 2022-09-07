import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { testProviders } from './test.providers';

@Module({
    imports: [DatabaseModule],
    providers: [
        ...testProviders,
    ]
})
export class TestModule {}
