import { CoreOutput } from "src/common/dtos/output.dto";
import { User } from "../entities/user.entity";
import { Verification } from "../entities/verification.entity";

export class repositoryResult extends CoreOutput {
    user? : User;
}

export class verificationRepositoryResult extends CoreOutput {
    verification? : Verification;
}