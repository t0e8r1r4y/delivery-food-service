export class Restaurant {
    constructor(
        readonly id : number,
        readonly name : string,
        readonly coverImage : string,
        readonly address : string,
        readonly categoryId : number,
        readonly ownerId : number,
        readonly isPromoted : boolean,
        readonly promotedUntil : Date,
        readonly createdAt : Date,
        readonly updatedAt : Date,
    ) {}
}