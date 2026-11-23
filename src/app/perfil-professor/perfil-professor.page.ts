import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { PerfilService } from '../services/perfil.service';
import { AuthService } from '../security/auth.service';
import { PerfilDados, PerfilErros } from '../models/perfil.model';

@Component({
  selector: 'app-perfil-professor',
  templateUrl: './perfil-professor.page.html',
  styleUrls: ['./perfil-professor.page.scss'],
  standalone: false,
})
export class PerfilProfessorPage implements OnInit {
  private perfilService = inject(PerfilService);
  private authService = inject(AuthService);

  private resumoInicial = '';

  readonly usuarioId = signal<number | null>(null);
  readonly nome = signal('');
  readonly email = signal('');
  readonly secretaria = signal('');
  readonly cep = signal('');
  readonly cidade = signal('');
  readonly estado = signal('');
  readonly uf = signal('');
  readonly foto = signal<string | null>(null);
  readonly perfil = signal<'professor' | 'admin'>('professor');
  readonly statusHomologacao = signal<string>('PENDENTE');
  readonly statusVinculo = signal<string>('PENDENTE');
  readonly dataRegistro = signal<string>('');
  readonly dataHomologacao = signal<string>('');
  readonly dataVinculacao = signal<string>('');
  readonly erros = signal<PerfilErros>({});
  readonly salvo = signal(false);
  readonly editando = signal(false);
  readonly carregando = signal(false);
  readonly salvando = signal(false);
  readonly mensagemErro = signal('');
  readonly usandoDadosDaSessao = signal(false);
  readonly senhaAtual = signal('');
  readonly novaSenha = signal('');
  readonly confirmarSenha = signal('');
  readonly salvandoSenha = signal(false);
  readonly erroSenha = signal('');
  readonly senhaAtualizada = signal(false);

  readonly ehAdministrador = computed(() => this.perfil() === 'admin');
  readonly rotuloPerfil = computed(() => this.ehAdministrador() ? 'Administrador' : 'Professor');
  readonly temAlteracoes = computed(() => this.resumoAtual() !== this.resumoInicial);

  ngOnInit(): void {
    this.carregarPerfil();
  }

  previsualizarIniciais(): string {
    const iniciais = this.nome()
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((parte) => parte.charAt(0).toLocaleUpperCase('pt-BR'))
      .join('');

    return iniciais || 'US';
  }

  aoSelecionarArquivo(evento: Event): void {
    const entrada = evento.target as HTMLInputElement;
    const arquivo = entrada.files?.[0];
    if (!arquivo) return;

    if (!arquivo.type.startsWith('image/')) {
      this.erros.update((erros) => ({ ...erros, photo: 'Selecione um arquivo de imagem válido.' }));
      entrada.value = '';
      return;
    }

    if (arquivo.size > 5 * 1024 * 1024) {
      this.erros.update((erros) => ({ ...erros, photo: 'A imagem deve ter no máximo 5 MB.' }));
      entrada.value = '';
      return;
    }

    this.salvando.set(true);
    this.limparErro('photo');

    this.perfilService.uploadFoto(arquivo).subscribe({
      next: (resposta) => {
        this.foto.set(resposta.photo);
        this.authService.atualizarPerfilLocal({ foto: resposta.photo });
        this.resumoInicial = this.resumoAtual();
        this.salvando.set(false);
        this.salvo.set(true);
      },
      error: () => {
        this.erros.update((erros) => ({ ...erros, photo: 'Não foi possível enviar a foto. Tente novamente.' }));
        this.salvando.set(false);
      },
    });

    entrada.value = '';
  }

  removerFoto(): void {
    this.salvando.set(true);
    this.limparErro('photo');

    this.perfilService.removerFoto().subscribe({
      next: () => {
        this.foto.set(null);
        this.authService.atualizarPerfilLocal({ foto: null });
        this.resumoInicial = this.resumoAtual();
        this.salvando.set(false);
        this.salvo.set(true);
      },
      error: () => {
        this.erros.update((erros) => ({ ...erros, photo: 'Não foi possível remover a foto. Tente novamente.' }));
        this.salvando.set(false);
      },
    });
  }

