import { CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const userName = localStorage.getItem('userName');
  if (userName === null || userName === undefined || userName === '') {
    console.error('No ha iniciado sesión');
    window.location.href = '#/401';
    return false;
  }

  const storedRoles = localStorage.getItem('userRoles');
  if (!storedRoles || storedRoles === undefined || storedRoles === 'undefined') {
    alert('No tiene ROLES asignados acceder a esta ruta');
    return false;
  }

  const roles = JSON.parse(storedRoles);
  const relesMenu = route.data.roles;
  //relesMenu === undefined; Si no indicamos los ROLES en los routing entonces permite el acceso
  if (relesMenu === undefined || relesMenu && relesMenu.some((role: any) => roles.includes(role))) {
    return true;
  }
  alert('No tienes permiso para acceder a esta ruta: ' + state.url);
  return false;
};
