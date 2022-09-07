import { DynamicModule, Provider } from '@nestjs/common';
import { getDataSourceToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { TYPEORM_EX_CUSTOM_REPOSITORY } from './typeorm-ex.decorator';


export class TypeOrmCustomModule {
  // CustomeRepository를 입력받음
  public static forCustomRepository<T extends new (...args: any[]) => any>(repositories: T[]): DynamicModule {
    const providers: Provider[] = [];

    console.log(repositories.length );

    for (const repository of repositories) {
      // 각각의 커스텀레퍼지토리에 TYPEORM_EX_CUSTOM_REPOSITORY Key로 정의된 메타데이터를 가져온다
      const entity = Reflect.getMetadata(TYPEORM_EX_CUSTOM_REPOSITORY, repository);

      if (!entity) {
        continue;
      }
	  // dataSource를 주입받아 방법 1과 같이 커스텀 레퍼지토리를 만들어주고 provider에 추가한다.
      providers.push({
        inject: [getDataSourceToken()],
        provide: repository,
        useFactory: (dataSource: DataSource): typeof repository => {
          const baseRepository = dataSource.getRepository<any>(entity);
          return new repository(baseRepository.target, baseRepository.manager, baseRepository.queryRunner);
        },
      });
    }
    
    return {
      exports: providers,
      module: TypeOrmCustomModule,
      providers,
    };
  }
}