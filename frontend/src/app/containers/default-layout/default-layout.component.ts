import { Component, ViewChild } from '@angular/core';
import { CustomNavData, navItems } from './_nav';
import { ToasterComponent } from '@coreui/angular';
import { ToastService } from 'src/app/shared/toast/toast.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './default-layout.component.html',
  styleUrls: ['./default-layout.component.scss'],
})
export class DefaultLayoutComponent {
  @ViewChild(ToasterComponent) toaster!: ToasterComponent;

  constructor(public toasterService: ToastService) {
  }

  ngAfterViewInit() {
    this.toasterService.setToaster(this.toaster);
  }

  get filteredNavItems(): CustomNavData[] { //falta optimizar, hace todo el metodo por cada item
    const storedRoles = localStorage.getItem('userRoles');
    let roles: any = [];
    if (storedRoles) {
      roles = JSON.parse(storedRoles);
    }
    return this.filterNavDataByRoles(navItems, roles);
  }

  private filterNavDataByRoles(navData: CustomNavData[], allowedRoles: string[]): CustomNavData[] {
    return navData.filter((item) => {
      if (!item.roles)
        return true;
      if (item.roles && item.roles.some((role) => allowedRoles.includes(role))) {
        if (item.children) {
          item.children = this.filterNavDataByRoles(item.children, allowedRoles);
        }
        return true;
      }
      return false;
    });
  }
}
