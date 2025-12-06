import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  UrlTree
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private auth: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {

    // Si no está logueado → redirigir a login
    if (!this.auth.isLoggedIn()) {
      return this.router.parseUrl(`/login?redirect=${encodeURIComponent(state.url)}`);
    }

    // Si la ruta no pide rol específico → permitir
    const requiredRole = route.data?.['role'] as string | undefined;
    if (!requiredRole) {
      return true;
    }

    // Si pide rol, comprobar
    const userRole = this.auth.getUserRole();
    if (userRole === requiredRole) {
      return true;
    }

    // Si el rol no coincide, redirigir a home (o a página 'no autorizado' si la creas)
    return this.router.parseUrl('/home');
  }
}
