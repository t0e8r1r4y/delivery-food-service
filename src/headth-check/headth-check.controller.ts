import { Controller, Get } from '@nestjs/common';
import { TypeOrmHealthIndicator, HealthCheck, HealthCheckService } from '@nestjs/terminus';

// TODO - 해당 서버에 대한 HB체크와 TypeORM에 대한 체크가 둘다 필요함
@Controller('headth-check')
export class HeadthCheckController {
    constructor(
        private health: HealthCheckService,
        private db : TypeOrmHealthIndicator,
    ) {}

    // @Get()
    // @HealthCheck()
    // typeOrmCheck() {
    //     return this.health.check([
    //         () => this.db.pingCheck(),
    //     ]);
    // }
}
