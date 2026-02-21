import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Supaservice } from '../services/supaservice';

export const adminGuard: CanActivateFn = async () => {
  const supaservice = inject(Supaservice);
  const router = inject(Router);

  try {
    const user = await supaservice.getCurrentUser();
    if (!user) {
      supaservice.setUiMessage('Debes iniciar sesión para acceder a esta página');
      await router.navigate(['/login']);
      return false;
    }

    const profile = await supaservice.getProfilePlacas(user.id);
    if (profile?.role === 'admin') {
      return true;
    }
  } catch {
  }

  supaservice.setUiMessage('No tienes permisos de administrador para entrar en esta página');
  await router.navigate(['/home']);
  return false;
};
