import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class BusquedaService {
  //para la barra de busqueda del header
  private cadenaBusqueda = signal('');
  private mensajeUi = signal('');

  establecerCadenaBusqueda(valor: string) {
    this.cadenaBusqueda.set(valor);
  }

  obtenerCadenaBusqueda() {
    return this.cadenaBusqueda;
  }

  establecerMensajeUi(valor: string) {
    this.mensajeUi.set(valor);
  }

  obtenerMensajeUi() {
    return this.mensajeUi;
  }

  limpiarMensajeUi() {
    this.mensajeUi.set('');
  }
}
