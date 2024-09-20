import { Component, Input } from '@angular/core';
import { HeaderComponent } from '@coreui/angular';
import { Usuario } from 'src/app/views/admin/usuario/usuario.model';
import { UsuarioService } from 'src/app/views/admin/usuario/usuario.service';

@Component({
  selector: 'app-default-header',
  templateUrl: './default-header.component.html',
})
export class DefaultHeaderComponent extends HeaderComponent {

  @Input() sidebarId: string = "sidebar";

  public userName: string | null = null;
  public userLastName = 'Error, usuario no registrado en persona';
  public roles = [];

  constructor(
    private usuarioService: UsuarioService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.getUsuario();
  }

  private getUsuario(): void {
    this.userName = localStorage.getItem('userName');
    const storedRoles = localStorage.getItem('userRoles');
    if (storedRoles) {
      this.roles = JSON.parse(storedRoles);
      this.usuarioService.getByUser(this.userName ?? '').subscribe({
        next: (user: Usuario) => {
          this.userLastName = user.nombres ?? ''
        },
        error: e => { this.userLastName = 'Error en el servidor' }
      });
    }
  }
}
