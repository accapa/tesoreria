import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from './login.service';

@Component({
  selector: 'app-logout',
  template: ''
})
export class LogoutComponent {

  constructor(
    private loginService: LoginService,
    private router: Router) {
    this.loginService.logout().subscribe({
      next: () => {
        localStorage.clear();
        console.log('cerrado con éxito')
      },
      error: e => console.log('Error', e)
    });
    this.router.navigate(['/login']);
  }
}
