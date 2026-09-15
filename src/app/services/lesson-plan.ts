import { Injectable } from '@angular/core';
import { Observable, of, delay, map } from 'rxjs';
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
      descricaoCompleta: 'Nesta atividade, os alunos utilizam materiais recicláveis como garrafas PET, tampinhas e caixas de papelão para montar sequências de instruções que simulam algoritmos. A proposta é totalmente desplugada, sem necessidade de computador, e visa desenvolver o pensamento lógico e sequencial dos estudantes de forma lúdica e sustentável. Os alunos trabalham em pequenos grupos para criar "programas" que resolvem desafios propostos pelo professor, como construir um caminho para um robô imaginário chegar ao destino.',
      imagemCapa: 'https://picsum.photos/400/200',
      status: 'Publicado',
      etapaEnsino: 'Anos Iniciais',
      tipoAtividade: 'Desplugada',
      eixoBNCC: 'Pensamento Computacional',
      quantidadeFavoritos: 87,
      quantidadeAdaptacoes: 14,
      adaptadoPorIA: false,
      autor: { id: 101, nome: 'Prof. Felipe Rocha', email: 'felipe@escola.com' },
      habilidadesBncc: [
        {
          id: 1,
          codigo: 'EF15CO01',
          descricao: 'Criar e simular algoritmos simples representados por sequências de instruções escritas ou desenhadas.',
          eixoComputacao: 'Pensamento Computacional'
        },
        {
          id: 2,
          codigo: 'EF15CO03',
          descricao: 'Identificar padrões de comportamento e utilizá-los para a resolução de problemas.',
          eixoComputacao: 'Pensamento Computacional'
        }
      ],
      passos: [
        'Divida a turma em grupos de 4 a 5 alunos.',
        'Distribua os materiais recicláveis para cada grupo.',
        'Apresente o desafio: montar um percurso para o "robô" chegar ao destino.',
        'Cada grupo deve escrever as instruções passo a passo (frente, direita, esquerda, pegar objeto).',
        'Os grupos trocam as instruções entre si e tentam executar o algoritmo do outro grupo.',
        'Promova uma roda de conversa para discutir o que funcionou e o que precisou ser ajustado.'
      ],
      materiais: [
        'Garrafas PET vazias',
        'Tampinhas coloridas',
        'Caixas de papelão pequenas',
        'Fita adesiva colorida',
        'Folhas de papel e canetas'
      ]
    },
    {
      id: 2,
      titulo: 'Robótica com Arduino',
      resumo: 'Aprenda conceitos de robótica e programação utilizando kits de Arduino para criar projetos interativos...',
      descricaoCompleta: 'Este plano de aula introduz conceitos de robótica e programação utilizando a plataforma Arduino. Os alunos aprendem a montar circuitos simples, programar LEDs, sensores e motores, desenvolvendo projetos interativos que integram tecnologia ao currículo escolar. A atividade promove o trabalho colaborativo e a resolução de problemas por meio da experimentação prática.',
      imagemCapa: 'https://picsum.photos/400/201',
      status: 'Publicado',
      etapaEnsino: 'Anos Finais',
      tipoAtividade: 'Maker',
      eixoBNCC: 'Mundo Digital',
      quantidadeFavoritos: 102,
      quantidadeAdaptacoes: 21,
      adaptadoPorIA: false,
      autor: { id: 102, nome: 'Mariana Costa', email: 'mariana@escola.com' },
      habilidadesBncc: [
        {
          id: 3,
          codigo: 'EF69CO02',
          descricao: 'Construir soluções para problemas utilizando a lógica de programação combinada com montagem de dispositivos físicos.',
          eixoComputacao: 'Mundo Digital'
        }
      ],
      comoRealizar: 'Apresente o kit Arduino aos alunos e demonstre a montagem de um circuito básico com LED. Em seguida, guie os grupos na programação do primeiro sketch para acender e apagar o LED. Progressivamente, introduza sensores e motores para criar projetos mais complexos.',
      materiais: [
        'Kit Arduino Uno',
        'Protoboard e jumpers',
        'LEDs coloridos',
        'Resistores variados',
        'Sensor ultrassônico HC-SR04',
        'Cabo USB para conexão com computador'
      ],
      planoOrigem: {
        id: 99,
        titulo: 'Introdução à Eletrônica Básica'
      }
    }
  ];

  /**
   * Retorna os planos públicos (com status "Publicado")
   */
  getPublicPlans(): Observable<LessonPlan[]> {
    const published = this.publicPlansMock.filter(plan => plan.status === 'Publicado');
    return of(published);
  }

  /**
   * Retorna um plano específico pelo ID.
   * Simula um delay de rede para testar o estado de loading.
   */
  getPlanById(id: number): Observable<LessonPlan | undefined> {
    return of(this.publicPlansMock.find(plan => plan.id === id));
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