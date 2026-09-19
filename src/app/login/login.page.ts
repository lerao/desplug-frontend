import { Component } from '@angular/core';
import { AlertController } from '@ionic/angular';

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

  constructor(
    private alertController: AlertController
  ) {}

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

      console.log('Login executado:', {
        email: this.email,
        role: this.selectedRole
      });
    }, 1400);
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
          value: this.email
        }
      ],

      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Enviar',

          handler: (dados) => {
            console.log(
              'E-mail para recuperação:',
              dados.email
            );
          }
        }
      ]
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
    console.log('Cadastro solicitado');
  }

}

