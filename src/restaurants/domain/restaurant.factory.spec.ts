import { EventBus } from "@nestjs/cqrs";
import { Test } from "@nestjs/testing";
import { Restaurant } from "./restaurant";
import { RestaurantFactory } from "./restaurant.factory"

const eventBus = () => ({
    publish: jest.fn(),
})

describe('RestaurantFactory Test Code', () => {
    let restaurantFactory : RestaurantFactory;
    let eventBus: jest.Mocked<EventBus>;

    const date : Date = new Date();

    beforeAll(async () => {
       const module = await Test.createTestingModule({
        providers: [
            RestaurantFactory,
            {
                provide: EventBus,
                useValue: {
                    publish : jest.fn(),
                }
            }
        ]
       }).compile();

       restaurantFactory = module.get(RestaurantFactory);
    });

    it('create', () => {
        const restaurant = restaurantFactory.create(
            1,
            "testRestaurant",
            "https://test/location",
            "서울시 강남구",
            123,
            111,
            true,
            date,
            date,
            date,
        );

        const expected = new Restaurant(
            1,
            "testRestaurant",
            "https://test/location",
            "서울시 강남구",
            123,
            111,
            true,
            date,
            date,
            date,
        );

        expect(expected).toEqual(restaurant);
        // expect(eventBus.publish).toBeCalledTimes(1);
    });

    it('reconstitute', () => {
        const restaurant = restaurantFactory.reconstitute(
            1,
            "testRestaurant",
            "https://test/location",
            "서울시 강남구",
            123,
            111,
            true,
            date,
            date,
            date,
        );

        const expected = new Restaurant(
            1,
            "testRestaurant",
            "https://test/location",
            "서울시 강남구",
            123,
            111,
            true,
            date,
            date,
            date,
        );

        expect(expected).toEqual(restaurant);
        // expect(eventBus.publish).toBeCalledTimes(1);
    });

})