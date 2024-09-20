import { Component } from '@angular/core';
import { FooterComponent } from '@coreui/angular';
import { FooterService } from './default-footer.service';

@Component({
  selector: 'app-default-footer',
  templateUrl: './default-footer.component.html',
  styleUrls: ['./default-footer.component.scss'],
})
export class DefaultFooterComponent extends FooterComponent {
  public version: string | null = null;
  constructor(public footerService: FooterService) {
    super();
  }

  ngOnInit(): void {
    this.getVersion();
  }
  
  private getVersion(): void {
    this.footerService.getVersion().subscribe({
      next: (ver: string) => {
        this.version = ver;
      },
      error: e => console.log(e)
    });
  }
}
