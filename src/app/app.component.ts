import { Component, ViewEncapsulation, inject } from '@angular/core';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
  encapsulation: ViewEncapsulation.None,
})
export class AppComponent {
  private authService = inject(AuthService);

  readonly isLoggedIn$ = this.authService.isLoggedIn$;

  constructor() {}

  logout(): void {
    this.authService.logout();
  }
}