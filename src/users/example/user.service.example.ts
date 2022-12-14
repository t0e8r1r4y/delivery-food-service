// import { Test } from "@nestjs/testing";
// import { getRepositoryToken } from "@nestjs/typeorm";
// import exp from "constants";
// import { string } from "joi";
// import { Repository } from "typeorm";
// import { JwtService } from "../../jwt/jwt.service";
// import { MailService } from "../../mail/mail.service";
// import { UserEntity, UserRole } from "../infra/db/entities/user.entity";
// import { VerificationEntity } from "../infra/db/entities/verification.entity";
// import { UsersService } from "./users.service";

// const mockRepository = () => ({
//     findOne: jest.fn(),
//     save: jest.fn(),
//     create: jest.fn(),
//     findOneOrFail: jest.fn(),
//     delete: jest.fn(),
// });

// const mockJwtService = () => ({
//     sign: jest.fn(() => 'test-token'),
//     verify: jest.fn(),
//   });
  
//   const mockMailService = () => ({
//     sendVerificationEmail: jest.fn(),
//   });

// type MockRepository<T = any> = Partial< Record< keyof Repository<T>, jest.Mock > >;

// describe("UserService", () => {

//     let service: UsersService;
//     let usersRepository: MockRepository<UserEntity>;
//     let verificationsRepository: MockRepository<VerificationEntity>;
//     let mailService: MailService;
//     let jwtService: JwtService;

//     beforeEach(async () => {
//         const modules = await Test.createTestingModule({
//             providers: [
//                 UsersService, 
//                 {
//                     provide: getRepositoryToken(UserEntity), 
//                     useValue: mockRepository()
//                 },
//                 {
//                     provide: getRepositoryToken(VerificationEntity), 
//                     useValue: mockRepository()
//                 },
//                 {
//                     provide: JwtService,
//                     useValue: mockJwtService()
//                 },
//                 {
//                     provide: MailService,
//                     useValue: mockMailService()
//                 },
//             ],
//         }).compile();
//         service = modules.get<UsersService>(UsersService);
//         mailService = modules.get<MailService>(MailService);
//         jwtService = modules.get<JwtService>(JwtService);
//         usersRepository = modules.get(getRepositoryToken(UserEntity));
//         verificationsRepository = modules.get(getRepositoryToken(VerificationEntity));
//     })

//     it('should be defined', () => {
//         expect(service).toBeDefined();
//     });

//     // start createAccount 
//     it.todo('createAccount');
//     describe("createAccount - 3 parts", () => {
//         const createAccountInput = {
//             email: '',
//             password: '',
//             role: 0
//         };


//         // part 1.
//         it('?????? ???????????? ????????? fail??? ???????????????', async () => {
//             usersRepository.findOne.mockReturnValue({
//                 id: 1,
//                 email: 'test@naver.com',
//             });

//             const res = await service.createAccount(createAccountInput);

//             expect(res).toMatchObject({
//                 ok: false,
//                 error: '?????? ???????????? ??????????????????.',
//             });
//         });

//         // part 2
//         it('????????? ????????? ???????????????.', async () => {

//             usersRepository.findOne.mockResolvedValue(undefined);
//             usersRepository.create.mockReturnValue(createAccountInput);
//             usersRepository.save.mockResolvedValue(createAccountInput);

//             verificationsRepository.create.mockReturnValue({
//               user: createAccountInput,
//             });
//             verificationsRepository.save.mockResolvedValue({
//                 code: 'code',
//             });
      
//             const result = await service.createAccount(createAccountInput);
      
//             // ?????? ??? ?????? ???????????? ???????????? ??????
//             expect(usersRepository.create).toHaveBeenCalledTimes(1);
//             expect(usersRepository.create).toHaveBeenCalledWith(createAccountInput);
      
//             expect(usersRepository.save).toHaveBeenCalledTimes(1);
//             expect(usersRepository.save).toHaveBeenCalledWith(createAccountInput);

