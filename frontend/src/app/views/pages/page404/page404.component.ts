import { Component } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-page404',
  templateUrl: './page404.component.html',
  styleUrls: ['./page404.component.scss']
})
export class Page404Component {

  constructor(private location: Location) { }

  regresar(): void {
    this.location.back();
  }
}
