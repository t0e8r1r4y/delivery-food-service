# Delivery-food-service

## 관련 기술 정리 링크
- 개발 환경 : [TypeScript/NestJS][TS_LINK], GraphQL, TypeORM
- 운영 환경 : 

## 설치, 환경설정 및 실행 방법

## 구현 요구 사항 목록
- 기능적 요구사항

      1. 유저는 회원가입을 할 수 있다.
      2. 회원은 '고객', '점주', '배달부'로 역할을 구분한다.
      3. 회원은 로그인 시 토큰을 발급받아 관련 로직에 사용한다.
      4. 회원 정보는 이메일과 비밀번호를 변경 할 수 있다.
      5. 회원 가입 시 이메일 인증을 하여야 한다. ( MailGun 서비스 비용 발생 문제로 메일은 발송하지 않는다. )
      6. 고객은 메뉴를 선택하여 주문한다.
      7. 고객은 결제한다.
      8. 주문이 되면 주문 내용이 레스토랑 주인에게 전달된다. ( 구현의 복잡성을 줄이기 위해 거절은 없다. )
      9. 주문의 상태는 '대기', '조리중', '조리완료', '픽업', '배달완료' 총 5가지로 구분된다.
      10. 점주는 레스토랑을 생성, 수정, 삭제할 수 있다.
      13. 점주는 메뉴를 생성, 수정, 삭제할 수 있다.
      14. 주문에 대하여 결제할 수 있다. ( 구현의 복잡성을 줄이기 위해 실제 결제 로직을 구현하지는 않는다. )
    
    
- 비기능적 요구사항 ( 트랜잭션 )

      1. 계정이 정상적으로 생성되지 못하는 경우 이메일 인증 정보는 제거되어야 한다.

<br/>

## 사용한 프레임워크
- 프레임워크명 : NestJS
- 목적 : NodeJS 기반의 백엔드 어플리케이션 개발에서 spring framework와 유사하게 구조화 된 프레임워크를 제공. 요구사항을 `구조적으로 구분`하고, 각 기능별 `관심사를 구분`하여 코드를 편리하게 작성할 수 있다는 이점이 있어 채택함.
- 기타 : nodejs 기술스택을 사용하는 회사에서 면접을 보게되어 해당 프로젝트를 시도해보게 됨. 또한 nestjs가 아직 오픈소스 기여라는 관점에서 진입장벽이 낮기에 도전해보고자 함.

<br/>

