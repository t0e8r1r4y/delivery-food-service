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

## 사용한 프레임워크 및 라이브러리 설명  

- 사용 프레임워크  
    - 프레임워크명 : NestJS
    - 목적 : NodeJS 기반의 백엔드 어플리케이션 개발에서 spring framework와 유사하게 구조화 된 프레임워크를 제공. 요구사항을 구조적으로 구분하고, 각 기능별 관심사를 구분하여 코드를 편리하게 작성할 수 있다는 이점이 있어 채택함.
          
- 사용 라이브러리 설명

    | 라이브러리명 | 버전 | 설명 |
    | --- | --- | --- |
    | @nestjs/apollo | 10.0.22 | graphQL을 사용하기 위한 목적으로 apollo 사용 |
    | apollo-server-express | 3.10.2 | 상동 |
    | @nestjs/graphql | 10.1.0 | |
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


<br/>

## 과제 진행 시 주안점


<br/>

## 한계점 및 개선 사항 작성

<br/>


[//]: # (These are reference links used in the body of this note and get stripped out when the markdown processor does its job. There is no need to format nicely because it shouldn't be seen. Thanks SO - http://stackoverflow.com/questions/4823468/store-comments-in-markdown-syntax)
   [TS_LINK]: <https://github.com/t0e8r1r4y/blogContents/tree/main/DEV/ts>
