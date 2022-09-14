import { Controller, Get } from '@nestjs/common';
import { TypeOrmHealthIndicator, HealthCheck, HealthCheckService } from '@nestjs/terminus';

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
