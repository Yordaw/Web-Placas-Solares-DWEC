import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Supaservice } from '../services/supaservice';
import { BusquedaService } from '../services/busqueda.service';

export const authGuard: CanActivateFn = async () => {
  //solo mira si hay sesion activa y sino, te manda a login, para que no puedas bypasear la seguridad
  const supaservice = inject(Supaservice);
  const busquedaService = inject(BusquedaService);
  const router = inject(Router);

  try {
    const user = await supaservice.getCurrentUser();
    if (user) {
      return true;
    }
  } catch {
  }

  busquedaService.establecerMensajeUi('Debes iniciar sesión para acceder a esta página');
  await router.navigate(['/login']);
  return false;
};
