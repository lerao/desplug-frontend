import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AppDialogService } from '../shared/app-dialog/app-dialog.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage {
  private dialog = inject(AppDialogService);
  private router = inject(Router);

  email: string = '';
  password: string = '';
  showPassword: boolean = false;
  loading: boolean = false;

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
    this.loading = true;

    setTimeout(() => {
      this.loading = false;

      console.log('Login executado:', {
        email: this.email,
        role: this.selectedRole,
      });
    }, 1400);
  }

  async esqueciSenha() {
    const result = await this.dialog.show({
      title: 'Redefinir senha',
      message: 'Digite seu e-mail para recuperar sua senha.',
      input: {
        name: 'email',
        type: 'email',
        placeholder: 'Digite seu e-mail',
        value: this.email
      },
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Enviar', role: 'confirm' }
      ]
    });

    if (result.role === 'confirm') {
      console.log('E-mail para recuperação:', result.data?.['email']);
    }
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