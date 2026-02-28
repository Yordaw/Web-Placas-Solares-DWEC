import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Supaservice } from '../services/supaservice';
import { BusquedaService } from '../services/busqueda.service';

export const adminGuard: CanActivateFn = async () => {
  //Esto comprueba si el usuario tiene rol admin o no.

  const supaservice = inject(Supaservice);
  const busquedaService = inject(BusquedaService);
  const router = inject(Router);

  try {
    const user = await supaservice.getCurrentUser();
    if (!user) {
      busquedaService.establecerMensajeUi('Debes iniciar sesión para acceder a esta página');
      await router.navigate(['/login']);
      return false;
    }

    const profile = await supaservice.getProfilePlacas(user.id);
    if (profile?.role === 'admin') {
      return true;
    }
  } catch {
  }

  busquedaService.establecerMensajeUi('No tienes permisos de administrador para entrar en esta página');
  await router.navigate(['/home']);
  return false;
};
