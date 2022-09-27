import { DynamicModule, Global, Module } from '@nestjs/common';
import { JwtModuleOptions } from './jwt.interfaces';
import { CONFIG_OPTIONS } from '../common/common.constants';
import { JwtService } from './jwt.service';
import { CqrsModule } from '@nestjs/cqrs';

@Module({
    imports: [CqrsModule]
})
@Global()
export class JwtModule {
    static forRoot(options: JwtModuleOptions) : DynamicModule {
        return {
            module: JwtModule,
            exports: [JwtService],
            providers: [
                {
                    provide: CONFIG_OPTIONS,
                    useValue: options,
                },
                JwtService],
        };
    }
}
