import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.obterTokenValido();

  if (token) {
    const request = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(request);
  }

  return next(req);
};