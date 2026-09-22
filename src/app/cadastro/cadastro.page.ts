import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-cadastro',
  templateUrl: './cadastro.page.html',
  styleUrls: ['./cadastro.page.scss'],
  standalone: false,
})
export class CadastroPage implements OnInit {

  usuario = {
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    secretaria: '',
    uf: '',          // Armazena a sigla do estado selecionado (PE ou PB)
    municipio: ''    // Armazena o nome do município selecionado
  };

  // Lista fixa contendo estritamente Pernambuco e Paraíba
  listaEstados = [
    { sigla: 'PE', nome: 'Pernambuco' },
    { sigla: 'PB', nome: 'Paraíba' }
  ];

  listaMunicipios: string[] = [];

  exibirSenha1: boolean = false;
  exibirSenha2: boolean = false;

  constructor(private alertController: AlertController) { }

  ngOnInit() { }

  // Filtra as cidades de forma estrita dependendo da UF selecionada
  buscarMunicipiosPorUf() {
    this.usuario.municipio = ''; // Reseta o município anterior ao mudar de estado
    this.listaMunicipios = [];

    if (this.usuario.uf === 'PE') {
      this.listaMunicipios = ['Afogados da Ingazeira', 'Água Branca'];
    } else if (this.usuario.uf === 'PB') {
      this.listaMunicipios = ['Água Branca', 'Afogados da Ingazeira'];
    }
  }

  senhasConferem(): boolean {
    if (!this.usuario.senha || !this.usuario.confirmarSenha) return false;
    return this.usuario.senha === this.usuario.confirmarSenha;
  }

  validarSenhaForte(): boolean {
    if (!this.usuario.senha) return false;
    
    const senhaLimpa = this.usuario.senha.trim();
    const temLetra = /[a-zA-Z]/.test(senhaLimpa);
    const temNumero = /[0-9]/.test(senhaLimpa);
    return senhaLimpa.length >= 8 && temLetra && temNumero;
  }

  async exibirErroValidacao(mensagem: string) {
    const alert = await this.alertController.create({
      header: 'Atenção',
      message: mensagem,
      buttons: ['Entendido']
    });
    await alert.present();
  }

  submeterCadastro(form: any) {
    if (!this.usuario.nome || this.usuario.nome.trim() === '') {
      this.exibirErroValidacao('Por favor, digite seu nome completo.');
      return;
    }
    if (!this.usuario.email || form.controls['email']?.invalid) {
      this.exibirErroValidacao('Por favor, insira um e-mail válido.');
      return;
    }
    if (!this.validarSenhaForte()) {
      this.exibirErroValidacao('A senha deve ter no mínimo 8 caracteres, contendo letras e números.');
      return;
    }
    if (!this.senhasConferem()) {
      this.exibirErroValidacao('As duas senhas informadas não são iguais.');
      return;
    }
    if (!this.usuario.secretaria) {
      this.exibirErroValidacao('Por favor, selecione a sua Secretaria de Educação.');
      return;
    }
    if (!this.usuario.uf) {
      this.exibirErroValidacao('Por favor, selecione o seu Estado (UF).');
      return;
    }
    if (!this.usuario.municipio) {
      this.exibirErroValidacao('Por favor, selecione o seu Município.');
      return;
    }
    
    console.log('Dados prontos para envio:', this.usuario);
    this.exibirSucesso();
  }

  async exibirSucesso() {
    const alert = await this.alertController.create({
      header: 'Cadastro Realizado!',
      subHeader: 'Seja bem-vindo(a)',
      message: 'Seu perfil foi criado com sucesso e passará por homologação pela Secretaria de Educação.',
      buttons: [
        {
          text: 'Ok',
          handler: () => {
            this.usuario = {
              nome: '',
              email: '',
              senha: '',
              confirmarSenha: '',
              secretaria: '',
              uf: '',
              municipio: ''
            };
            this.listaMunicipios = [];
          }
        }
      ],
      backdropDismiss: false
    });

    await alert.present();
  }
}
