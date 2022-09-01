import { Test } from "@nestjs/testing";
import { CONFIG_OPTIONS } from "src/common/common.constants";
import { JwtService } from "./jwt.service";

//아래 dependency를 import했지만, 결과적으로 mocking 된 부분을 사용한다.
import * as jwt from 'jsonwebtoken';

const TEST_KEY = 'testKey';
const USER_ID = 1;

// [Important]
// 외부 라이브러리를 그대로 가져와서 테스트를 하는 것은 좋은 방법이 아니다.
// 내가 해당 서비스에 작성한 코드가 순서대로 동작하는지, 정상동작하는지를 확인하는 것이 테스트의 목적이다.
// 따라서 아래처럼 외부 라이브러리를 mocking 해줘야 한다.
jest.mock('jsonwebtoken', () => {
    return  {
        sign: jest.fn(() => 'TOKEN'),
        verify: jest.fn(() => ({id:USER_ID})),
    };
});


describe('jwtService ', () => {
    let service: JwtService;
    beforeEach(async () => {
        const  module = await Test.createTestingModule({
            providers: [
                JwtService,
                {
                    provide: CONFIG_OPTIONS,
                    useValue: { privateKey: TEST_KEY },
                },
            ],
        }).compile();
        service = module.get<JwtService>(JwtService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    })

    // Part1
    // sign method test start
    it.todo('sign');
    describe('sign', () => {
        it('signed token을 반환 합니다.', () => {
            const token = service.sign(1);
            expect(typeof token).toBe('string');
            expect(jwt.sign).toHaveBeenCalledTimes(1);
            expect(jwt.sign).toHaveBeenLastCalledWith(
                {id: 1},
                TEST_KEY,
            );
        });
    });


    // Part 2.
    it.todo('verify');
    describe('verify', () => {
        it('decoded token을 반환합니다.', () => {
            const decodedToken = service.verify('TOKEN');
            expect(jwt.verify).toHaveBeenCalledTimes(1);
            expect(jwt.verify).toHaveBeenCalledWith('TOKEN', TEST_KEY);
            // 객체를 리턴하는 부분에서 교차 검증이 필요할 수 있음. -> 가령 프로젝트에서 내용이 많은 객체를 리턴하는 경우
            // 모든 객체가 리턴되었는지에 대한 검증도 필요함
            expect(decodedToken).toEqual({"id":USER_ID});
            expect(decodedToken).not.toEqual(USER_ID); // <- not 유용하네!
        } );
    });

})