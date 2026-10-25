
import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { catchError, map, of, startWith, switchMap } from 'rxjs';
import {PlanoAulaService, PlanoAula } from '../services/plano-aula.service';

interface DetalhesPlano { plano: PlanoAula | null; carregando: boolean;}

@Component({
  selector: 'app-detalhes-plano',
  templateUrl: './detalhes-plano.page.html',
  styleUrls: ['./detalhes-plano.page.scss'],
  standalone: false,
})
export class DetalhesPlanoPage {

  private readonly route = inject(ActivatedRoute);
  private readonly planoAulaService = inject(PlanoAulaService);

  readonly status$ = this.route.paramMap.pipe(
    switchMap(params => {

      const id = Number(params.get('id'));

      if (!Number.isInteger(id) || id <= 0) {
        return of<DetalhesPlano>({
          plano: null,
          carregando: false
        });
      }

      return this.planoAulaService.getPlanoPublicoById(id).pipe(
        map((plano): DetalhesPlano => ({
          plano,
          carregando: false
        })),

        startWith({
          plano: null,
          carregando: true
        } as DetalhesPlano),

        catchError(erro => {
          console.error(
            'Erro ao carregar os detalhes do plano:',
            erro
          );

          return of<DetalhesPlano>({
            plano: null,
            carregando: false
          });
        })
      );
    })
  );

  accountNoticeVisible = false;

  isLoggedInTeacher = false;

  showAccountNotice(): void {
    this.accountNoticeVisible = true;
  }
}
