import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import {
  PlanoAulaService,
  PlanoAula,
  PageResponse
} from '../services/plano-aula.service';
import { FavoritosService, Favorito } from '../services/favoritos.service';
import { AuthService } from '../security/auth.service';
import { AppDialogService } from '../shared/app-dialog/app-dialog.service';
import { forkJoin } from 'rxjs';

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
  private readonly favoritosService = inject(FavoritosService);
  private readonly appDialog = inject(AppDialogService);

  planos = signal<PlanoAula[]>([]);
  planosUsuario = signal<PlanoAula[]>([]);
  planosPublicos = signal<PlanoAula[]>([]);
  favoritosUsuario = signal<Favorito[]>([]);

  curtidasPorPlano = signal<Record<number, number>>({});
  ajustesCurtidasPorPlano = signal<Record<number, number>>({});

  modoExibicao = signal<'todos' | 'meus' | 'favoritos'>('todos');
  pesquisa = signal('');
  carregando = signal(false);
  mensagemErro = signal('');

  paginaAtual = signal(0);
  tamanhoPagina = signal(10);
  totalPaginas = signal(0);
  totalElementos = signal(0);

  mostrarMenuVisualizacao = false;
  planoSelecionado: PlanoAula | null = null;
  abrirFiltro = false;
  headerCompact = false;

  // Filtros
  filtroEtapaEnsino = '';
  filtroTipoAtividade = '';
  filtroComponentesCurriculares = '';
  filtroIsGeradoIA: boolean | null = null;

  private favoritosEmProcessamento = new Set<number>();

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
    return this.favoritosUsuario().length;
  }

  qtdPlanosPorUsuario = computed(() => this.planosUsuario().length);
  planosFiltrados = computed(() => this.planos());

  ngOnInit(): void {
    this.carregarPlanos();
    this.carregarQtdPlanosUsuario();
    this.carregarFavoritos();
  }

  private carregarFavoritos(): void {
    const usuarioId = this.authService.sessaoAtual()?.usuarioId;

    if (!usuarioId) {
      this.favoritosUsuario.set([]);
      return;
    }

    this.favoritosService.listar().subscribe({
      next: (favoritos: Favorito[]) => {
        this.atualizarContagemCurtidas(favoritos);

        const favoritosDoUsuario = favoritos.filter(
          favorito => favorito.usuario?.id === usuarioId
        );

        this.favoritosUsuario.set(favoritosDoUsuario);
      },
      error: erro => {
        console.error('Erro ao carregar favoritos:', erro);
        this.favoritosUsuario.set([]);
      }
    });
  }

  quantidadeCurtidas(planoId: number): number {
    const totalDaApi = this.planos().find(plano => plano.id === planoId)
      ?.quantidadeFavoritos;
    const totalDaLista = this.curtidasPorPlano()[planoId];

    const base = Math.max(totalDaApi ?? 0, totalDaLista ?? 0);
    const ajusteLocal = this.ajustesCurtidasPorPlano()[planoId] ?? 0;
    return Math.max(0, base + ajusteLocal);
  }

  private atualizarContagemCurtidas(favoritos: Favorito[]): void {
    const contagens: Record<number, number> = {};
    const curtidasUnicas = new Set<string>();

    favoritos.forEach(favorito => {
      const planoId = favorito.planoAula?.id;
      const usuarioId = favorito.usuario?.id;

      if (planoId == null || usuarioId == null) {
        return;
      }

      const chave = `${usuarioId}-${planoId}`;

      if (!curtidasUnicas.has(chave)) {
        curtidasUnicas.add(chave);
        contagens[planoId] = (contagens[planoId] ?? 0) + 1;
      }
    });

    this.curtidasPorPlano.set(contagens);
    this.ajustesCurtidasPorPlano.set({});
  }

  // Atualiza o número no card imediatamente após a API confirmar a ação.
  private ajustarCurtidas(planoId: number, variacao: number): void {
    this.ajustesCurtidasPorPlano.update(ajustes => ({
      ...ajustes,
      [planoId]: (ajustes[planoId] ?? 0) + variacao
    }));
  }

  // Carrega os planos públicos inicialmente.
  private carregarPlanos(pagina: number = 0): void {
    this.carregando.set(true);
    this.mensagemErro.set('');

    this.planoAulaService.getPlanos(pagina, this.tamanhoPagina()).subscribe({
      next: (resposta: PageResponse<PlanoAula>) => {
        this.planosPublicos.set(resposta.content);
        this.planos.set(resposta.content);
        this.modoExibicao.set('todos');

        this.paginaAtual.set(resposta.number);
        this.totalPaginas.set(resposta.totalPages);
        this.totalElementos.set(resposta.totalElements);

        this.carregando.set(false);
        this.mensagemErro.set('');
      },
      error: erro => {
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

  // Carrega os planos do autor logado para o indicador "Meus Planos".
  private carregarQtdPlanosUsuario(pagina: number = 0): void {
    const usuarioId = this.authService.sessaoAtual()?.usuarioId;

    if (!usuarioId) {
      this.planosUsuario.set([]);
      return;
    }

    this.planoAulaService.getPlanosPorAutor(
      usuarioId,
      pagina,
      this.tamanhoPagina()
    ).subscribe({
      next: (resposta: PageResponse<PlanoAula>) => {
        this.planosUsuario.set(resposta.content);
      },
      error: erro => {
        console.error(
          'Erro ao carregar a quantidade de planos do usuário:',
          erro
        );
      }
    });
  }

  mostrarPlanosPorUsuario(): void {
    const usuarioId = this.authService.sessaoAtual()?.usuarioId;

    if (!usuarioId) {
      this.mensagemErro.set('Faça login para consultar seus planos de aula.');
      return;
    }

    this.modoExibicao.set('meus');
    this.mostrarMenuVisualizacao = false;
    this.mensagemErro.set('');
    this.realizarBusca();
  }


  mostrarFavoritos(): void {
    const usuarioId = this.authService.sessaoAtual()?.usuarioId;

    this.modoExibicao.set('favoritos');
    this.mostrarMenuVisualizacao = false;
    this.mensagemErro.set('');
    this.planos.set([]);
    this.paginaAtual.set(0);
    this.totalPaginas.set(0);
    this.totalElementos.set(0);

    if (!usuarioId) {
      this.carregando.set(false);
      this.mensagemErro.set('Faça login para visualizar seus favoritos.');
      return;
    }

    this.carregando.set(true);

    this.favoritosService.listar().subscribe({
      next: (favoritos: Favorito[]) => {
        this.atualizarContagemCurtidas(favoritos);

        const meusFavoritos = favoritos.filter(
          favorito => favorito.usuario?.id === usuarioId
        );

        this.favoritosUsuario.set(meusFavoritos);

        if (this.modoExibicao() !== 'favoritos') {
          return;
        }

        if (meusFavoritos.length === 0) {
          this.carregando.set(false);
          return;
        }

        const requisicoes = meusFavoritos.map(favorito =>
          this.planoAulaService.getPlanoPorId(favorito.planoAula.id)
        );

        forkJoin(requisicoes).subscribe({
          next: (planos: PlanoAula[]) => {
            if (this.modoExibicao() !== 'favoritos') {
              return;
            }

            // Pesquisa textual simples na visualização de favoritos.
            const termo = this.pesquisa().trim().toLowerCase();
            const planosFiltrados = termo
              ? planos.filter(plano =>
                  plano.titulo.toLowerCase().includes(termo) ||
                  (plano.habilidadesBncc ?? []).some(hab =>
                    hab.codigo.toLowerCase().includes(termo)
                  )
                )
              : planos;

            this.planos.set(planosFiltrados);
            this.totalElementos.set(planosFiltrados.length);
            this.totalPaginas.set(planosFiltrados.length > 0 ? 1 : 0);
            this.carregando.set(false);
          },
          error: erro => {
            if (this.modoExibicao() !== 'favoritos') {
              return;
            }
            console.error('Erro ao buscar planos favoritos:', erro);
            this.mensagemErro.set(
              'Não foi possível carregar os planos favoritos.'
            );
            this.carregando.set(false);
          }
        });
      },
      error: erro => {
        if (this.modoExibicao() !== 'favoritos') {
          return;
        }
        console.error('Erro ao listar favoritos:', erro);
        this.mensagemErro.set('Não foi possível consultar os favoritos.');
        this.carregando.set(false);
      }
    });
  }

  mostrarTodosPlanos(): void {
    this.modoExibicao.set('todos');
    this.mostrarMenuVisualizacao = false;
    this.realizarBusca();
  }

  alternarVisualizacao(): void {
    if (this.modoExibicao() === 'todos') {
      this.mostrarPlanosPorUsuario();
    } else {
      this.mostrarTodosPlanos();
    }
  }

  isAutor(plano: PlanoAula): boolean {
    const usuarioId = this.authService.sessaoAtual()?.usuarioId;
    return !!usuarioId && plano.autor?.id === usuarioId;
  }

  async excluirPlano(plano: PlanoAula): Promise<void> {
    if (!this.isAutor(plano)) {
      await this.appDialog.confirm({
        title: 'Ação não permitida',
        message: 'Você só pode excluir seus próprios planos de aula.',
        buttons: [{ text: 'Entendi', role: 'confirm' }]
      });
      return;
    }

    const resultado = await this.appDialog.confirm({
      title: 'Excluir plano de aula?',
      message: `Tem certeza de que deseja excluir o plano "${plano.titulo}"? Essa ação não poderá ser desfeita.`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Excluir plano', role: 'destructive' }
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
        this.planos.update(lista => lista.filter(p => p.id !== plano.id));
        this.planosUsuario.update(lista => lista.filter(p => p.id !== plano.id));
        this.planosPublicos.update(lista => lista.filter(p => p.id !== plano.id));

        this.carregarFavoritos();
        this.carregando.set(false);
        void this.appDialog.alert('Plano excluído com sucesso.', 'Sucesso!');
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

  onHeaderCompact(event: CustomEvent<{ scrollTop: number }>): void {
    this.headerCompact = event.detail.scrollTop > 48;
  }

  private montarFiltros(): any {
    const filtros: any = {};
    const termo = this.pesquisa().trim();

    if (termo) {
      if (/^(EF|EI|EM)\d+/i.test(termo)) {
        filtros.codigoHabilidade = termo;
      } else {
        filtros.titulo = termo;
      }
    }

    if (this.filtroEtapaEnsino) {
      filtros.etapaEnsino = this.filtroEtapaEnsino;
    }
    if (this.filtroTipoAtividade) {
      filtros.tipoAtividade = this.filtroTipoAtividade;
    }
    if (this.filtroComponentesCurriculares) {
      filtros.componentesCurriculares = this.filtroComponentesCurriculares;
    }
    if (this.filtroIsGeradoIA !== null) {
      filtros.isGeradoIA = this.filtroIsGeradoIA;
    }

    return filtros;
  }

  realizarBusca(pagina: number = 0): void {
    const filtros = this.montarFiltros();

    if (this.modoExibicao() === 'meus') {
      const usuarioId = this.authService.sessaoAtual()?.usuarioId;

      if (!usuarioId) {
        this.planos.set([]);
        this.carregando.set(false);
        this.mensagemErro.set('Faça login para consultar seus planos de aula.');
        return;
      }

      filtros.idAutor = usuarioId;
    }

    if (this.modoExibicao() === 'favoritos') {
      this.mostrarFavoritos();
      return;
    }

    this.carregando.set(true);
    this.mensagemErro.set('');

    this.planoAulaService.filtrarPlanos(
      filtros,
      pagina,
      this.tamanhoPagina()
    ).subscribe({
      next: (resposta: PageResponse<PlanoAula>) => {
        this.planos.set(resposta.content);

        if (this.modoExibicao() === 'todos') {
          this.planosPublicos.set(resposta.content);
        }

        this.paginaAtual.set(resposta.number);
        this.totalPaginas.set(resposta.totalPages);
        this.totalElementos.set(resposta.totalElements);
        this.carregando.set(false);
        this.mensagemErro.set('');
      },
      error: erro => {
        console.error('Erro ao pesquisar planos:', erro);
        this.planos.set([]);
        this.mensagemErro.set('Não foi possível pesquisar os planos. Tente novamente.');
        this.carregando.set(false);
      }
    });
  }

  abrirFiltros(): void {
    this.abrirFiltro = true;
  }

  aplicarFiltros(): void {
    this.abrirFiltro = false;
    this.realizarBusca(0);

    document.querySelector('.library')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }

  fecharFiltros(): void {
    this.abrirFiltro = false;
  }

  limparFiltros(): void {
    this.filtroEtapaEnsino = '';
    this.filtroTipoAtividade = '';
    this.filtroComponentesCurriculares = '';
    this.filtroIsGeradoIA = null;
    this.pesquisa.set('');
    this.realizarBusca(0);
    this.fecharFiltros();
  }

  isFavorito(planoId: number): boolean {
    return this.favoritosUsuario().some(
      favorito => favorito.planoAula?.id === planoId
    );
  }

  isFavoritoEmProcessamento(planoId: number): boolean {
    return this.favoritosEmProcessamento.has(planoId);
  }

  favoritar(planoId: number): void {
    const usuarioId = this.authService.sessaoAtual()?.usuarioId;

    if (!usuarioId) {
      void this.appDialog.alert('Faça login para favoritar planos.', 'Atenção');
      return;
    }

    if (this.favoritosEmProcessamento.has(planoId)) {
      return;
    }
    this.favoritosEmProcessamento.add(planoId);

    const favoritoExistente = this.favoritosUsuario().find(
      favorito => favorito.planoAula?.id === planoId
    );

    if (favoritoExistente) {
      this.favoritosService.remover(favoritoExistente.id).subscribe({
        next: () => {
          this.favoritosEmProcessamento.delete(planoId);

          this.favoritosUsuario.update(lista =>
            lista.filter(f => f.id !== favoritoExistente.id)
          );

          if (this.modoExibicao() === 'favoritos') {
            this.planos.update(lista => lista.filter(plano => plano.id !== planoId));
            this.totalElementos.set(this.planos().length);
            this.totalPaginas.set(this.planos().length > 0 ? 1 : 0);
          }

          this.ajustarCurtidas(planoId, -1);
        },
        error: erro => {
          this.favoritosEmProcessamento.delete(planoId);
          console.error('Erro ao remover favorito:', erro);
          void this.appDialog.alert('Não foi possível remover o favorito.', 'Erro');
        }
      });
      return;
    }

    this.favoritosService.adicionar(usuarioId, planoId).subscribe({
      next: novoFavorito => {
        this.favoritosEmProcessamento.delete(planoId);
        this.favoritosUsuario.update(lista => [...lista, novoFavorito]);
        this.ajustarCurtidas(planoId, +1);
      },
      error: erro => {
        this.favoritosEmProcessamento.delete(planoId);
        console.error('Erro ao adicionar favorito:', erro);
        void this.appDialog.alert('Não foi possível adicionar o favorito.', 'Erro');
      }
    });
  }

  adaptar(_planoId: number): void {
    // Implementar posteriormente.
  }

  mudarPagina(novaPagina: number): void {
    if (novaPagina >= 0 && novaPagina < this.totalPaginas()) {
      this.realizarBusca(novaPagina);
    }
  }
}
