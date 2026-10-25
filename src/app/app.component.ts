
import { Component, inject, computed } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {

  public authService = inject(AuthService);
  private router = inject(Router);

  // Verifica reativamente se existe uma sessão
  readonly usuarioLogado = computed(() => {
    return this.authService.sessaoAtual() !== null;
  });

  // Informações do usuário autenticado
  readonly usuarioAtual = computed(() => {
    return this.authService.sessaoAtual();
  });

  // Encerrar sessão
  async sair(): Promise<void> {
    this.authService.sair();

    await this.router.navigateByUrl('/visitante', {
      replaceUrl: true
    });
  }
}
