import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { LessonPlan } from '../models/lesson-plan.model';

@Injectable({
  providedIn: 'root'
})
export class LessonPlanService {

  // Dados mockados temporários simulando o banco de dados do projeto
  private publicPlansMock: LessonPlan[] = [
    {
      id: 1,
      titulo: 'Algoritmos com Sucata',
      resumo: 'Introdução ao pensamento computacional usando materiais recicláveis para criar sequências de instruções...',
      imagemCapa: 'https://picsum.photos/400/200',
      status: 'Publicado',
      etapaEnsino: 'Anos Iniciais',
      tipoAtividade: 'Desplugada',
      eixoBNCC: 'Pensamento Computacional',
      quantidadeFavoritos: 87,
      quantidadeAdaptacoes: 14,
      adaptadoPorIA: false,
      autor: { id: 101, nome: 'Prof. Felipe Rocha', email: 'felipe@escola.com' }
    },
    {
      id: 2,
      titulo: 'Robótica com Arduino',
      resumo: 'Aprenda conceitos de robótica e programação utilizando kits de Arduino para criar projetos interativos...',
      imagemCapa: 'https://picsum.photos/400/201',
      status: 'Publicado',
      etapaEnsino: 'Anos Finais',
      tipoAtividade: 'Maker',
      eixoBNCC: 'Mundo Digital',
      quantidadeFavoritos: 102,
      quantidadeAdaptacoes: 21,
      adaptadoPorIA: false,
      autor: { id: 102, nome: 'Mariana Costa', email: 'mariana@escola.com' }
    }
  ];

  /**
   * Retorna os planos públicos (com status "Publicado")
   */
  getPublicPlans(): Observable<LessonPlan[]> {
    const published = this.publicPlansMock.filter(plan => plan.status === 'Publicado');
    return of(published);
  }

  /* Utilitário para gerar as iniciais do nome do autor */
  getAuthorInitials(name: string): string {
    if (!name) return 'S/N';
    const cleanName = name.replace(/Prof\.|Profª\./g, '').trim();
    const parts = cleanName.split(' ');
    return parts.length >= 2 
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : parts[0].substring(0, 2).toUpperCase();
  }
}