  salvar(): void {
    const erros = this.validar();
    this.erros.set(erros);
    if (Object.keys(erros).length > 0) return;

    this.salvando.set(true);
    this.mensagemErro.set('');

    const dados = { name: this.nome().trim(), email: this.email().trim() };

    this.perfilService.atualizarPerfil(dados, this.usuarioId() || undefined).subscribe({
      next: (perfil) => {
        this.nome.set(perfil.name);
        this.email.set(perfil.email);
        this.authService.atualizarPerfilLocal({ nome: perfil.name, email: perfil.email });
        this.resumoInicial = this.resumoAtual();
        this.salvando.set(false);
        this.editando.set(false);
        this.salvo.set(true);
      },
      error: (erro) => {
        this.salvando.set(false);
        if (erro.status === 409) {
          this.erros.update((erros) => ({ ...erros, email: 'Este e-mail já está em uso.' }));
        } else if (erro.status === 0) {
          this.mensagemErro.set('Não foi possível conectar ao servidor.');
        } else {
          this.mensagemErro.set('Ocorreu um erro ao salvar. Tente novamente.');
        }
      },
    });
  }

  alterarSenha(): void {
    this.erroSenha.set('');
    this.senhaAtualizada.set(false);
    const atual = this.senhaAtual();
    const nova = this.novaSenha();

    if (!atual || !nova || !this.confirmarSenha()) {
      this.erroSenha.set('Preencha todos os campos de senha.');
      return;
    }
    if (nova.length < 8) {
      this.erroSenha.set('A nova senha deve ter pelo menos 8 caracteres.');
      return;
    }
    if (nova !== this.confirmarSenha()) {
      this.erroSenha.set('A confirmação não corresponde à nova senha.');
      return;
    }
    if (atual === nova) {
      this.erroSenha.set('Escolha uma senha diferente da atual.');
      return;
    }

    this.salvandoSenha.set(true);
    this.perfilService.atualizarSenha(atual, nova).subscribe({
      next: () => {
        this.senhaAtual.set('');
        this.novaSenha.set('');
        this.confirmarSenha.set('');
        this.salvandoSenha.set(false);
        this.senhaAtualizada.set(true);
      },
      error: (erro) => {
        this.salvandoSenha.set(false);
        if (erro.status === 400 || erro.status === 401) {
          this.erroSenha.set('A senha atual está incorreta ou não foi aceita.');
        } else if (erro.status === 0) {
          this.erroSenha.set('Não foi possível conectar ao servidor. Tente novamente.');
        } else {
          this.erroSenha.set('Não foi possível alterar a senha. Tente novamente.');
        }
      },
    });
  }

  descartarAlteracoes(): void {
    this.carregarPerfil();
  }

  formatarData(valor?: string | null): string {
    if (!valor) return '—';
    try {
      const data = new Date(valor);
      if (isNaN(data.getTime())) return valor;
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(data);
    } catch {
      return valor;
    }
  }

  rotuloStatusHomologacao(): string {
    if (this.ehAdministrador()) return 'Administrador';
    if (this.usandoDadosDaSessao()) return 'Professor · sincronização pendente';
    if (this.statusHomologacao() === 'APROVADO') return 'Professor homologado';
    if (this.statusHomologacao() === 'REPROVADO') return 'Professor · homologação reprovada';
    return 'Professor · homologação pendente';
  }

  badgeStatusHomologacao(): string {
    if (this.usandoDadosDaSessao()) return 'PENDENTE';
    if (this.ehAdministrador()) return 'ATIVO';
    return this.statusHomologacao() || 'PENDENTE';
  }

  tituloStatusHomologacao(): string {
    if (this.usandoDadosDaSessao()) return 'Status não verificado';
    if (this.ehAdministrador()) return 'Acesso administrativo';
    if (this.statusHomologacao() === 'APROVADO') return 'Professor homologado';
    if (this.statusHomologacao() === 'REPROVADO') return 'Cadastro reprovado';
    return 'Homologação pendente';
  }

  descricaoStatusHomologacao(): string {
    if (this.usandoDadosDaSessao()) {
      return 'Conecte-se ao servidor para consultar a situação real do cadastro.';
    }
    if (this.ehAdministrador()) {
      return 'Seu perfil administrativo está ativo.';
    }
    if (this.statusHomologacao() === 'APROVADO') {
      return 'Seu cadastro está aprovado e você possui acesso a todos os recursos para professores.';
    }
    if (this.statusHomologacao() === 'REPROVADO') {
      return 'Seu cadastro não foi homologado pela secretaria ou administração.';
    }
    return 'Seu cadastro foi realizado e está aguardando homologação da secretaria.';
  }

