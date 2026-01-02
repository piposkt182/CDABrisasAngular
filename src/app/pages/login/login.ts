import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from './../../../environments/environment'

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  
  private readonly baseUrl = environment.API_URL;
  toggleForm: boolean = true;
  registerObj: any = {
    UserName: "",
    PasswordHash: "",
    RoleId: 1
  };
  loginObj: any ={
    UserName: "",
    Password: ""
  }

  http = inject(HttpClient);
  router = inject(Router);

  onRegister(){
    debugger;
    this.http.post(`${this.baseUrl}/User/CreateUser`,this.registerObj).subscribe((res:any)=>{
      debugger;
      alert("se registro exitosamente");
    },error => {
      debugger;
      if(error.status == 400){
      alert("Objeto usuario invalido");
      }else if(error.status == 400){
        alert(error.error);
      }
    });
  }

  onLogin(){
      this.http.post( `${this.baseUrl}/User/Login`,this.loginObj).subscribe((res:any)=>{
      debugger;
      alert("Login exitosamente");
      localStorage.setItem('userApp', JSON.stringify(res));
      this.router.navigateByUrl("user-list");
    },error => {
      debugger;
      if(error.status == 401){
      alert("Usuario invalido");
      }
    });
  };
}
