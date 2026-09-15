import { Component } from '@angular/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage {
  email: string = '';
  password: string = '';
  showPassword: boolean = false;
  loading: boolean = false;
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

  getPasswordIcon():string {
    return this.showPassword ? 'eye-off-outline' : 'eye-outline';
  }

  fazerLogin() {
    this.loading = true;
    setTimeout(() => {
      this.loading = false;
      console.log('Login executado:', { email: this.email, role: this.selectedRole });
    }, 1400);
  }

  esqueciSenha() {
    console.log('Recuperação de senha solicitada:', this.email);
  }

  loginGoogle() {
    console.log('Login com Google solicitado');
  }

  loginFacebook() {
    console.log('Login com Facebook solicitado');
  }

  cadastrar() {
    console.log('Cadastro solicitado');
  }
}