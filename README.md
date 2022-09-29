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


<br/>

## 폴더 구조 설명


<br/>

## 과제 진행 시 주안점


<br/>

## 한계점 및 개선 사항 작성

<br/>


[//]: # (These are reference links used in the body of this note and get stripped out when the markdown processor does its job. There is no need to format nicely because it shouldn't be seen. Thanks SO - http://stackoverflow.com/questions/4823468/store-comments-in-markdown-syntax)
   [TS_LINK]: <https://github.com/t0e8r1r4y/blogContents/tree/main/DEV/ts>