## 과제 진행 시 주안점
- 좋은 코드를 작성하고 싶었습니다.
    - 클린 아키텍처를 위한 구조
       ```
          ├── ./src/restaurants
          │   ├── ./src/restaurants/application
          │   │   ├── ./src/restaurants/application/adapter
          │   │   ├── ./src/restaurants/application/command
          │   │   ├── ./src/restaurants/application/event
          │   │   ├── ./src/restaurants/application/qeury
          │   │   └── ./src/restaurants/application/service
          │   ├── ./src/restaurants/domain
          │   │   └── ./src/restaurants/domain/repository
          │   ├── ./src/restaurants/infra
          │   │   ├── ./src/restaurants/infra/adapter
          │   │   └── ./src/restaurants/infra/db
          │   │       ├── ./src/restaurants/infra/db/entities
          │   │       └── ./src/restaurants/infra/db/repository
          │   └── ./src/restaurants/interface
          │       └── ./src/restaurants/interface/dtos
       ```
       - infra -> interface -> application -> domain 로 디렉터리를 구분함
       - 의존성의 방향이 한 방향으로 흐르도록함
    - 객체지향 생활체조 원칙을 최대한 지켜가고자 노력함
       - method decorator를 사용하여 가급적 한 메서드에 한 단계의 들여쓰기를 유지하려고 했습니다.
       - 또한 else 예약어를 사용하지 않을 수 있었습니다.
       - this를 제외하고 한 줄에 하나의 .을 찍도록 코드를 작성하였습니다.
        ![스크린샷 2022-09-30 오전 2 52 24](https://user-images.githubusercontent.com/91730236/193106269-714134e8-971d-4f45-b5a3-bfe62e2b1071.png)
        
       - 가급적 모든 엔티티를 작게 유지하기 위해서 아래 클래스를 extends하여 엔티티를 작성하였습니다. 또한 데이터 검증과 관련해서는 dto에 데코레이터를 추가하였습니다.
       
             ```
                  export class CoreEntity {
                      @PrimaryGeneratedColumn()
                      @Field(type => Number)
                      id : number;

                      @CreateDateColumn()
                      @Field(type => Date)
                      createdAt : Date;

                      @UpdateDateColumn()
                      @Field(type => Date)
                      updatedAt : Date;
                  }

                  @Entity('verification')
                  export class VerificationEntity extends CoreEntity{

                      @Column()
                      @Field(type => String)
                      code : string;

                      @OneToOne(tpye => UserEntity, {onDelete: "CASCADE"})
                      @JoinColumn()
                      user : UserEntity;

                      @BeforeInsert()
                      createCode() : void {
                          this.code = uuidv4();
                      }
                  }
             ```
       - 3개 이상의 인스턴스 변수를 사용하지 않기 위해 코드를 정리하였습니다.

    - 관심사의 적절한 분리
       - nestJS 프레임워크에는 CQRS 적용을 위한 라이브러리가 존재합니다.
       ```
            '@nestjs/cqrs';
       ```
       - 이 부분을 나눠야겠다고 생각한 이유는 GraphQL도 Query와 Mutation을 구분하는데, read와 write를 구분하는 이유는 구현과정에서 상호 영향을 줄 수 있기 때문입니다. 그것을 구분하기 위해서 command와 query로 구분하여 구현하였습니다.
- TDD 적용 연습
    - 테스트 코드가 어떻게 적용이 되면 좋을지 고민하였는데, 테스트도 로직이 분리된 만큼 분리되기에 내용을 파악하는데 더 유용하다고 생각했습니다.
    - spring에서는 객체 생성부터 테스트 함수를 만들고, 실패하는 부분에서 객체를 생성하며 진행하지만 jest에서 그렇게 적용하기에 바로 에러가 발생해서 힘든 부분이 있었습니다.
    - 그리고 객체의 생성을 factory 패턴을 적용하게되면 해당 객체를 생성하는 부분에 대해서는 테스트 코드 작성을 하지 않을 수도 있습니다.
    - 다만 하나의 service.ts라는 파일에 정의 된 메서드들을 command와 query 디렉토리에서 메서드 별로 파일을 구분하였는데, 테스트 코드도 하나의 메서드별로 파일로 분리되기 때문에 메서드 실행 흐름을 주석 혹은 sudo 코드로 작성하고, 테스트 파일을 먼저 Mocking Data로 테스트 후 로직을 작성하고 결론을 낼 수 있는 장점이 있었습니다.
        ```
          @TryCatchService('/EditRestaurantHandler/execute')
          async execute(command: EditRestaurantCommand): Promise<EditRestaurantOutput> {
              // sudo 코드 선작성 후 '해당파일'.spec.ts에서 테스트 작성 가능
              const { restaurantId, authOwner } = command;
              // 수정할 레스토랑 찾기
              // 레스토랑과 입력으로 받은 주인이 동일한 id인지 확인
              // 수정 값 반영
              // 수정 값 저장

              return { ok: true, };
          }
        ```
- 운영환경
    - 간단한 어플리케이션이라 비용을 최소화하는 방향으로 스택을 선정하고자 함


<br/>

## 개선 사항 작성
- 관심사를 억지로 분리하면서 생긴 코드 정리 필요
- 구분이 적절한지 피드백이 필요함
- 객체지향 생활체조 원칙을 spring 기반으로 학습하다보니, 상대적으로 nestjs에서 적용이 미숙함.

<br/>

## 사용한 라이브러리 설명  
          
- 사용 라이브러리 설명

    | 라이브러리명 | 버전 | 설명 |
    | --- | --- | --- |
    | @nestjs/apollo | 10.0.22 | graphQL을 사용하기 위한 목적으로 apollo 사용 |
    | apollo-server-express | 3.10.2 | 상동 |
    | @nestjs/graphql | 10.1.0 |  |
    | graphql | 16.6.0 | 상동 |
    | graphql-subscriptions | 2.0.0 | graphql에서 제공하는 websocket을 사용하기 위함 |
    | graphql-ws | 5.10.1 | 상동( 위 내용과 사용법이 다름 ) |
    | @nestjs/cqrs | 9.0.1 | 관심사를 구분하여 읽기과 쓰기 영역을 구분하기 위함 |
    | @nestjs/schedule | 2.1.0 | 크론잡이나 스케쥴링 관련 작업을 수행하기 위함 |
    | @nestjs/typeorm | 9.0.1 | TypeScript ORM 구현체 |
    | typeorm | 0.3.9 | 상동 |
    | pg | 8.8.0 | progresql 데이터베이스 드라이버 | 
    | bcrypt | 5.0.1 | 비밀번호 암호화 라이브러리 |
    | joi | 17.6.0 | 환경변수값에 대한 벨리데이션 목적 |
    | uuid | 8.3.2 | 고유 id를 부여하기 위한 목적 |
    | got | 11.8.3 | http 요청 라이브러리 - mailgun 서버에 요청 코드 작성 목적 |
    | form-data | 4.0.0 | mailgun 서버에 제공하는 포맷을 가공하기 위한 목적 |


<br/>

## 폴더 구조 설명
```
└── ./src
    ├── ./src/auth
    ├── ./src/common
    │   ├── ./src/common/abstract-class
    │   ├── ./src/common/class-decorator.ts
    │   ├── ./src/common/dtos
    │   ├── ./src/common/entities
    │   └── ./src/common/method-decorator
    ├── ./src/headth-check
    ├── ./src/jwt
    ├── ./src/mail
    ├── ./src/orders
    │   ├── ./src/orders/dtos
    │   └── ./src/orders/entities
    ├── ./src/payments
    │   ├── ./src/payments/dtos
    │   └── ./src/payments/entities
    ├── ./src/restaurants
    │   ├── ./src/restaurants/application
    │   │   ├── ./src/restaurants/application/adapter
    │   │   ├── ./src/restaurants/application/command
    │   │   ├── ./src/restaurants/application/event
    │   │   ├── ./src/restaurants/application/qeury
    │   │   └── ./src/restaurants/application/service
    │   ├── ./src/restaurants/domain
    │   │   └── ./src/restaurants/domain/repository
    │   ├── ./src/restaurants/infra
    │   │   ├── ./src/restaurants/infra/adapter
    │   │   └── ./src/restaurants/infra/db
    │   │       ├── ./src/restaurants/infra/db/entities
    │   │       └── ./src/restaurants/infra/db/repository
    │   └── ./src/restaurants/interface
    │       └── ./src/restaurants/interface/dtos
    └── ./src/users
        ├── ./src/users/application
        │   ├── ./src/users/application/adapter
        │   ├── ./src/users/application/command
        │   ├── ./src/users/application/event
        │   ├── ./src/users/application/query
        │   └── ./src/users/application/service
        ├── ./src/users/domain
        │   └── ./src/users/domain/repository
        ├── ./src/users/example
        ├── ./src/users/infra
        │   ├── ./src/users/infra/adapter
        │   └── ./src/users/infra/db
        │       ├── ./src/users/infra/db/entities
        │       └── ./src/users/infra/db/repository
        └── ./src/users/interface
            └── ./src/users/interface/dtos
```

<br/>


[//]: # (These are reference links used in the body of this note and get stripped out when the markdown processor does its job. There is no need to format nicely because it shouldn't be seen. Thanks SO - http://stackoverflow.com/questions/4823468/store-comments-in-markdown-syntax)
   [TS_LINK]: <https://github.com/t0e8r1r4y/blogContents/tree/main/DEV/ts>
