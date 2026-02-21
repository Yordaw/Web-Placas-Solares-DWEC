import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Supaservice } from '../services/supaservice';

export const authGuard: CanActivateFn = async () => {
  const supaservice = inject(Supaservice);
  const router = inject(Router);

  try {
    const user = await supaservice.getCurrentUser();
    if (user) {
      return true;
    }
  } catch {
  }

  supaservice.setUiMessage('Debes iniciar sesión para acceder a esta página');
  await router.navigate(['/login']);
  return false;
};
