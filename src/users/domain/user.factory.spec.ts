import { EventBus } from "@nestjs/cqrs";
import { Test } from "@nestjs/testing";
import { UserRole } from "../infra/db/entities/user.entity";
import { UserRepository } from "../infra/db/repository/user.repository";
import { User } from "./user";
import { UserFactory } from "./user.factory"

// 이벤트 버스에서 사용하고 있는 publish 메서드 Mocking
const evenBus = () => ({
    publish: jest.fn(),
});

describe('UserFactory Test Code', () => {
    let userFactory : UserFactory;
    let eventBus: jest.Mocked<EventBus>;

    const date : Date = new Date();

    // 테스트 전 모듈 세팅
    beforeAll(async () => {
        const module = await Test.createTestingModule({
            providers: [
                UserFactory,
                {
                    provide: EventBus,
                    useValue: {
                      publish: jest.fn(),
                    }
                }
            ],
        }).compile();

        userFactory = module.get(UserFactory);
        eventBus = module.get(EventBus);
    });

    it('create', () => {
        // Given

        // When
        const user = userFactory.create(
            1,
            'test@naver.com',
            '123123123',
            UserRole.Client,
            false,
            date,
            date,
            'testCode',
        );

        // Then
        const expected = new User(
            1,
            'test@naver.com',
            '123123123',
            UserRole.Client,
            false,
            date,
            date,
        );

        // Expect
        expect(expected).toBe(user);
        expect(eventBus.publish).toBeCalledTimes(1);
        
    });

    it.todo('reconstitute');
})