export enum arError {
  WRONG_CREDENTIALS,
  Value2
}

export class ErrorType {
  private errorType: arError;

  get getErrorType(): arError {
    return this.errorType;
  }




  set setErrorType(value: arError) {
    this.errorType = value;
  }
}
