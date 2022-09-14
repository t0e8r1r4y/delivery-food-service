import { Test } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import exp from "constants";
import { string } from "joi";
import { Repository } from "typeorm";
import { JwtService } from "../../jwt/jwt.service";
import { MailService } from "../../mail/mail.service";
import { UserEntity, UserRole } from "../infra/db/entities/user.entity";
import { Verification } from "../infra/db/entities/verification.entity";
import { UsersService } from "./users.service";

const mockRepository = () => ({
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    findOneOrFail: jest.fn(),
    delete: jest.fn(),
});

const mockJwtService = () => ({
    sign: jest.fn(() => 'test-token'),
    verify: jest.fn(),
  });
  
  const mockMailService = () => ({
    sendVerificationEmail: jest.fn(),
  });

type MockRepository<T = any> = Partial< Record< keyof Repository<T>, jest.Mock > >;

describe("UserService", () => {

    let service: UsersService;
    let usersRepository: MockRepository<UserEntity>;
    let verificationsRepository: MockRepository<Verification>;
    let mailService: MailService;
    let jwtService: JwtService;

    beforeEach(async () => {
        const modules = await Test.createTestingModule({
            providers: [
                UsersService, 
                {
                    provide: getRepositoryToken(UserEntity), 
                    useValue: mockRepository()
                },
                {
                    provide: getRepositoryToken(Verification), 
                    useValue: mockRepository()
                },
                {
                    provide: JwtService,
                    useValue: mockJwtService()
                },
                {
                    provide: MailService,
                    useValue: mockMailService()
                },
            ],
        }).compile();
        service = modules.get<UsersService>(UsersService);
        mailService = modules.get<MailService>(MailService);
        jwtService = modules.get<JwtService>(JwtService);
        usersRepository = modules.get(getRepositoryToken(UserEntity));
        verificationsRepository = modules.get(getRepositoryToken(Verification));
    })

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    // start createAccount 
    it.todo('createAccount');
    describe("createAccount - 3 parts", () => {
        const createAccountInput = {
            email: '',
            password: '',
            role: 0
        };


        // part 1.
        it('이미 사용자가 있으면 fail을 리턴합니다', async () => {
            usersRepository.findOne.mockReturnValue({
                id: 1,
                email: 'test@naver.com',
            });

            const res = await service.createAccount(createAccountInput);

            expect(res).toMatchObject({
                ok: false,
                error: '이미 존재하는 사용자입니다.',
            });
        });

        // part 2
        it('새로운 유저를 생성합니다.', async () => {

            usersRepository.findOne.mockResolvedValue(undefined);
            usersRepository.create.mockReturnValue(createAccountInput);
            usersRepository.save.mockResolvedValue(createAccountInput);

            verificationsRepository.create.mockReturnValue({
              user: createAccountInput,
            });
            verificationsRepository.save.mockResolvedValue({
                code: 'code',
            });
      
            const result = await service.createAccount(createAccountInput);
      
            // 실행 후 라인 순서대로 테스트를 진행
            expect(usersRepository.create).toHaveBeenCalledTimes(1);
            expect(usersRepository.create).toHaveBeenCalledWith(createAccountInput);
      
            expect(usersRepository.save).toHaveBeenCalledTimes(1);
            expect(usersRepository.save).toHaveBeenCalledWith(createAccountInput);

            expect(verificationsRepository.create).toHaveBeenCalledTimes(1);
            expect(verificationsRepository.create).toHaveBeenCalledWith({
              user: createAccountInput,
            });
      
            expect(verificationsRepository.save).toHaveBeenCalledTimes(1);
            expect(verificationsRepository.save).toHaveBeenCalledWith({
              user: createAccountInput,
            });

    
            expect(mailService.sendVerificationEmail).toHaveBeenCalledTimes(1);
            expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(
              expect.any(String),
              expect.any(String),
            );
            // 최종결과
            expect(result).toEqual({ ok: true });
        });

        // part 3
        it('예외 케이스로 실패하는 경우 fail을 리턴합니다.',async () => {
            // 강제로 예외를 발생시킴
            usersRepository.findOne.mockRejectedValue(new Error());
            const result = await service.createAccount(createAccountInput);
            expect(result).toEqual({ok: false, error: "계정을 생성할 수 없습니다."});
        });

    }); // end createAccount Test 


    // start login test
    it.todo('login');
    describe('login - 4 parts', () => {

        const loginInput = {
            email: 'test@naver.com',
            password: 'test12345' 
        }
        // part1
        it('사용자가 없는 경우 fail을 리턴합니다.', async () => {
            usersRepository.findOne.mockResolvedValue(null); // 사용자가 없다 = null
            
            const result = await service.login(loginInput);

            expect(usersRepository.findOne).toHaveBeenCalledTimes(1);
            expect(usersRepository.findOne).toHaveBeenCalledWith(
                expect.any(Object), // <- findOne method에서 하나의 객체를 받는다. { } 안에 where과 select가 포함
            );
            expect(result).toEqual({
                ok: false,
                error: '사용자를 찾을 수 없습니다.',
            })

        });
        // part2
        it('비밀번호가 틀린 경우 fail을 리턴합니다.',async () => {

            const mockedUser = {
                id: 1,
                checkPassword: jest.fn(()=>Promise.resolve(false))
            };

            usersRepository.findOne.mockResolvedValue(mockedUser);

            const result = await service.login(loginInput);

            expect(result).toEqual({ok: false, error: '비밀번호가 틀렸습니다.'});
        });
        // part3
        it('비밀번호가 맞는 경우 토큰을 리턴 받습니다.',async () => {

            const mockedUser = {
                id: 1,
                checkPassword: jest.fn(()=>Promise.resolve(true))
            };

            usersRepository.findOne.mockResolvedValue(mockedUser);

            const result = await service.login(loginInput);

            expect(jwtService.sign).toHaveBeenCalledTimes(1);
            expect(jwtService.sign).toHaveBeenCalledWith(expect.any(Number));
            expect(result).toEqual({ok: true, token: 'test-token'})
        });
        // part4
        it('예외가 발생하는 경우 false를 리턴합니다.',async () => {
            usersRepository.findOne.mockRejectedValue(new Error());
            const result = await service.login(loginInput);
            expect(result).toEqual({ ok: false, error: '로그인을 할 수 없습니다.' });
        })

    }); // end login test

    // start findById
    it.todo('findById');
    describe('findById - 2 Parts', () => {
        const findByIdInput = {
            id: 1,
        }
        // Part 1
        it('유저를 발견한 경우 true와 찾은 사용자 엔티티를 리턴합니다.',async () => {
            usersRepository.findOne.mockResolvedValue(findByIdInput);
            const result = await service.findById(findByIdInput.id);
            expect(result).toEqual({ ok: true, user: findByIdInput });
        });
        // Part 2
        it('유저가 없는 경우에 false를 리턴합니다.',async () => {
            // 해당 테스트에서 현재 계속해서 true가 리턴이 된다.
            usersRepository.findOne.mockResolvedValue(null);
            const result = await service.findById(999);
            expect(result).toEqual({ ok: false, error: '사용자를 찾지 못했습니다.' });
        });
    }); // end findById

    // start edit profile
    it.todo('editProfile');
    describe('editProfile - 3 Parts', () => {
        // Part 1
        it('이메일을 변경합니다.',async () => {
            const oldUser = {
                email: 'test@naver.com',
                verified: true,
            };

            const afterEditProfile = {
                userId: 1,
                input: {email: 'test123@naver.com'},
            };

            const newVerification = {
                code: 'code',
            }

            const newUser = {
                verified: false,
                email: afterEditProfile.input.email
            }

            usersRepository.findOne.mockResolvedValue(oldUser);
            verificationsRepository.create.mockReturnValue(newVerification);
            verificationsRepository.save.mockReturnValue(newVerification);

            await service.editProfile(afterEditProfile.userId, afterEditProfile.input);

            expect(usersRepository.findOne).toHaveBeenCalledTimes(1);
            expect(usersRepository.findOne).toHaveBeenCalledWith(
                { "where" : {"id": afterEditProfile.userId}},                
            );
            expect(verificationsRepository.create).toHaveBeenCalledWith({user:newUser});
            expect(verificationsRepository.save).toHaveBeenCalledWith(newVerification,);

            expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(
                newUser.email,
                newVerification.code,
            );


        });
        // Part 2
        it('패스워드를 변경합니다.',async () => {
            const editProfileInput = {
                userId: 1,
                input: {password: 'newpassword'},
            };
            usersRepository.findOne.mockReturnValue({password: 'old'});

            const result = await service.editProfile(editProfileInput.userId, editProfileInput.input);

            expect(usersRepository.save).toHaveBeenCalledTimes(1);
            expect(usersRepository.save).toHaveBeenCalledWith(editProfileInput.input);

            expect(result).toEqual({ ok: true });
        });
        // Part 3
        it('예외로 인해 실패시 false를 리턴합니다.',async () => {
            usersRepository.findOne.mockRejectedValue(new Error());
            const result = await service.editProfile(1, {email: 'test'});
            expect(result).toEqual({ ok:false, error: '프로파일 업데이트가 불가능합니다.' });
        });
    });

    // start verifyEmail
    it.todo('verifyEmail');
    describe('verifyEmail - 3 Parts', () => {
        // Parts 1
        it('이메일을 검증합니다.',async () => {
            const mockedVerification = {
                user: {
                    verified: false,
                },
                id: 1,
            }

            verificationsRepository.findOne.mockResolvedValue(mockedVerification);

            const result = await service.verifyEmail('');

            expect(verificationsRepository.findOne).toHaveBeenCalledTimes(1);
            expect(verificationsRepository.findOne).toHaveBeenCalledWith(
                expect.any(Object),  
            );

            expect(usersRepository.save).toHaveBeenCalledTimes(1);
            expect(usersRepository.save).toHaveBeenCalledWith( {verified: true} );

            expect(verificationsRepository.delete).toHaveBeenCalledTimes(1);
            expect(verificationsRepository.delete).toHaveBeenCalledWith(
                mockedVerification.id,
            );

            expect(result).toEqual({ ok:true });
        });
        // Part 2
        it('인증값을 찾지 못한 경우 false를 리턴합니다.', async () => {
            verificationsRepository.findOne.mockResolvedValue(undefined);
            const result = await service.verifyEmail('');
            expect(result).toEqual({ ok: false, error: '인증값을 찾지 못했습니다.' });
        });
        // Part 3
        it('예외상황에서 false를 리턴합니다.', async () => {
            verificationsRepository.findOne.mockRejectedValue(new Error());
            const result = await service.verifyEmail('');
            console.log(result);
            expect(result).toEqual({ ok: false, error: '인증에 실패했습니다.' });
        });
    });

}) // end UsersService UT.