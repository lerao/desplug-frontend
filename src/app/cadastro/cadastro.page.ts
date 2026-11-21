import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, CadastroRequest } from '../security/auth.service';
import { Localidade, LocalidadeService } from '../services/localidade.service';
import { AppDialogService } from '../shared/app-dialog/app-dialog.service';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';

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
    cep: '',
    cidade: '',
    estado: '',
    uf: ''
  };

  cadastrando = signal(false);
  buscandoCep = signal(false);
  cepInvalido = signal(false);
  private ultimoCepConsultado = '';

  exibirSenha1: boolean = false;
  exibirSenha2: boolean = false;

  constructor(
    private dialogService: AppDialogService,
    private authService: AuthService,
    private localidadeService: LocalidadeService,
    private router: Router
  ) { }

  ngOnInit() { }

  private formatarCep(valor: string): string {
    const digitos = (valor || '').replace(/\D/g, '').slice(0, 8);
    if (digitos.length <= 5) {
      return digitos;
    }
    return `${digitos.slice(0, 5)}-${digitos.slice(5)}`;
  }

  private limparLocalidade() {
    this.usuario.cidade = '';
    this.usuario.estado = '';
    this.usuario.uf = '';
    this.ultimoCepConsultado = '';
  }

  digitarCep() {
    const cepFormatado = this.formatarCep(this.usuario.cep);
    this.usuario.cep = cepFormatado;

    const cepLimpo = cepFormatado.replace(/\D/g, '');
    this.cepInvalido.set(false);

    if (cepLimpo.length < 8) {
      this.limparLocalidade();
      return;
    }

    if (cepLimpo.length === 8 && cepLimpo !== this.ultimoCepConsultado) {
      this.buscarCep(cepLimpo);
    }
  }

  buscarCep(cepInformado?: string) {
    const cepFormatado = this.formatarCep(cepInformado ?? this.usuario.cep);
    this.usuario.cep = cepFormatado;

    const cepLimpo = cepFormatado.replace(/\D/g, '');

    if (cepLimpo.length !== 8) {
      this.limparLocalidade();
      if (cepLimpo.length > 0) {
        this.cepInvalido.set(true);
      }
      return;
    }

    if (this.buscandoCep() || (cepLimpo === this.ultimoCepConsultado && !!this.usuario.cidade)) {
      return;
    }

    this.buscandoCep.set(true);
    this.cepInvalido.set(false);

    this.localidadeService.buscarPorCep(cepLimpo)
      .pipe(
        finalize(() => {
          this.buscandoCep.set(false);
        })
      )
      .subscribe({
        next: (localidade: Localidade) => {
          this.ultimoCepConsultado = cepLimpo;
          this.usuario.cep = this.formatarCep(localidade.cep || cepLimpo);
          this.usuario.cidade = localidade.cidade;
          this.usuario.estado = localidade.estado;
          this.usuario.uf = localidade.uf;
          this.cepInvalido.set(false);
        },
        error: (erro: HttpErrorResponse) => {
          this.limparLocalidade();
          this.cepInvalido.set(true);

          if (erro.status === 404) {
            void this.exibirErroValidacao('CEP não encontrado. Verifique e tente novamente.');
          } else if (erro.status === 0) {
            void this.exibirErroValidacao('Não foi possível conectar ao servidor para consultar o CEP.');
          } else {
            void this.exibirErroValidacao('Não foi possível consultar os dados do CEP.');
          }
        }
      });
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
    await this.dialogService.alert(mensagem, 'Atenção');
  }

  async submeterCadastro(form: any) {
    const cepLimpo = (this.usuario.cep || '').replace(/\D/g, '');

    if (!this.usuario.nome || this.usuario.nome.trim() === '') {
      await this.exibirErroValidacao('Por favor, digite seu nome completo.');
      return;
    }
    if (!this.usuario.email || form.controls['email']?.invalid) {
      await this.exibirErroValidacao('Por favor, insira um e-mail válido.');
      return;
    }
    if (!this.validarSenhaForte()) {
      await this.exibirErroValidacao('A senha deve ter no mínimo 8 caracteres, contendo letras e números.');
      return;
    }
    if (!this.senhasConferem()) {
      await this.exibirErroValidacao('As duas senhas informadas não são iguais.');
      return;
    }
    if (!this.usuario.secretaria) {
      await this.exibirErroValidacao('Por favor, selecione a sua Secretaria de Educação.');
      return;
    }
    if (cepLimpo.length !== 8 || !this.usuario.cidade || !this.usuario.uf) {
      await this.exibirErroValidacao('Por favor, informe um CEP válido para preencher a cidade e o estado.');
      return;
    }

    if (this.cadastrando()) return;

    this.cadastrando.set(true);

    const dadosCadastro: CadastroRequest = {
      nome: this.usuario.nome.trim(),
      email: this.usuario.email.trim().toLowerCase(),
      senha: this.usuario.senha,
      perfisUsuario: [
        {
          perfil: 'ROLE_PROFESSOR_PENDING'
        }
      ]
    };

    this.authService.cadastrarUsuario(dadosCadastro)
      .pipe(
        finalize(() => {
          this.cadastrando.set(false);
        })
      )
      .subscribe({
        next: () => {
          console.log('Cadastro realizado com sucesso!');
          void this.exibirSucesso();
        },
        error: (erro: HttpErrorResponse) => {
          console.error('Erro ao cadastrar usuário:', erro);

          let mensagem = 'Não foi possível realizar o cadastro.';

          if (erro.status === 0) {
            mensagem = 'Não foi possível conectar ao servidor. Verifique a API ou o CORS.';
          } else if (erro.status === 400) {
            mensagem = 'Os dados enviados são inválidos.';
          } else if (erro.status === 409) {
            mensagem = 'Este e-mail já está cadastrado.';
          } else if (erro.status === 503) {
            mensagem = 'O servidor está temporariamente indisponível.';
          } else if (erro.status >= 500) {
            mensagem = 'Ocorreu um erro interno no servidor.';
          }

          void this.exibirErroValidacao(mensagem);
        }
      });
  }

  async exibirSucesso() {
    await this.dialogService.alert(
      'Seu perfil foi criado com sucesso e passará por homologação pela Secretaria de Educação.',
      'Cadastro Realizado!'
    );

    await new Promise(resolve => setTimeout(resolve, 800));
    await this.router.navigateByUrl('/login', { replaceUrl: true });
  }
}