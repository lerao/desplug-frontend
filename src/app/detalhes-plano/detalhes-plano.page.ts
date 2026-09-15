import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { LessonPlan } from '../models/lesson-plan.model';
import { LessonPlanService } from '../services/lesson-plan';

@Component({
  selector: 'app-detalhes-plano',
  templateUrl: './detalhes-plano.page.html',
  styleUrls: ['./detalhes-plano.page.scss'],
  standalone: false,
})
export class DetalhesPlanoPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly lessonPlanService = inject(LessonPlanService);

  // Plano que será exibido na página
  lessonPlan: LessonPlan | undefined;

  // Controla o estado de carregamento
  isLoading = true;

  // Controla a mensagem exibida ao clicar
  // em "Criar conta para adaptar" ou
  // "Criar conta para favoritar"
  accountNoticeVisible = false;

  // Badge "Disponível" só é exibido para professor autenticado.
  // Ainda não há autenticação nesta tela de visitante.
  isLoggedInTeacher = false;

  ngOnInit(): void {
    this.carregarPlano();
  }

  /**
   * Obtém o ID do plano pela URL e carrega
   * os dados através do LessonPlanService.
   *
   * Exemplo:
   * /detalhes-plano/1
   */
  private carregarPlano(): void {
    this.isLoading = true;

    const idParam = this.route.snapshot.paramMap.get('id');

    // Se não existir ID na URL
    if (!idParam) {
      this.lessonPlan = undefined;
      this.isLoading = false;
      return;
    }

    const id = Number(idParam);

    // Se o ID não for um número válido
    if (Number.isNaN(id)) {
      this.lessonPlan = undefined;
      this.isLoading = false;
      return;
    }

    // Busca o plano pelo ID
    this.lessonPlanService.getPlanById(id).subscribe({
      next: (plan) => {
        this.lessonPlan = plan;
        this.isLoading = false;
      },

      error: (error) => {
        console.error('Erro ao carregar os detalhes do plano:', error);

        this.lessonPlan = undefined;
        this.isLoading = false;
      }
    });
  }

  /**
   * Exibe o aviso informando que o visitante
   * precisa criar uma conta.
   */
  showAccountNotice(): void {
    this.accountNoticeVisible = true;
  }
}