//             expect(verificationsRepository.create).toHaveBeenCalledTimes(1);
//             expect(verificationsRepository.create).toHaveBeenCalledWith({
//               user: createAccountInput,
//             });
      
//             expect(verificationsRepository.save).toHaveBeenCalledTimes(1);
//             expect(verificationsRepository.save).toHaveBeenCalledWith({
//               user: createAccountInput,
//             });

    
//             expect(mailService.sendVerificationEmail).toHaveBeenCalledTimes(1);
//             expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(
//               expect.any(String),
//               expect.any(String),
//             );
//             // ????????????
//             expect(result).toEqual({ ok: true });
//         });

//         // part 3
//         it('?????? ???????????? ???????????? ?????? fail??? ???????????????.',async () => {
//             // ????????? ????????? ????????????
//             usersRepository.findOne.mockRejectedValue(new Error());
//             const result = await service.createAccount(createAccountInput);
//             expect(result).toEqual({ok: false, error: "????????? ????????? ??? ????????????."});
//         });

//     }); // end createAccount Test 


//     // start login test
//     it.todo('login');
//     describe('login - 4 parts', () => {

//         const loginInput = {
//             email: 'test@naver.com',
//             password: 'test12345' 
//         }
//         // part1
//         it('???????????? ?????? ?????? fail??? ???????????????.', async () => {
//             usersRepository.findOne.mockResolvedValue(null); // ???????????? ?????? = null
            
//             const result = await service.login(loginInput);

//             expect(usersRepository.findOne).toHaveBeenCalledTimes(1);
//             expect(usersRepository.findOne).toHaveBeenCalledWith(
//                 expect.any(Object), // <- findOne method?????? ????????? ????????? ?????????. { } ?????? where??? select??? ??????
//             );
//             expect(result).toEqual({
//                 ok: false,
//                 error: '???????????? ?????? ??? ????????????.',
//             })

//         });
//         // part2
//         it('??????????????? ?????? ?????? fail??? ???????????????.',async () => {

//             const mockedUser = {
//                 id: 1,
//                 checkPassword: jest.fn(()=>Promise.resolve(false))
//             };

//             usersRepository.findOne.mockResolvedValue(mockedUser);

//             const result = await service.login(loginInput);

//             expect(result).toEqual({ok: false, error: '??????????????? ???????????????.'});
//         });
//         // part3
//         it('??????????????? ?????? ?????? ????????? ?????? ????????????.',async () => {

//             const mockedUser = {
//                 id: 1,
//                 checkPassword: jest.fn(()=>Promise.resolve(true))
//             };

//             usersRepository.findOne.mockResolvedValue(mockedUser);

//             const result = await service.login(loginInput);

//             expect(jwtService.sign).toHaveBeenCalledTimes(1);
//             expect(jwtService.sign).toHaveBeenCalledWith(expect.any(Number));
//             expect(result).toEqual({ok: true, token: 'test-token'})
//         });
//         // part4
//         it('????????? ???????????? ?????? false??? ???????????????.',async () => {
//             usersRepository.findOne.mockRejectedValue(new Error());
//             const result = await service.login(loginInput);
//             expect(result).toEqual({ ok: false, error: '???????????? ??? ??? ????????????.' });
//         })

//     }); // end login test

//     // start findById
//     it.todo('findById');
//     describe('findById - 2 Parts', () => {
//         const findByIdInput = {
//             id: 1,
//         }
//         // Part 1
//         it('????????? ????????? ?????? true??? ?????? ????????? ???????????? ???????????????.',async () => {
//             usersRepository.findOne.mockResolvedValue(findByIdInput);
//             const result = await service.findById(findByIdInput.id);
//             expect(result).toEqual({ ok: true, user: findByIdInput });
//         });
//         // Part 2
//         it('????????? ?????? ????????? false??? ???????????????.',async () => {
//             // ?????? ??????????????? ?????? ???????????? true??? ????????? ??????.
//             usersRepository.findOne.mockResolvedValue(null);
//             const result = await service.findById(999);
//             expect(result).toEqual({ ok: false, error: '???????????? ?????? ???????????????.' });
//         });
//     }); // end findById

