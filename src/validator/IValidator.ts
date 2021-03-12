export interface IValidator<T> {
    valid(entity: T): ValidationResult;
}

export class ValidationResult {
    valid: boolean;
    message: string;

    constructor(valid: boolean, message: string) {
        this.valid = valid;
        this.message = message;
    }
}