import { CoreOutput } from "src/common/dtos/output.dto";
import { UserEntity } from "../../infra/db/entities/user.entity";
import { VerificationEntity } from "../../infra/db/entities/verification.entity";

export class repositoryResult extends CoreOutput {
    user? : UserEntity;
}

export class verificationRepositoryResult extends CoreOutput {
    verification? : VerificationEntity;
}