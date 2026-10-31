
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { PlanoAulaService, PlanoAula } from '../services/plano-aula.service';
import { AuthService } from '../services/auth.service';
import { AppDialogService } from '../shared/app-dialog/app-dialog.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {

  private readonly router = inject(Router);
  private readonly planoAulaService = inject(PlanoAulaService);
  private readonly authService = inject(AuthService);
  private readonly appDialog = inject(AppDialogService);

  planos = signal<PlanoAula[]>([]);
  planosUsuario = signal<PlanoAula[]>([]);
  planosPublicos = signal<PlanoAula[]>([]);

  // Interface
  modoExibicao = signal<'todos' | 'meus' | 'favoritos'>('todos');
  pesquisa = signal('');
  carregando = signal(false);
  mensagemErro = signal('');

  mostrarMenuVisualizacao = false;
  planoSelecionado: PlanoAula | null = null;
  abrirFiltro = false;
  headerCompact = false;
  meusPlanosCarregados = false;

  get nomeUsuario(): string {
    return this.authService.sessaoAtual()?.nome ?? 'Professor';
  }

  get primeiroNome(): string {
    return this.nomeUsuario.trim().split(/\s+/)[0] || 'Professor';
  }

  get iniciaisNome(): string {
    const partes = this.nomeUsuario.trim().split(/\s+/).filter(Boolean);

    if (partes.length === 0) {
      return 'P';
    }

    return partes
      .slice(0, 2)
      .map(parte => parte.charAt(0))
      .join('')
      .toUpperCase();
  }

  get favoritos(): number {
    return 0;
  }

  // Calcula a quantidade de planos do usuário
  qtdPlanosPorUsuario = computed(() => this.planosUsuario().length);

  // Filtra os planos conforme a pesquisa
  planosFiltrados = computed(() => {
    const query = this.pesquisa().trim().toLocaleLowerCase('pt-BR');

    return this.planos().filter(plano => {
      const textoPesquisavel = [
        plano.titulo,
        plano.resumo,
        plano.etapaEnsino,
        plano.eixoBNCC,
        plano.tipoAtividade,
        plano.componenteCurricular ?? '',
        plano.autor?.nome ?? '',
        plano.materiais?.join(' ') ?? ''
      ]
        .join(' ')
        .toLocaleLowerCase('pt-BR');

      return !query || textoPesquisavel.includes(query);
    });
  });

  ngOnInit(): void {
    this.carregarPlanos();
    this.carregarQtdPlanosUsuario();

  }

  private carregarPlanos(): void {
    this.carregando.set(true);
    this.mensagemErro.set('');

    this.planoAulaService.getPlanos().subscribe({
      next: (planosRetornados) => {
        this.planosPublicos.set(planosRetornados);
        this.planos.set(planosRetornados);
        this.modoExibicao.set('todos');

        this.carregando.set(false);
        this.mensagemErro.set('');

        console.log(
          'Quantidade de planos públicos:',
          planosRetornados.length
        );
      },

      error: (erro) => {
        console.error('Erro ao carregar os planos públicos:', erro);

        this.planosPublicos.set([]);
        this.planos.set([]);

        this.mensagemErro.set(
          'Não foi possível carregar os planos. Tente novamente.'
        );

        this.carregando.set(false);
      }
    });
  }

  private carregarQtdPlanosUsuario(): void {
    const usuarioId = this.authService.sessaoAtual()?.usuarioId;

    if (!usuarioId) {
      this.planosUsuario.set([]);
      return;
    }

    this.planoAulaService.getPlanosPorAutor(usuarioId).subscribe({
      next: (planosRetornados) => {
        this.planosUsuario.set(planosRetornados);
        this.meusPlanosCarregados = true;

        console.log(
          'Quantidade de planos do usuário:',
          this.qtdPlanosPorUsuario()
        );
      },

      error: (erro) => {
        console.error(
          'Erro ao carregar a quantidade de planos do usuário:',
          erro
        );
      }
    });
  }

  mostrarPlanosPorUsuario(): void {
    const sessao = this.authService.sessaoAtual();
    const usuarioId = sessao?.usuarioId;

    if (!usuarioId) {
      this.mensagemErro.set(
        'Faça login para consultar seus planos de aula.'
      );
      return;
    }

    if (this.meusPlanosCarregados) {
      this.modoExibicao.set('meus');
      this.planos.set(this.planosUsuario());
      this.mensagemErro.set('');
      return;
    }

    this.carregando.set(true);
    this.mensagemErro.set('');

    this.planoAulaService.getPlanosPorAutor(usuarioId).subscribe({
      next: (planosRetornados) => {
        this.planosUsuario.set(planosRetornados);
        this.meusPlanosCarregados = true;

        this.planos.set(planosRetornados);
        this.modoExibicao.set('meus');

        this.carregando.set(false);
      },

      error: (erro) => {
        console.error('Erro ao carregar os planos do autor:', erro);

        this.mensagemErro.set(
          'Não foi possível carregar seus planos. Tente novamente.'
        );

        this.carregando.set(false);
      }
    });
  }

  mostrarFavoritos(): void {
    this.modoExibicao.set('favoritos');
    this.planos.set([]);
    this.mensagemErro.set('');
  }

  mostrarTodosPlanos(): void {
    this.modoExibicao.set('todos');
    this.planos.set(this.planosPublicos());
    this.mensagemErro.set('');
    this.mostrarMenuVisualizacao = false;
  }

  alternarVisualizacao(): void {
    if (this.modoExibicao() === 'todos') {
      this.mostrarPlanosPorUsuario();
    } else {
      this.mostrarTodosPlanos();
    }
  }

  // Verifica se o usuário logado é o autor do plano
  isAutor(plano: PlanoAula): boolean {
    const usuarioId = this.authService.sessaoAtual()?.usuarioId;

    return !!usuarioId && plano.autor?.id === usuarioId;
  }

  async excluirPlano(plano: PlanoAula): Promise<void> {
    if (!this.isAutor(plano)) {
      await this.appDialog.confirm({
        title: 'Ação não permitida',
        message: 'Você só pode excluir seus próprios planos de aula.',
        buttons: [
          {
            text: 'Entendi',
            role: 'confirm'
          }
        ]
      });

      return;
    }

    const resultado = await this.appDialog.confirm({
      title: 'Excluir plano de aula?',
      message: `Tem certeza de que deseja excluir o plano "${plano.titulo}"? Essa ação não poderá ser desfeita.`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Excluir plano',
          role: 'destructive'
        }
      ]
    });

    if (resultado.role === 'destructive') {
      this.confirmarExclusao(plano);
    }
  }

  private confirmarExclusao(plano: PlanoAula): void {
    this.carregando.set(true);
    this.mensagemErro.set('');

    this.planoAulaService.excluirPlano(plano.id).subscribe({
      next: () => {
        this.planos.update(lista =>
          lista.filter(p => p.id !== plano.id)
        );

        this.planosUsuario.update(lista =>
          lista.filter(p => p.id !== plano.id)
        );

        this.planosPublicos.update(lista =>
          lista.filter(p => p.id !== plano.id)
        );

        this.carregando.set(false);

        void this.appDialog.alert(
          'Plano excluído com sucesso.',
          'Sucesso!'
        );
      },

      error: erro => {
        console.error('Erro ao excluir plano:', erro);

        this.mensagemErro.set(
          'Não foi possível excluir o plano. Tente novamente mais tarde.'
        );

        this.carregando.set(false);

        void this.appDialog.alert(
          'Não foi possível excluir o plano. Tente novamente.',
          'Ops!'
        );
      }
    });
  }

  // Header compacto ao rolar a tela
  onHeaderCompact(event: CustomEvent<{ scrollTop: number }>): void {
    this.headerCompact = event.detail.scrollTop > 48;
  }

  abrirFiltros(): void {
    this.abrirFiltro = true;
  }

  aplicarFiltros(): void {
    this.abrirFiltro = false;

    document.querySelector('.library')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }

  fecharFiltros(): void {
    this.abrirFiltro = false;
  }

  limparFiltros(): void {
    this.pesquisa.set('');
  }

  favoritar(_planoId: number): void {
    // implementar posteriormente
  }

  adaptar(_planoId: number): void {
    // implementar posteriormente
  }
}
