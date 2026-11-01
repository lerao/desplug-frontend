import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AuthUser {
  name: string;
  email: string;
  photo: string | null;
  role: 'professor' | 'admin';
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

const TOKEN_KEY = 'desplugaAI.token';
const USER_KEY = 'desplugaAI.user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private authState = new BehaviorSubject<boolean>(this.hasToken());
  readonly isLoggedIn$ = this.authState.asObservable();

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/auth/login`, { email, password })
      .pipe(
        tap((response) => {
          localStorage.setItem(TOKEN_KEY, response.token);
          localStorage.setItem(USER_KEY, JSON.stringify(response.user));
          this.authState.next(true);
        }),
        catchError((error) => {
          this.authState.next(false);
          return throwError(() => error);
        })
      );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.authState.next(false);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return this.hasToken();
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  getUser(): AuthUser | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  /** Atualiza os dados do usuário no storage local (após editar perfil) */
  updateStoredUser(user: Partial<AuthUser>): void {
    const current = this.getUser();
    if (current) {
      const updated = { ...current, ...user };
      localStorage.setItem(USER_KEY, JSON.stringify(updated));
    }
  }

  private hasToken(): boolean {
    return !!localStorage.getItem(TOKEN_KEY);
  }
}
