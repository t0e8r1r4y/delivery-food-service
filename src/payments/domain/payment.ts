export class Payment {
    constructor(
        readonly id : number,
        readonly transactionId : number,
        readonly userId : number,
        readonly restaurantId : number,
        readonly createdAt : Date,
        readonly updatedAt : Date,
    ) {}
}