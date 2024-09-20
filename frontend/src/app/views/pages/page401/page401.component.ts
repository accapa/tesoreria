import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-page401',
  templateUrl: './page401.component.html',
  styleUrls: ['./page401.component.scss']
})
export class Page401Component {

  constructor(private router: Router) { }

  login(): void {
    this.router.navigate(['/login']);
  }
}
