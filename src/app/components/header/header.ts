
import { Component, effect, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Session } from '@supabase/supabase-js';
import { Supaservice } from '../../services/supaservice';
import { BusquedaService } from '../../services/busqueda.service';

@Component({
  selector: 'app-header',
  imports: [FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  router: Router = inject(Router);
  private supaservice: Supaservice = inject(Supaservice);
  private busquedaService: BusquedaService = inject(BusquedaService);
  session = signal<Session | null>(null);

  /*
  Este formulario se hace con Plantilla como se indica en las especificaciones del github:
  Formulari de plantilla per al buscador reactiu de plantes solars
  */
  mostrarBusqueda = signal(false);
  mostrarMenuPerfil = signal(false);
  mostrarMenuMovil = signal(false); //para que se vea bien en formato telefono
  mensajeUi = this.busquedaService.obtenerMensajeUi();

  cadenaBusqueda = this.busquedaService.obtenerCadenaBusqueda();

  buscar($event: string){
    this.busquedaService.establecerCadenaBusqueda($event);
  }

  alternarBusqueda() {
    this.mostrarBusqueda.set(!this.mostrarBusqueda());
  }

  alternarMenuPerfil() {
    this.mostrarMenuPerfil.set(!this.mostrarMenuPerfil());
  }
  
  //para que se vea bien en formato telefono
  alternarMenuMovil() {
    this.mostrarMenuMovil.set(!this.mostrarMenuMovil());
  }

  constructor(){
    this.supaservice.authChangesObservable().subscribe(({
      event, session }) => {
        console.log('Auth event:', event);
        console.log('Session:', session);
        this.session.set(session);
      });

    effect((onCleanup) => {
      const message = this.mensajeUi();
      if (!message) {
        return;
      }

      const timeoutId = setTimeout(() => {
        this.busquedaService.limpiarMensajeUi();
      }, 5000);

      onCleanup(() => clearTimeout(timeoutId));
    });
  }

  limpiarMensaje() {
    this.busquedaService.limpiarMensajeUi();
  }

  async logout(){
    await this.supaservice.logout();
    await this.router.navigate(['/home']);
  }

}
