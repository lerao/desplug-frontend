
import { Component, inject } from '@angular/core';
import { Observable, catchError, of } from 'rxjs';
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

  planosAula$: Observable<PlanoAula[]> =
    this.planoAulaService.getPlanosPublicos().pipe(
      catchError(err => {
        console.error('Erro ao buscar planos:', err);
        this.erroCarregamento = 'Erro ao carregar os planos. Por favor, tente novamente.';
        return of([]);
      })
    );

  searchTerm: string = '';

  customPopoverOptions = {
    header: 'Ordenar por',
    alignment: 'center',
    cssClass: 'custom-sort-popover'
  };

  isFilterOpen = false;

  abrirFiltros() {
    this.isFilterOpen = true;
  }

  fecharFiltros() {
    this.isFilterOpen = false;
  }

  aplicarFiltros() {
    this.isFilterOpen = false;
  }
}