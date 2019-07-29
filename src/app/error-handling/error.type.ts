export enum arError {
  Value1,
  Value2
}

export class ErrorType {
  // error: number;
  // nom: string;
  // prenom: string;
  // dateCretation: Date;
  private status: arError;





  get getStatus(): arError {
    return this.status;
  }




  set setStatus(value: arError) {
    this.status = value;
  }
}
