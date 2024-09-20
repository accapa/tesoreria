//Ojo: Verificar que los roles de _nav.ts y de los routings deben coincidir
import { INavData } from '@coreui/angular';
import { Roles } from 'src/app/shared/base/roles.enum';

export interface CustomNavData extends INavData {
  roles?: string[];
  children?: CustomNavData[];
}

export const navItems: CustomNavData[] = [
  {
    name: 'Panel',
    url: '/dashboard',
    iconComponent: { name: 'cil-speedometer' },
    //badge: {color: 'info', text: 'NEW'},
    //roles: [Roles.Admin] //Si no indicamos ROLES entonces es para todos los roles
  },
  {
    title: true,
    name: 'Administración',
    roles: [Roles.Admin]
  },
  {
    name: 'Grupo',
    url: '/admin/grupo',
    iconComponent: { name: 'cil-home' },
    roles: [Roles.Admin]
  },
  {
    name: 'Usuarios',
    url: '/admin/usuario',
    iconComponent: { name: 'cil-user' },
    roles: [Roles.Admin]
  },
  {
    name: 'Alumno',
    url: '/admin/alumno',
    iconComponent: { name: 'cil-wc' },
    roles: [Roles.Admin]
  },
  {
    name: 'Concepto',
    url: '/admin/concepto',
    iconComponent: { name: 'cil-short-text' },
    roles: [Roles.Admin]
  },

  {
    name: 'Módulos del sistema',
    title: true,
    roles: [Roles.Admin]
  },

  {
    name: 'Reportes',
    url: '/reportes',
    roles: [Roles.Admin, Roles.Alumno],
    iconComponent: { name: 'cil-chart-pie' },
    children: [
      {
        name: 'Estado Financiero',
        url: '/reportes/estado-financiero',
        iconComponent: { name: 'cil-dollar' },
        roles: [Roles.Admin, Roles.Alumno],
      }
    ]
  },
  {
    name: 'Tesorería',
    url: '/tesoreria',
    iconComponent: { name: 'cil-industry' },
    children: [
      {
        name: 'Pagar deuda alumno',
        url: '/tesoreria/deuda-list', iconComponent: { name: 'cil-note-add' },
        roles: [Roles.Admin]
      }, 
      {
        name: 'Otros ingresos',
        url: '/tesoreria/pagos', iconComponent: { name: 'cil-filter-square' },
        roles: [Roles.Admin]
      },
      {
        name: 'Egresos',
        url: '/tesoreria/egresos', iconComponent: { name: 'cil-swap-horizontal' },
        roles: [Roles.Admin]
      },
      {
        name: 'Reportes',
        url: '/tesoreria/reportes',
        iconComponent: { name: 'cil-notes' },
        roles: [Roles.Admin]
      },
    ],
    roles: [Roles.Admin]
  },
];
