import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [RouterLink, RouterOutlet],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {

router = inject(Router);

loggOff(){
  localStorage.removeItem("userApp");
  this.router.navigateByUrl("login");
}

}
