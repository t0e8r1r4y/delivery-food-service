import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource, Repository } from 'typeorm';
import { UserEntity } from 'src/users/infra/db/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { number } from 'joi';
import { Verification } from 'src/users/infra/db/entities/verification.entity';

jest.mock('got', () => {
  return {
    post: jest.fn(),
  };
});

const GRAPHQL_ENDPOINT = '/graphql';

const testObject = {
  email : "new@naver.com",
  password : "123123123",
}

let testUserId : number;

// 해당 쿼리들은 playground에서 가져옵니다. => for test
const testQuery = {
  createAccount : `mutation{
    createAccount(input:{
      email:"${testObject.email}",
      password:"${testObject.password}",
      role:Client
    }) {
      ok
      error
    }
  }`,
  loginRightCredential : `mutation{
    login(input:{
      email:"${testObject.email}",
      password:"${testObject.password}"
    }) {
      ok
      error
      token
    }
  }`,
  loginWrongCredential : `mutation{
    login(input:{
      email:"${testObject.email}",
      password:"wrongValue"
    }) {
      ok
      error
      token
    }
  }`,
  userProfile : `{
    userProfile(userId:${testUserId}){
      ok
      error
      user {
        id
      }
    }
  }
`
}

// 테스트가 진행되는 코드입니다.
describe('UserModule (e2e)', () => {
  let app : INestApplication;
  let userRepository : Repository<UserEntity>
  let verificationRepository : Repository<Verification>
  let jwtToken : string;

  // 계정을 생성하고 그것을 다시 조회하는 흐름으로 진행하기 위해서 beforeAll로 추가함
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    userRepository = module.get<Repository<UserEntity>>(getRepositoryToken(UserEntity));
    verificationRepository = module.get<Repository<Verification>>(getRepositoryToken(Verification));
    await app.init();
  });

  afterAll(async () => {
    const dataSource = new DataSource({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });
    const connection = await dataSource.initialize();
    await connection.dropDatabase();
    await connection.destroy();
    await app.close();
  });

  // resolve로 받는 모든 부분을 테스트 합니다.
  it.todo('crateAccount');
  describe('createAccount', () => {

    it('계정을 생성합니다.', () => {
      return request(app.getHttpServer()).post(GRAPHQL_ENDPOINT).send({
        query: testQuery.createAccount,
      })
      .expect(200)
      .expect(res => {
        expect(res.body.data.createAccount.ok).toBeTruthy();
        expect(res.body.data.createAccount.error).toBe(null);
      })
    });

    it('계정을 생성하는데 실패합니다.', () => {
      return request(app.getHttpServer()).post(GRAPHQL_ENDPOINT).send({
        query: testQuery.createAccount,
      })
      .expect(200)
      .expect(res => {
        expect(res.body.data.createAccount.ok).toBeFalsy();
        expect(res.body.data.createAccount.error).toEqual("이미 존재하는 사용자입니다.");
      })
    });
    
  });

  it.todo('login');
  describe('login', () => {
    it('로그인을 진행합니다. 결과는 true이고 토큰을 받습니다.', () => {
      return request(app.getHttpServer()).post(GRAPHQL_ENDPOINT).send({
        query: testQuery.loginRightCredential,
      })
      .expect(200)
      .expect( res => {
        const{
          body: {
            data: {login},
          },
        } = res;
        expect(login.ok).toBeTruthy();
        expect(login.error).toBe(null);
        expect(login.token).toEqual(expect.any(String));
        jwtToken = login.token;
      });
    });

    it('로그인을 진행합니다. 결과는 false이고 error 결과를 받습니다.', () => {
      return request(app.getHttpServer()).post(GRAPHQL_ENDPOINT).send({
        query: testQuery.loginWrongCredential,
      })
      .expect(200)
      .expect( res => {
        const {
          body: {
            data: {login},
          },
        } = res;
        expect(login.ok).toBeFalsy();
        expect(login.error).toBe("비밀번호가 틀렸습니다.");
      })
    })
  });

  it.todo('userProfile');
  describe('userProfile', () => {
    let userId : number;
    beforeAll(async () => {
      const [user] = await userRepository.find();
      testUserId = user.id;
    });

    it('사용자의 프로파일을 조회하며 정상적으로 조회가 됩니다.', () => {
      return request(app.getHttpServer())
      .post(GRAPHQL_ENDPOINT)
      .set('X-JWT', jwtToken)
      .send({
        query: `
        {
          userProfile(userId:${testUserId}){
            ok
            error
            user {
              id
            }
          }
        }
      `,
      })
      .expect(200)
      .expect(res => {
        const { 
          body: {
            data: {
              userProfile: {
                ok,
                error,
                user:{id},
              }
            }
          }
        } = res;

        expect(ok).toBeTruthy();
        expect(error).toBe(null);
        expect(id).toBe(testUserId);
      })
    });

    it('사용자의 프로파일을 조회하며 정상 조회가 안됩니다.', () => {
      testUserId = 666;
      return request(app.getHttpServer())
      .post(GRAPHQL_ENDPOINT)
      .set(`x-jwt`, jwtToken)
      .send({
        query: `
        {
          userProfile(userId:${testUserId}){
            ok
            error
            user {
              id
            }
          }
        }
      `,
      })
      .expect(200)
      .expect(res => {
        const { 
          body: {
            data: {
              userProfile: {
                ok,
                error,
                user,
              },
            },
          },
        } = res;

        expect(ok).toBeFalsy();
        expect(error).toBe("사용자를 찾지 못했습니다.");
        expect(user).toBe(null);
      })
    });
  });


  it.todo('me');
  describe('me', () => {
    it('프로필을 찾습니다. 정상적으로 결과를 리턴합니다.', () => {
      return request(app.getHttpServer())
      .post(GRAPHQL_ENDPOINT)
      .set('X-JWT', jwtToken)
      .send({
        query: `
        {
          me {
            email
          }
        }
      `
      })
      .expect(200)
      .expect(res => {
        const {
          body : {
            data : {
              me: {email},
            },
          },
        } = res;
        expect(email).toBe(testObject.email);
      });
    });

    it('프로필을 찾습니다. 에러를 결과로 리턴합니다.', () => { 
      return request(app.getHttpServer())
      .post(GRAPHQL_ENDPOINT)
      .send({
        query: `
        {
          me {
            email
          }
        }
      `
      })
      .expect(200)
      .expect(res => {
        const {
          body : { errors }
        } = res;
        const [error] = errors;
        
        expect(error.message).toBe('Forbidden resource');
      });
    });
  });

  it.todo('editProfile');
  describe('editProfile', () => {
    const NEW_EMAIL = "testest2@naver.com";
    it('이메일 변경', ()  => {
      request(app.getHttpServer())
      .post(GRAPHQL_ENDPOINT)
      .set("X-JWT", jwtToken)
      .send({
        query: `mutation{
          editProfile(input:{
            email:"${NEW_EMAIL}"
          }) {
            ok
            error
          }
        }`
      })
      .expect(200)
      .expect(res => {
        const {
          body: {
            data: {editProfile: {ok, error}},
          },
        } = res;
        expect(ok).toBeTruthy();
        expect(error).toBe(null);
      });
    });

    // 토큰을 못받아 오는건지? 아니면 로직이 틀린건지 확인이 필요하다.
    // it('이메일 변경 여부 확인', () => {
    //   return request(app.getHttpServer())
    //   .post(GRAPHQL_ENDPOINT)
    //   .set("X-JWT", jwtToken)
    //   .send({
    //     query: `
    //     {
    //       me {
    //         email
    //       }
    //     }
    //   `
    //   })
    //   .expect(200)
    //   .expect(res => {
    //     const {
    //       body: {
    //         data: {
    //           me: {email},
    //         },
    //       },
    //     } = res;
    //     expect(email).toBe(NEW_EMAIL);
    //   })
    // })

    it.todo('이메일 변경 여부 확인');

    // 이건 확인할 방법이 기존 비번으로 로그인시 로그인이 안되어야겠네?
    it.todo('패스워드 변경');
  });

  it.todo('verifyEmail');
  describe('verifyEmail', () => {
    let verificationCode: string;
    beforeAll(async () => {
      const [verification] = await verificationRepository.find();
      verificationCode = verification.code;
    })


    it('이메일 인증 성공', () => {
      return request(app.getHttpServer()).post(GRAPHQL_ENDPOINT).send({
        query: `mutation{
          verifyEmail(input:{
            code: "${verificationCode}"
          }) {
            ok
            error
          }
        }`
      })
      .expect(200)
      .expect(res => {
        const {
          body: {
            data: {
              verifyEmail: {ok, error}
            },
          },
        } = res;
        expect(ok).toBeTruthy();
        expect(error).toBe(null);
      })
    });

    it('이메일 인증 실패', () => {
      return request(app.getHttpServer()).post(GRAPHQL_ENDPOINT).send({
        query: `mutation{
          verifyEmail(input:{
            code: "helll~~~~~~~~~~!!!!!"
          }) {
            ok
            error
          }
        }`
      })
      .expect(200)
      .expect(res => {
        const {
          body: {
            data: {
              verifyEmail: {ok, error}
            },
          },
        } = res;
        expect(ok).toBeFalsy();
        expect(error).toBe("인증값을 찾지 못했습니다.");
      })
    });
  });
  
});
