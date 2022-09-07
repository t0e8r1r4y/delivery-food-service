import { Inject, Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { Test } from "./test.entity"

@Injectable()
export class TestService{
    constructor(
        @Inject('TEST_REPOSITORY')
        private testRepository : Repository<Test>
    ){}

    async testFunction() : Promise<Test> {
        return this.testRepository.findOne({});
    }

}