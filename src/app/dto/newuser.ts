export class NewUser {

   constructor(login: string, role: string, pwd: string, usercryptomode: boolean, email: string, fullname: string) {
    this.login = login;
    this.role = role;
    this.pwd = pwd;
    this.usercryptomode = usercryptomode;
    this.email = email;
    this.fullname = fullname;
  }

  login: string;
  role: string;
  pwd: string;
  usercryptomode: boolean;
  email: string;
  fullname: string;
}
