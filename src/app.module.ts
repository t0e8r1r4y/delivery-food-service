import { ApolloDriver } from '@nestjs/apollo';
import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as Joi from 'joi';
import { UsersModule } from './users/users.module';
import { User } from './users/entities/user.entity';
import { CommonModule } from './common/common.module';
import { JwtModule } from './jwt/jwt.module';
import { JwtMiddleware } from './jwt/jwt.middleware';
import { AuthModule } from './auth/auth.module';
import { Verification } from './users/entities/verification.entity';
import { MailModule } from './mail/mail.module';
import { Restaurant } from './restaurants/entities/restaurant.entity';
import { Category } from './restaurants/entities/category.entity';
import { RestaurnatsModule } from './restaurants/restaurants.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'dev' ? '.env.dev' : '.env.test',
      ignoreEnvFile: process.env.NODE_ENV === 'prod',
      validationSchema: Joi.object({
        // 환경변수 유효성 검사
        NODE_ENV: Joi.string().valid('dev', 'prod', 'test').required(),
        // dev.env 파일에 저장된 값들 유효성 검사
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.string().required(),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_NAME: Joi.string().required(),
        PRIVATE_KEY: Joi.string().required(),
        MAILGUN_API_KEY: Joi.string().required(),
        MAILGUN_DOMAIN_NAME: Joi.string().required(),
        MAILGUN_FROM_EMAIL: Joi.string().required(),
      }),
    }),
    TypeOrmModule.forRoot({
      // todo - need to make 'ormconfig' file -> clear
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      // synchronize: true, // 실제 운영 DB와 연동되게 되면 내가 개발했을 때 변경사항이 모조리 반영되어 버림
      // [중요] 배포, 개발, 실행 환경에 따라서 설정을 여러개 둔다.
      synchronize: process.env.NODE_ENV !== 'prod',
      // logging: true, // console 
      // [옵션] 개발 환경에서 sql을 확인하고 싶을 때
      logging: process.env.NODE_ENV !== 'prod' && process.env.NODE_ENV !== 'test',
      // entities: [Restaurant],
      entities: [User, Verification, Restaurant, Category],
    }),
    GraphQLModule.forRootAsync( {
      // Note : GraphQL의 버전에 따른 이슈입니다.
      // Version 10. Error [GraphQLModule] Missing "driver" option
      // source : https://github.com/nestjs/graphql/issues/2004
      //          https://docs.nestjs.com/graphql/quick-start#async-configuration
      driver: ApolloDriver,
      useFactory: () => ({
        autoSchemaFile: true,
        context: ({req}) => ({user: req['user']}),
      })
    } ),
    JwtModule.forRoot({
      privateKey: process.env.PRIVATE_KEY,
    }),
    MailModule.forRoot({
      apiKey: process.env.MAILGUN_API_KEY,
      domain:process.env.MAILGUN_DOMAIN_NAME,
      fromEmail: process.env.MAILGUN_FROM_EMAIL
    }),
    RestaurnatsModule,
    UsersModule,
    CommonModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule { // middleware class를 사용하고 싶다면 app.module에 구현
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JwtMiddleware).forRoutes({
      path:"/graphql",
      method: RequestMethod.POST,
    });
  }
  
}
