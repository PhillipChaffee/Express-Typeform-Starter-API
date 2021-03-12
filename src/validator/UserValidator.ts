import {User} from "../entity/User";
import {IValidator, ValidationResult} from "./IValidator";

export class UserValidator implements IValidator<User>{
    valid(entity: User): ValidationResult {
        if(!entity){
            return new ValidationResult(false, "No user data.");
        } else if (!entity.providerId){
            return new ValidationResult(false, "A user must have a providerId.");
        } else if (!entity.displayName){
            return new ValidationResult(false, "A user must have a displayName.");
        } else {
            return new ValidationResult(true, '');
        }
    }
}