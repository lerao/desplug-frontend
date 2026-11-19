import { Component, inject } from '@angular/core';
import { Observable, BehaviorSubject, catchError, of, switchMap, map } from 'rxjs';
import { PlanoAulaService, PlanoAula, PageResponse } from '../services/plano-aula.service';

@Component({
  selector: 'app-visitante',
  templateUrl: './visitante.page.html',
  styleUrls: ['./visitante.page.scss'],
  standalone: false,
})
export class VisitantePage {

  planoAulaService = inject(PlanoAulaService);

  erroCarregamento: string = '';
  pesquisa: string = '';

  // Filtros
  filtroEtapaEnsino: string = '';
  filtroTipoAtividade: string = '';
  filtroComponentesCurriculares: string = '';
  filtroEixoComputacao: string = '';
  filtroIsGeradoIA: boolean | null = null;

  filtroOrdenacao: string = '';

  // Paginação
  paginaAtual: number = 0;
  tamanhoPagina: number = 10;
  totalPaginas: number = 0;
  totalElementos: number = 0;

  private filtrar = new BehaviorSubject<{ filtros: any; pagina: number }>({ filtros: null, pagina: 0 });

  planosAula$: Observable<PlanoAula[]> = this.filtrar.pipe(
    switchMap(({ filtros, pagina }) => {
      this.erroCarregamento = '';

      const request$ = filtros === null
        ? this.planoAulaService.getPlanos(pagina, this.tamanhoPagina)
        : this.planoAulaService.filtrarPlanos(filtros, pagina, this.tamanhoPagina);

      return request$.pipe(
        map((resposta: PageResponse<PlanoAula>) => {
          this.paginaAtual = resposta.number;
          this.totalPaginas = resposta.totalPages;
          this.totalElementos = resposta.totalElements;

          return resposta.content;
        }),
        catchError(err => {
          console.error('Erro ao carregar os planos:', err);
          this.erroCarregamento = 'Erro ao carregar os planos. Por favor, tente novamente.';
          return of([]);
        })
      );
    })
  );

  customPopoverOptions = {
    header: 'Ordenar por',
    alignment: 'center',
    cssClass: 'custom-sort-popover'
  };

  abrirFiltro = false;

  realizarBusca(pagina: number = 0) {
    const filtros: any = {};

    if (this.pesquisa && this.pesquisa.trim() !== '') {
      const termo = this.pesquisa.trim();

      if (/^(EF|EI|EM)\d+/i.test(termo)) {
        filtros.codigoHabilidade = termo;
      } else {
        filtros.titulo = termo;
      }
    }

    if (this.filtroEtapaEnsino && this.filtroEtapaEnsino !== '') {
      filtros.etapaEnsino = this.filtroEtapaEnsino;
    }

    if (this.filtroTipoAtividade && this.filtroTipoAtividade !== '') {
      filtros.tipoAtividade = this.filtroTipoAtividade;
    }

    if (this.filtroComponentesCurriculares && this.filtroComponentesCurriculares !== '') {
      filtros.componentesCurriculares = this.filtroComponentesCurriculares;
    }

    if (this.filtroEixoComputacao && this.filtroEixoComputacao !== '') {
      filtros.eixoComputacao = this.filtroEixoComputacao;
    }

    if (this.filtroIsGeradoIA !== null) {
      filtros.isGeradoIA = this.filtroIsGeradoIA;
    }

    if (this.filtroOrdenacao && this.filtroOrdenacao !== '') {
      filtros.orderBy = this.filtroOrdenacao;
    }

    this.filtrar.next({ filtros, pagina });
  }

  mudarPagina(novaPagina: number) {
    if (novaPagina >= 0 && novaPagina < this.totalPaginas) {
      const filtrosAtuais = this.filtrar.value.filtros;
      this.filtrar.next({ filtros: filtrosAtuais, pagina: novaPagina });
    }
  }

  abrirFiltros() {
    this.abrirFiltro = true;
  }

  fecharFiltros() {
    this.abrirFiltro = false;
  }

  aplicarFiltros() {
    this.abrirFiltro = false;
    this.realizarBusca(0); 
  }

  limparFiltros() {
    this.filtroEtapaEnsino = '';
    this.filtroTipoAtividade = '';
    this.filtroComponentesCurriculares = '';
    this.filtroEixoComputacao = '';
    this.filtroIsGeradoIA = null;
    this.filtroOrdenacao = '';
    this.pesquisa = '';
    this.realizarBusca(0);
    this.fecharFiltros();
  }
}