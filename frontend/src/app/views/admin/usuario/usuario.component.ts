import { Component } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { UsuarioService } from './usuario.service';
import { ConfirmDialogService } from 'src/app/shared/confirm/confirm.app.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Usuario } from './usuario.model';
import { Role } from '../roles/roles.model';
import { BaseComponent } from 'src/app/shared/base/base.component';
import { ToastService } from 'src/app/shared/toast/toast.service';
import { Persona } from 'src/app/shared/base/persona/persona.model';
import { PersonaService } from 'src/app/shared/base/persona/persona.service';
import { EstadoReg } from 'src/app/shared/base/estado.enum';

@Component({
  selector: 'app-usuario',
  templateUrl: './usuario.component.html',
  styleUrls: ['./usuario.component.scss']
})
export class UsuarioComponent extends BaseComponent {
  modalFormVisible: boolean = false;
  usuarios: Usuario[] | null = null;
  changePass: boolean = false;
  roles: Role[] | null = null;
  usuarioForm!: FormGroup;
  searchForm!: FormGroup;
  showFormSearch = false;
  isLoading = false;
  constructor(
    public _spinner: NgxSpinnerService,
    private usuarioService: UsuarioService,
    private confDiService: ConfirmDialogService,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private toastService: ToastService,
    private personaService: PersonaService
  ) {
    super(_spinner, route, confDiService);
  }

  ngOnInit(): void {
    this.createUserForm();
    this.createSearchForm();
    this.handleNavigation();
  }

  private listRoles(): void {
    this.usuarioService.listRoles().subscribe({
      next: (res: any) => {
        this.roles = res;
      },
      error: e => { this.spinner.hide(); this.toastService.onError(e); }
    });
  }

  private createUserForm(): void {
    this.usuarioForm = this.formBuilder.group(
      {
        idUsuario: [''],
        dni: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(8), Validators.pattern(/^[0-9]*$/)]],
        usuario: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(8), Validators.pattern(/^[0-9]*$/)]],
        nombres: ['', [Validators.required]],
        apellidos: ['', [Validators.required]],
        clave: ['', [Validators.required]],
        roles: new FormControl([], Validators.required),
        estado: [EstadoReg.Activo, [Validators.required]],
        changePass: [this.changePass]
      }
    );
  }

  private createSearchForm(): void {
    this.searchForm = this.formBuilder.group(
      {
        estado: [1],
        usuario: [''],
        dni: [''],
        fechaDesde: [''],
        fechaHasta: [''],
      }
    );
  }

  public toggleForm(data: any): void {
    this.modalFormVisible = !this.modalFormVisible;
    if (this.modalFormVisible)
      this.listCombos()
  }

  public handleModalChange(event: boolean) {
    this.modalFormVisible = event;
    if (!this.modalFormVisible) {
      this.usuarioForm.reset();
      this.changePass = false;
    }
  }

  override loadAll(): void {
    this.spinner.show();
    const searchForm = this.searchForm?.getRawValue();
    this.usuarioService
      .query({
        ...{
          page: this.page,
          size: this.itemsPerPage,
          sort: this.sort()
        }, ...searchForm
      })
      .subscribe({
        next: (res: any) => {
          this.spinner.hide();
          this.totalItems = res.body.total;
          this.page = res.body.current_page;
          this.itemsPerPage = res.body.per_page;
          this.usuarios = res.body?.data;
        },
        error: e => { this.spinner.hide(); this.toastService.onError(e); },
      });
  }

  public searchSubmit() {
    this.loadAll()
  }

  private sort(): string[] {
    return [`${this.predicate},${this.ascending ? 'asc' : 'desc'}`];
  }

  private onSaveSuccess(): void {
    this.spinner.hide();
    this.toastService.addToast({ msg: 'Registrado con éxito.' });
    this.loadAll();
    this.onResetUsuarioForm(); //Cierra y resetea el formulario
  }

  public onSubmit() {
    if (this.usuarioForm.status !== 'VALID') {
      this.toastService.addToast({ title: 'Error', color: 'warning', msg: 'Faltan datos para registrar' });
      return;
    }
    this.spinner.show();
    this.usuarioForm.patchValue({changePass: this.changePass});
    const usuario = this.usuarioForm.getRawValue();
    this.usuarioService.save(usuario).subscribe({
      next: () => this.onSaveSuccess(),
      error: e => { this.spinner.hide(); this.toastService.onError(e); }
    });
  }

  override deleting(row: any): void {
    this.usuarioService.delete(row.idUsuario).subscribe({
      next: () => {
        this.spinner.hide();
        this.toastService.addToast({ msg: 'Eliminado con éxito' });
        this.loadAll();
      },
      error: (e) => { this.spinner.hide(); this.toastService.onError(e); },
    });
  }

  public getData(usuario: any): void {
    if (!usuario.idUsuario) {
      this.toastService.addToast({ title: 'Alerta', color: 'warning', msg: 'No existe datos para consultar' });
      return;
    }
    this.spinner.show();
    this.usuarioService.find(usuario.idUsuario).subscribe({
      next: (compra: Usuario) => {
        this.spinner.hide();
        this.listCombos();
        this.modalFormVisible = !this.modalFormVisible;
        this.usuarioForm.patchValue(compra);
      },
      error: (e) => { this.spinner.hide(); this.toastService.onError(e); },
    });
  }

  public toggleSearchForm(): void {
    this.showFormSearch = !this.showFormSearch;
    this.listCombos();
  }

  public onResetSearchForm() {
    this.searchForm.reset();
    this.handleNavigation();
  }

  public onResetUsuarioForm() {
    this.usuarioForm.reset();
    this.toggleForm(null);
  }

  public ngSelectGetDataFromOption(itemOption: any) {
    return itemOption.roleNombre
  }

  private listCombos(): void {
    if (!this.roles) {
      this.listRoles();
    }
  }

  public toggleShowPassword($e: any): void {
    this.changePass = $e.target.checked;
  }

  public searchDniInApi(): void {
    const dniControl = this.usuarioForm.get('dni');
    if (!dniControl?.valid) {
      this.toastService.addToast({ title: 'Alerta', color: 'warning', msg: 'Ingrese DNI válido' });
      return;
    }
    this.isLoading = true;
    this.personaService.getByDni(dniControl.value).subscribe({
      next: (persona: Persona) => {
        if (persona) {
          this.usuarioForm.patchValue({
            usuario: dniControl.value,
            nombres: persona.nombres,
            apellidos: persona.apellidoPaterno + ' ' + persona.apellidoMaterno
          });
          this.isLoading = false;
        } else {
          this.getPersonaFromAPI(dniControl.value);
        }
      },
      error: e => {
        this.isLoading = false;
        { this.spinner.hide(); this.toastService.onError(e); }
      }
    });
  }

  private getPersonaFromAPI(dni: string) {
    this.personaService.getPersonaFromApi(dni).subscribe({
      next: (persona: Persona) => {
        this.isLoading = false;
        this.usuarioForm.patchValue({
          usuario: dni,
          nombres: persona.nombres,
          apellidos: persona.apellidoPaterno + ' ' + persona.apellidoMaterno
        });
      },
      error: e => {
        this.isLoading = false;
        { this.spinner.hide(); this.toastService.onError(e); }
      }
    });
  }
}
