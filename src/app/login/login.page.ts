import { Component, inject, signal } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';

import {
  AuthService,
  PerfilLogin
} from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage {

  private alertController = inject(AlertController);
  private router = inject(Router);
  private authService = inject(AuthService);

  email: string = '';
  password: string = '';
  showPassword: boolean = false;

  readonly loading = signal(false);

  selectedRole: 'professor' | 'admin' = 'professor';

  selecionarProfessor() {
    this.selectedRole = 'professor';
  }

  selecionarAdmin() {
    this.selectedRole = 'admin';
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  getPasswordIcon(): string {
    return this.showPassword
      ? 'eye-off-outline'
      : 'eye-outline';
  }

  fazerLogin(): void {

    if (this.loading()) {
      return;
    }

    const email = this.email.trim().toLowerCase();

    if (!email || !this.password) {
      void this.exibirAlerta(
        'Campos obrigatórios',
        'Informe seu e-mail e senha para entrar.'
      );
      return;
    }

    // Converter a seleção visual para o enum da API
    const perfil: PerfilLogin =
      this.selectedRole === 'professor'
        ? 'ROLE_PROFESSOR_PENDING'
        : 'ROLE_ADMIN';

    const dadosLogin = {
      email,
      senha: this.password,
      perfil
    };

    this.loading.set(true);

    this.authService.login(dadosLogin)
      .pipe(
        finalize(() => {
          this.loading.set(false);
        })
      )
      .subscribe({

        next: resposta => {

          try {
            // Guarda a sessão retornada pela API
            this.authService.salvarSessao(resposta);

            // Redirecionamento temporário
            void this.router.navigateByUrl('/visitante', {
              replaceUrl: true
            });

          } catch (erro) {
            console.error(
              'Erro ao processar a sessão:',
              erro
            );

            void this.exibirAlerta(
              'Erro na autenticação',
              'O servidor retornou uma sessão inválida.'
            );
          }
        },

        error: (erro: HttpErrorResponse) => {

          console.error(
            'Erro na requisição de login:',
            erro.status
          );

          let mensagem =
            'Não foi possível realizar o login. Verifique suas credenciais e o perfil selecionado.';

          if (erro.status === 0) {
            mensagem =
              'Não foi possível conectar ao servidor.';
          } else if (
            erro.status === 400 ||
            erro.status === 401 ||
            erro.status === 403
          ) {
            mensagem =
              'Não foi possível autenticar. Verifique seu e-mail, senha e perfil de acesso.';
          } else if (erro.status >= 500) {
            mensagem =
              'Não foi possível autenticar agora. Tente novamente ou entre em contato com a equipe responsável.';
          }

          void this.exibirAlerta(
            'Não foi possível entrar',
            mensagem
          );
        }
      });
  }

  private async exibirAlerta(
    header: string,
    message: string
  ): Promise<void> {

    const alerta = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });

    await alerta.present();
  }

  async esqueciSenha() {
    const alert = await this.alertController.create({
      header: 'Redefinir senha',
      message: 'Digite seu e-mail para recuperar sua senha.',
      inputs: [
        {
          name: 'email',
          type: 'email',
          placeholder: 'Digite seu e-mail',
          value: this.email,
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Enviar',
          handler: (dados) => {
            console.log(
              'E-mail para recuperação:',
              dados.email
            );
          },
        },
      ],
    });

    await alert.present();
  }

  loginGoogle() {
    console.log('Login com Google solicitado');
  }

  loginFacebook() {
    console.log('Login com Facebook solicitado');
  }

  cadastrar() {
    void this.router.navigate(['/cadastro']);
  }
}