  rotuloVinculoSecretaria(): string {
    if (this.usandoDadosDaSessao()) {
      return 'Aguardando confirmação do servidor';
    }
    if (this.statusVinculo() === 'VINCULADO') {
      return 'Vínculo institucional confirmado';
    }
    if (this.statusVinculo() === 'DESVINCULADO') {
      return 'Vínculo institucional desvinculado';
    }
    if (this.statusVinculo() === 'PENDENTE') {
      return 'Aguardando confirmação da secretaria';
    }
    if (this.secretaria()) {
      return `Vínculo com ${this.secretaria()}`;
    }
    return 'Sem vínculo registrado';
  }

  private carregarPerfil(): void {
    this.carregando.set(true);
    this.mensagemErro.set('');
    this.usandoDadosDaSessao.set(false);
    this.secretaria.set('');
    this.cep.set('');
    this.cidade.set('');
    this.estado.set('');
    this.uf.set('');

    this.perfilService.getPerfil().subscribe({
      next: (perfil) => {
        this.usuarioId.set(perfil.id ?? null);
        this.nome.set(perfil.name);
        this.email.set(perfil.email);
        this.secretaria.set(perfil.secretaria?.trim() || '');
        this.cep.set(perfil.cep?.trim() || '');
        this.cidade.set(perfil.cidade?.trim() || '');
        this.estado.set(perfil.estado?.trim() || '');
        this.uf.set(perfil.uf?.trim() || '');
        this.foto.set(perfil.photo);
        this.perfil.set(perfil.role);
        this.statusHomologacao.set(perfil.statusHomologacao || 'PENDENTE');
        this.statusVinculo.set(perfil.statusVinculo || 'PENDENTE');
        this.dataRegistro.set(perfil.dataRegistro || '');
        this.dataHomologacao.set(perfil.dataHomologacao || '');
        this.dataVinculacao.set(perfil.dataVinculacao || '');
        this.erros.set({});
        this.salvo.set(false);
        this.resumoInicial = this.resumoAtual();
        this.carregando.set(false);
      },
      error: (erro) => {
        this.carregando.set(false);
        const sessao = this.authService.sessaoAtual();
        if (sessao) {
          this.usuarioId.set(sessao.usuarioId ?? null);
          this.nome.set(sessao.nome);
          this.email.set(sessao.email);
          this.foto.set(sessao.foto ?? null);
          this.perfil.set(sessao.perfil === 'ROLE_ADMIN' ? 'admin' : 'professor');
          this.usandoDadosDaSessao.set(true);
          this.resumoInicial = this.resumoAtual();
        }
        if (erro.status === 0) {
          this.mensagemErro.set('Não foi possível conectar ao servidor.');
        } else if (erro.status === 401 || erro.status === 403) {
          this.mensagemErro.set('Sua sessão não foi autorizada. Entre novamente e tente acessar o perfil.');
        } else if (erro.status === 404) {
          this.mensagemErro.set('A rota de perfil não foi encontrada no servidor. Verifique a API.');
        } else {
          this.mensagemErro.set('Não foi possível carregar os dados do perfil.');
        }
      },
    });
  }

  private validar(): PerfilErros {
    const erros: PerfilErros = {};
    const nome = this.nome().trim();
    const email = this.email().trim();

    if (!nome) {
      erros.name = 'Informe seu nome completo.';
    }

    if (!email) {
      erros.email = 'Informe seu e-mail.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      erros.email = 'Informe um endereço de e-mail válido.';
    } else if (!this.ehAdministrador() && !email.toLocaleLowerCase('pt-BR').endsWith('.br')) {
      erros.email = 'O e-mail deve terminar com .br.';
    }

    return erros;
  }

  private obterPerfilAtual(): PerfilDados {
    return {
      name: this.nome().trim(),
      email: this.email().trim(),
      photo: this.foto(),
      role: this.perfil(),
    };
  }

  private resumoAtual(): string {
    return JSON.stringify(this.obterPerfilAtual());
  }

  private limparErro(campo: keyof PerfilErros): void {
    this.erros.update((erros) => {
      const proximo = { ...erros };
      delete proximo[campo];
      return proximo;
    });
  }
}
