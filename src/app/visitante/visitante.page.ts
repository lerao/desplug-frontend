
import { Component, inject } from '@angular/core';
import { Observable, BehaviorSubject, catchError, of, switchMap } from 'rxjs';
import { PlanoAulaService, PlanoAula } from '../services/plano-aula.service';

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

  // filtros
  filtroEtapaEnsino: string = '';
  filtroTipoAtividade: string = '';
  filtroComponentesCurriculares: string = '';
  filtroEixoComputacao: string = '';
  filtroIsGeradoIA: boolean | null = null;

  filtroOrdenacao: string = '';

  filtrar = new BehaviorSubject<any>(null);

  planosAula$: Observable<PlanoAula[]> = this.filtrar.pipe(
    switchMap((filtros) => {
      this.erroCarregamento = '';
      if (filtros === null) {
        return this.planoAulaService.getPlanos().pipe(
          catchError(err => {
            console.error('Erro ao buscar planos iniciais:', err);
            this.erroCarregamento = 'Erro ao carregar os planos. Por favor, tente novamente.';
            return of([]);
          })
        );
      }

      return this.planoAulaService.filtrarPlanos(filtros).pipe(
        catchError(err => {
          console.error('Erro ao filtrar planos:', err);
          this.erroCarregamento = 'Erro ao carregar os planos filtrados. Por favor, tente novamente.';
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

  realizarBusca() {
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

    this.filtrar.next(filtros);
  }

  abrirFiltros() {
    this.abrirFiltro = true;
  }

  fecharFiltros() {
    this.abrirFiltro = false;
  }

  aplicarFiltros() {
    this.abrirFiltro = false;
    this.realizarBusca();
  }

  limparFiltros() {
    this.filtroEtapaEnsino = '';
    this.filtroTipoAtividade = '';
    this.filtroComponentesCurriculares = '';
    this.filtroIsGeradoIA = null;
    this.pesquisa = '';

    this.realizarBusca();
    this.fecharFiltros();
  }
}