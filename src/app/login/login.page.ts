import { Component, inject, signal } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize, catchError, throwError } from 'rxjs'; 
import { AuthService, PerfilLogin } from '../services/auth.service';

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

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  getPasswordIcon(): string {
    return this.showPassword ? 'eye-off-outline': 'eye-outline';
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

    const dadosLogin = {
      email,
      senha: this.password,
      perfil: 'ROLE_PROFESSOR' as PerfilLogin
    };

    this.loading.set(true);

    this.authService.login(dadosLogin)
      .pipe(
        catchError((erro: HttpErrorResponse) => {
          if (erro.status === 400 || erro.status === 401 || erro.status === 403 || erro.status === 500) {
            const dadosLoginRoles = {
              ...dadosLogin,
              perfil: 'ROLE_PROFESSOR_PENDING' as PerfilLogin
            };
            return this.authService.login(dadosLoginRoles);
          }
          
          return throwError(() => erro);
        }),
        finalize(() => {
          this.loading.set(false);
        })
      )
      .subscribe({

        next: resposta => {
          try {
            this.authService.salvarSessao(resposta);
            void this.router.navigateByUrl('/home', { replaceUrl: true });

          } catch (erro) {
            console.error('Erro ao processar a sessão:', erro);
            void this.exibirAlerta(
              'Erro na autenticação', 'O servidor retornou uma sessão inválida.');
          }
        },

        error: (erro: HttpErrorResponse) => {
          console.error('Erro na requisição de login:', erro.status, erro.error);

          let mensagem = 'Não foi possível realizar o login. Verifique suas credenciais e o perfil da sua conta.';

          if (erro.status === 0) {
            mensagem = 'Não foi possível conectar ao servidor. Verifique sua conexão.';
          } else if (erro.status === 400 || erro.status === 401 || erro.status === 403) {
            mensagem = 'Não foi possível autenticar. Verifique seu e-mail, sua senha e se sua conta possui o perfil de acesso necessário.';
          } else if (erro.status >= 500) {
            mensagem = 'O servidor apresentou um erro. Tente novamente mais tarde.';
          }

          void this.exibirAlerta('Não foi possível entrar', mensagem);
        }
      });
  }

  private async exibirAlerta(header: string, message: string): Promise<void> {
    const alerta = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alerta.present();
  }

  async esqueciSenha(): Promise<void> {
    const alerta = await this.alertController.create({
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

    await alerta.present();
  }

  loginGoogle(): void {
    console.log('Login com Google solicitado');
  }

  cadastrarUsuario(): void {
    void this.router.navigate(['/cadastro']);
  }
}