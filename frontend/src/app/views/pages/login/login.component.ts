import { Component } from '@angular/core';
import { LoginService } from './login.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Usuario } from '../../admin/usuario/usuario.model';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  isSubmited = false;
  public version: string | null = null;
  loginForm!: FormGroup;
  msg = '';
  constructor(
    private loginService: LoginService,
    private formBuilder: FormBuilder,
    private router: Router) { }
  ngOnInit(): void {
    this.createLoginForm();
    this.getVersion();
  }

  private getVersion(): void {
    this.loginService.getVersion().subscribe({
      next: (ver: string) => {
        this.version = ver;
      },
      error: e => console.log(e)
    });
  }

  private createLoginForm(): void {
    this.loginForm = this.formBuilder.group(
      {
        username: ['', [Validators.required]],
        password: ['', [Validators.required]]
      }
    );
  }

  public onSubmit() {
    this.msg = '';
    if (this.loginForm.status !== 'VALID') {
      this.msg = 'Debe llenar todos los campos';
      return;
    }
    this.isSubmited = true;
    const usuario = this.loginForm.getRawValue();
    this.loginService.login(usuario).subscribe({
      next: (user: Usuario) => {
        localStorage.setItem('userName', user.usuario + '');
        localStorage.setItem('idGrupo', user.idGrupo + '');
        localStorage.setItem('userRoles', JSON.stringify(user.roles));
        this.onSaveSuccess();
      },
      error: (e) => {
        this.isSubmited = false;
        this.onError(e);
      }
    });
  }

  private onSaveSuccess(): void {
    this.router.navigate(['/dashboard'], { onSameUrlNavigation: 'reload' });
  }

  private onError(e: any): void {
    this.msg = (!e.ok ? (typeof e.error === 'string' ? e.error : (e.error !== null ? e.error.text : e.statusText)) : e.statusText)
  }
}