//     // start edit profile
//     it.todo('editProfile');
//     describe('editProfile - 3 Parts', () => {
//         // Part 1
//         it('???????????? ???????????????.',async () => {
//             const oldUser = {
//                 email: 'test@naver.com',
//                 verified: true,
//             };

//             const afterEditProfile = {
//                 userId: 1,
//                 input: {email: 'test123@naver.com'},
//             };

//             const newVerification = {
//                 code: 'code',
//             }

//             const newUser = {
//                 verified: false,
//                 email: afterEditProfile.input.email
//             }

//             usersRepository.findOne.mockResolvedValue(oldUser);
//             verificationsRepository.create.mockReturnValue(newVerification);
//             verificationsRepository.save.mockReturnValue(newVerification);

//             await service.editProfile(afterEditProfile.userId, afterEditProfile.input);

//             expect(usersRepository.findOne).toHaveBeenCalledTimes(1);
//             expect(usersRepository.findOne).toHaveBeenCalledWith(
//                 { "where" : {"id": afterEditProfile.userId}},                
//             );
//             expect(verificationsRepository.create).toHaveBeenCalledWith({user:newUser});
//             expect(verificationsRepository.save).toHaveBeenCalledWith(newVerification,);

//             expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(
//                 newUser.email,
//                 newVerification.code,
//             );


//         });
//         // Part 2
//         it('??????????????? ???????????????.',async () => {
//             const editProfileInput = {
//                 userId: 1,
//                 input: {password: 'newpassword'},
//             };
//             usersRepository.findOne.mockReturnValue({password: 'old'});

//             const result = await service.editProfile(editProfileInput.userId, editProfileInput.input);

//             expect(usersRepository.save).toHaveBeenCalledTimes(1);
//             expect(usersRepository.save).toHaveBeenCalledWith(editProfileInput.input);

//             expect(result).toEqual({ ok: true });
//         });
//         // Part 3
//         it('????????? ?????? ????????? false??? ???????????????.',async () => {
//             usersRepository.findOne.mockRejectedValue(new Error());
//             const result = await service.editProfile(1, {email: 'test'});
//             expect(result).toEqual({ ok:false, error: '???????????? ??????????????? ??????????????????.' });
//         });
//     });

//     // start verifyEmail
//     it.todo('verifyEmail');
//     describe('verifyEmail - 3 Parts', () => {
//         // Parts 1
//         it('???????????? ???????????????.',async () => {
//             const mockedVerification = {
//                 user: {
//                     verified: false,
//                 },
//                 id: 1,
//             }

//             verificationsRepository.findOne.mockResolvedValue(mockedVerification);

//             const result = await service.verifyEmail('');

//             expect(verificationsRepository.findOne).toHaveBeenCalledTimes(1);
//             expect(verificationsRepository.findOne).toHaveBeenCalledWith(
//                 expect.any(Object),  
//             );

//             expect(usersRepository.save).toHaveBeenCalledTimes(1);
//             expect(usersRepository.save).toHaveBeenCalledWith( {verified: true} );

//             expect(verificationsRepository.delete).toHaveBeenCalledTimes(1);
//             expect(verificationsRepository.delete).toHaveBeenCalledWith(
//                 mockedVerification.id,
//             );

//             expect(result).toEqual({ ok:true });
//         });
//         // Part 2
//         it('???????????? ?????? ?????? ?????? false??? ???????????????.', async () => {
//             verificationsRepository.findOne.mockResolvedValue(undefined);
//             const result = await service.verifyEmail('');
//             expect(result).toEqual({ ok: false, error: '???????????? ?????? ???????????????.' });
//         });
//         // Part 3
//         it('?????????????????? false??? ???????????????.', async () => {
//             verificationsRepository.findOne.mockRejectedValue(new Error());
//             const result = await service.verifyEmail('');
//             console.log(result);
//             expect(result).toEqual({ ok: false, error: '????????? ??????????????????.' });
//         });
//     });

// }) // end UsersService UT.