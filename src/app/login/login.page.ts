import { Component, inject } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

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
  loading: boolean = false;
  errorMessage: string = '';

  selectedRole: 'professor' | 'admin' = 'professor';

  constructor() {}

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
    return this.showPassword ? 'eye-off-outline' : 'eye-outline';
  }

  fazerLogin() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Preencha o e-mail e a senha.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/visitante']);
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 401) {
          this.errorMessage = 'E-mail ou senha incorretos.';
        } else if (err.status === 0) {
          this.errorMessage = 'Não foi possível conectar ao servidor.';
        } else {
          this.errorMessage = 'Ocorreu um erro. Tente novamente.';
        }
      },
    });
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
            console.log('E-mail para recuperação:', dados.email);
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
    this.router.navigate(['/cadastro']);
  }
}