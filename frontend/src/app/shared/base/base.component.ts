import { Component, QueryList, ViewChildren } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ActivatedRoute } from '@angular/router';
import { combineLatest } from 'rxjs';
import { NgbdSortableHeader, SortEvent } from '../sort/NgbdSortableHeader';
import { EstadoReg } from '../../shared/base/estado.enum';
import { EstadoDeuda } from '../../shared/base/estado-deuda.enum';
import { Roles } from 'src/app/shared/base/roles.enum';
import { ConfirmDialogService } from 'src/app/shared/confirm/confirm.app.service';

@Component({
  template: '',
})
export class BaseComponent {
  page: number = 1;
  predicate!: string;
  ascending!: boolean;
  itemsPerPage!: number;
  totalItems = 0;
  Roles = Roles;
  collapsedRows: Set<number> = new Set<number>();
  @ViewChildren(NgbdSortableHeader) headers!: QueryList<NgbdSortableHeader>;
  constructor(
    protected spinner: NgxSpinnerService,
    private activatedRoute: ActivatedRoute,
    protected confirmDialogService: ConfirmDialogService | null,
  ) { }

  //Listado inicial o listado por defecto
  protected handleNavigation(): void {
    combineLatest([this.activatedRoute.data, this.activatedRoute.queryParamMap]).subscribe(([data, params]) => {
      const page = params.get('page');
      this.page = +(page ?? 1);
      const sort = (params.get('sort') ?? data['defaultSort']).split(',');
      this.predicate = sort[0];
      this.ascending = sort[1] === 'asc';
      this.loadAll();
    });
  }

  public transition(page: number): void { //pagination
    this.page = page;
    this.loadAll();
  }

  protected loadAll(): void {
    //Implementado por la clase hija
  }

  public onSort({ column, direction }: SortEvent) {
    this.headers.forEach((header) => {
      if (header.sortable !== column)
        header.direction = '';
    });
    this.predicate = column.toString()
    this.ascending = direction.toString() === 'asc'
    if (direction.toString() === '') {
      this.handleNavigation()
    } else {
      this.loadAll();
    }
  }

  public estadoReg(estado?: string | undefined | null): string {
    if (estado === null || estado === undefined || estado === '') {
      return '';
    }
    return EstadoReg[parseInt(estado, 10)];
  }

  public estadoDeuda(estado?: string | undefined | null): string {
    if (estado === null || estado === undefined || estado === '') {
      return '';
    }
    const names: { [key: string]: string } = {
      [EstadoDeuda.Pendiente]: 'Pendiente',
      [EstadoDeuda.Pagado]: 'Pagado',
    };
    return names[estado];;
  }

  public isActive(estado?: string | null): boolean {
    if (estado === null || estado === undefined || estado === '') {
      return false;
    }
    return Number(estado) === EstadoReg.Activo;;
  }

  get userRoles(): string[] {
    const storedRoles = localStorage.getItem('userRoles');
    if (storedRoles)
      return JSON.parse(storedRoles);
    return [];
  }

  public isShow(rolesPermitidos: string[]): boolean {
    return this.userRoles.some(r => rolesPermitidos.includes(r))
  }

  public dataDownload(data: any, fileName: string): void {
    const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  toggleCollapseTr(id: number): void {
    if (this.collapsedRows.has(id)) {
      this.collapsedRows.delete(id);
    } else {
      this.collapsedRows.add(id);
    }
  }

  isCollapsedTr(id: number | null | undefined): boolean {
    if (id === null || id === undefined)
      return false;
    return this.collapsedRows.has(id);
  }

  deleteData(row: any): void {
    this.confirmDialogService?.confirm('Confirmar', '¿Está seguro de eliminar?')
      .then((confirmed) => {
        if (!confirmed)
          return;
        this.deleting(row);
      })
      .catch(() => console.log('cancelado...'));
  }

  protected deleting(row: any): void {
    //implementado en la clase hija
  }
}