import { CoreOutput } from "src/common/dtos/output.dto";
import { User } from "../../infra/entities/user.entity";
import { Verification } from "../../infra/entities/verification.entity";

export class repositoryResult extends CoreOutput {
    user? : User;
}

export class verificationRepositoryResult extends CoreOutput {
    verification? : Verification;
}