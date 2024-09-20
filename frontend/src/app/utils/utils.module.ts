import { NgModule } from '@angular/core';

@NgModule({
  declarations: [],
  imports: []
})
export class UtilsModule {
  private static correlativeCurrentByGroup: Map<string, number> = new Map<string, number>();

  static isNumeric(input: string): boolean {
    return !isNaN(Number(input)) && !/^\s*$/.test(input);
  }

  static currencyPEN(entero: number): string {
    const formatoMoneda = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' });
    return formatoMoneda.format(entero);
  }

  private static getNextCorrelative(tipoVenta: string): string {
    let correlativoActual = this.correlativeCurrentByGroup.get(tipoVenta) || 0;
    correlativoActual++;
    this.correlativeCurrentByGroup.set(tipoVenta, correlativoActual);
    return correlativoActual.toString().padStart(2, '0');
  }

  static generateSecuencia(itemsVentas: Array<any>) {
    itemsVentas.sort((a, b) => a.tipoVenta > b.tipoVenta ? 1 : (a.tipoVenta < b.tipoVenta ? -1 : 0));
    this.correlativeCurrentByGroup = new Map<string, number>();
    const arrayModificado = itemsVentas.map(item => ({
      secuencia: this.getNextCorrelative(item.tipoVenta),
      tipoVenta: item.tipoVenta,
      order: item.order,
      label: item.label,
    }));
    arrayModificado.sort((a, b) => a.order > b.order ? 1 : (a.order < b.order ? -1 : 0));
    return arrayModificado;
  }

  static randomString(length: number): string {
    const alphabet = 'ABCDEFGHIJKLMOPQRSTUVWXYZ0123456789';
    const len = alphabet.length;
    let result = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * len);
      result += alphabet.charAt(randomIndex);
    }
    return result;
  }

  static encryptID(id: number | string): string {
    return btoa((this.randomString(5) + id + this.randomString(5)).split('').reverse().join(''));
  }
}
