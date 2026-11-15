
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from '../security/auth.service';

export type TipoAtividade =
  | 'PLANO_AULA'
  | 'ATIVIDADE_DESPLUGADA'
  | 'PROJETO_MAKER'
  | 'ATIVIDADE_DIGITAL';

export type EtapaEnsino =
  | 'EDUCACAO_INFANTIL'
  | 'FUNDAMENTAL_INICIAIS'
  | 'FUNDAMENTAL_FINAIS'
  | 'ENSINO_MEDIO';

export interface HabilidadeBncc {
  id: number;
  codigo: string;
  descricao: string;
  eixoComputacao: string;
  componenteCurricular: string;
}

export interface PlanoAulaRequest {
  titulo: string;
  resumo: string;
  tipoAtividade: TipoAtividade;
  etapaEnsino: EtapaEnsino;
  anosIndicados: string;
  duracao: string;
  componentesCurriculares: string;
  materiaisNecessarios: string;
  metodologia: string;
  criteriosAvaliacao: string;
  imagemCapa: string;
  habilidadesPlano: {
    habilidade: { id: number };
  }[];
  autor: { id: number };
  isGeradoIA: boolean;
  isDerivado: boolean;
}

export interface PlanoAulaResponse {
  id: number;
  titulo: string;
  statusPublicacao: string;
}

// Estrutura dos planos retornados pela API
export interface PlanoAulaApiResponse {
  id: number;
  titulo: string;
  resumo: string;
  tipoAtividade: TipoAtividade;
  etapaEnsino: EtapaEnsino;
  statusPublicacao: string;
  imagemCapa?: string | null;
  componentesCurriculares?: string;
  metodologia?: string;
  materiaisNecessarios?: string;
  criteriosAvaliacao?: string;
  isGeradoIA?: boolean;
  isDerivado?: boolean;
  dataCriacao?: string;
  autor?: {
    id: number;
    nome: string;
    email?: string;
  };
  habilidadesPlano?: {
    habilidade: HabilidadeBncc;
  }[];
  planoOrigem?: {
    id: number;
    titulo: string;
  } | null;
}

export interface User {
  id: number;
  nome: string;
  email: string;
  perfil?: string;
}

export interface BNCC {
  id: number;
  codigo: string;
  descricao: string;
  eixoComputacao: string;
}

export interface PlanoOrigem {
  id: number;
  titulo: string;
}

export interface PlanoAula {
  id: number;
  titulo: string;
  resumo: string;
  descricaoCompleta?: string;
  imagemCapa: string;
  status: 'Publicado' | 'Pendente de moderação' | 'Rascunho' | 'Arquivado';

  etapaEnsino: 'Educação Infantil' | 'Anos Iniciais' | 'Anos Finais' | 'Ensino Médio';
  eixoBNCC: 'Pensamento Computacional' | 'Mundo Digital' | 'Cultura Digital' | string;
  tipoAtividade: 'Plano de Aula' | 'Desplugada' | 'Maker' | 'Digital' | 'Híbrida';
  componentesCurriculares?: string;

  autor: User;

  quantidadeFavoritos: number;
  quantidadeAdaptacoes: number;
  isGeradoIA: boolean;
  dataCriacao?: string;

  habilidadesBncc?: BNCC[];
  passos?: string[];
  comoRealizar?: string;
  materiais?: string[];
  planoOrigem?: PlanoOrigem;
}

//FEEDBACKS PRÁTICOS - COMENTÁRIOS 
export interface FeedbackPratico {
  id: number;
  relatoExperiencia: string;
  avaliacaoGeral: number;
  dataRegistro: string;
  dataAplicacao?: string;
  usuario?: User;
  plano: { id: number };
}

export interface FeedbackPraticoRequest {
  relatoExperiencia: string;
  avaliacaoGeral: number;
  dataAplicacao: string;
  plano: { id: number };
  usuario?: { id: number };
}

@Injectable({
  providedIn: 'root'
})
export class PlanoAulaService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private authService: AuthService) { }

  cadastrarPlano(dados: PlanoAulaRequest): Observable<PlanoAulaResponse> {

    const sessao = this.authService.sessaoAtual();

    if (!sessao) {
      return throwError(() =>
        new Error('É necessário fazer login para cadastrar um plano.')
      );
    }

    const dadosUsuario: PlanoAulaRequest = {
      ...dados,
      autor: {
        id: sessao.usuarioId
      }
    };

    return this.http.post<PlanoAulaResponse>(`${this.apiUrl}/plano-aula`, dadosUsuario);
  }

  // Buscar habilidades BNCC
  getHabilidades(): Observable<HabilidadeBncc[]> {
    return this.http.get<HabilidadeBncc[]>(`${this.apiUrl}/habilidade-bncc`);
  }

  // Buscar todos os planos para a tela de visitante (temporário) - alterar para que aceite apenas planos com status "Publicado" 
  getPlanos(): Observable<PlanoAula[]> {
    return this.http.get<PlanoAulaApiResponse[]>(
      `${this.apiUrl}/plano-aula`
    ).pipe(
      map(planos =>
        planos.map(plano => this.montarPlano(plano))
      )
    );
  }

  // exibe detalhes de um plano (detalhes_planos).
  getPlanoPorId(id: number): Observable<PlanoAula> {
    return this.http.get<PlanoAulaApiResponse>(
      `${this.apiUrl}/plano-aula/${id}`
    ).pipe(
      map(plano => this.montarPlano(plano))
    );
  }

  // exibe os planos de acordo com o usuário (é usado na home, para listar os planos do usuário logado).
  getPlanosPorAutor(usuarioId: number): Observable<PlanoAula[]> {
    return this.http.get<PlanoAulaApiResponse[]>(
      `${this.apiUrl}/plano-aula/usuario/${usuarioId}`
    ).pipe(
      map(resposta => resposta.map(plano => this.montarPlano(plano)))
    );
  }

  // Converte dados da API para o modelo usado nos cards.
  private montarPlano(plano: PlanoAulaApiResponse): PlanoAula {
    const etapas: Record<EtapaEnsino, PlanoAula['etapaEnsino']> = {
      EDUCACAO_INFANTIL: 'Educação Infantil',
      FUNDAMENTAL_INICIAIS: 'Anos Iniciais',
      FUNDAMENTAL_FINAIS: 'Anos Finais',
      ENSINO_MEDIO: 'Ensino Médio'
    };

    const tipos: Record<TipoAtividade, PlanoAula['tipoAtividade']> = {
      PLANO_AULA: 'Plano de Aula',
      ATIVIDADE_DESPLUGADA: 'Desplugada',
      PROJETO_MAKER: 'Maker',
      ATIVIDADE_DIGITAL: 'Digital'
    };

    const eixos: Record<string, string> = {
      PENSAMENTO_COMPUTACIONAL: 'Pensamento Computacional',
      MUNDO_DIGITAL: 'Mundo Digital',
      CULTURA_DIGITAL: 'Cultura Digital'
    };

    const status: Record<string, PlanoAula['status']> = {
      PUBLICADO: 'Publicado',
      PENDENTE_MODERACAO: 'Pendente de moderação',
      RASCUNHO: 'Rascunho',
      ARQUIVADO: 'Arquivado'
    };

    const habilidades = (plano.habilidadesPlano ?? []).map(item => item.habilidade).filter((hab): hab is HabilidadeBncc => !!hab);

    const eixoPrincipal = habilidades[0]?.eixoComputacao;

    return {
      id: plano.id,
      titulo: plano.titulo,
      resumo: plano.resumo,

      imagemCapa: plano.imagemCapa?.trim()
        || '/assets/image/logo.png',

      status: status[plano.statusPublicacao]
        ?? 'Pendente de moderação',

      etapaEnsino: etapas[plano.etapaEnsino],
      tipoAtividade: tipos[plano.tipoAtividade],

      eixoBNCC: eixoPrincipal
        ? (eixos[eixoPrincipal] ?? eixoPrincipal)
        : 'Não informado',

      componentesCurriculares: plano.componentesCurriculares,

      autor: {
        id: plano.autor?.id ?? 0,
        nome: plano.autor?.nome || 'Autor não informado',
        email: plano.autor?.email ?? ''
      },

      quantidadeFavoritos: 0,
      quantidadeAdaptacoes: 0,

      isGeradoIA: plano.isGeradoIA ?? false,
      dataCriacao: plano.dataCriacao,

      habilidadesBncc: habilidades.map(hab => ({
        id: hab.id,
        codigo: hab.codigo,
        descricao: hab.descricao,
        eixoComputacao:
          eixos[hab.eixoComputacao] ?? hab.eixoComputacao
      })),

      descricaoCompleta: plano.criteriosAvaliacao
        ? `Critérios de avaliação: ${plano.criteriosAvaliacao}`
        : undefined,

      comoRealizar: plano.metodologia,

      materiais: plano.materiaisNecessarios
        ?.split('\n')
        .map(item => item.trim())
        .filter(Boolean) ?? [],

      planoOrigem: plano.planoOrigem
        ? {
          id: plano.planoOrigem.id,
          titulo: plano.planoOrigem.titulo
        }
        : undefined
    };
  }

  // exibe as iniciais do nome do usuário para montar o avatar.
  getAutorIniciais(nome: string): string {
    if (!nome?.trim()) {
      return 'S/N';
    }

    const nomeLimpo = nome.replace(/\bProf(?:ª)?\./gi, '').trim();
    if (!nomeLimpo) {
      return 'S/N';
    }

    const partes = nomeLimpo.split(/\s+/);

    if (partes.length === 1) {
      return partes[0].substring(0, 2).toUpperCase();
    }

    const primeiraInicial = partes[0][0];
    const ultimaInicial = partes[partes.length - 1][0];

    return `${primeiraInicial}${ultimaInicial}`.toUpperCase();
  }

  // exclui o plano, apenas se o usuário for o autor de plano
  excluirPlano(id: number): Observable<{ status: number, mensagem: string }> {
    return this.http.delete<{
      status: number, mensagem: string
    }>
      (`${this.apiUrl}/plano-aula/${id}`);
  }


  // exibe os comentário do plano selecionado
  getFeedbacksPorPlano(planoId: number): Observable<FeedbackPratico[]> {
    return this.http.get<FeedbackPratico[]>(`${this.apiUrl}/feedback-pratico`)
      .pipe(
        map(feedbacks => feedbacks.filter(
          feedback => feedback.plano?.id === planoId
        ))
      );
  }

  // adiciona um novo comentário
  criarFeedback(dados: FeedbackPraticoRequest): Observable<FeedbackPratico> {
    const sessao = this.authService.sessaoAtual();

    if (!sessao) {
      return throwError(() => new Error('É necessário fazer login para publicar um comentário.'));
    }

    const payload = {
      ...dados,
      usuario: { id: sessao.usuarioId }
    };

    return this.http.post<FeedbackPratico>(`${this.apiUrl}/feedback-pratico`, payload);
  }

  // atualizar um comentário
  atualizarFeedback(id: number, dados: FeedbackPraticoRequest): Observable<FeedbackPratico> {
    const sessao = this.authService.sessaoAtual();

    if (!sessao) {
      return throwError(() =>
        new Error('É necessário fazer login para editar um comentário.')
      );
    }

    const payload = {
      ...dados,
      usuario: { id: sessao.usuarioId }
    };

    return this.http.put<FeedbackPratico>(`${this.apiUrl}/feedback-pratico/${id}`, payload);
  }

  // excluir um comentário
  excluirFeedback(id: number): Observable<{ status: number; mensagem: string }> {
    return this.http.delete<{
      status: number; mensagem: string
    }>
      (`${this.apiUrl}/feedback-pratico/${id}`);
  }

  // Pesquisa planos com base nos filtros fornecidos, utilizando barra de pesquisa e modal de filtros.
  filtrarPlanos(filtros: any): Observable<PlanoAula[]> {
    let params = new HttpParams();

    // filtros de pesquisa textual (título ou código BNCC)
    if (filtros.titulo) {
      params = params.append('titulo', filtros.titulo);
    }

    if (filtros.codigoHabilidade) {
      params = params.append('codigoHabilidade', filtros.codigoHabilidade);
    }

    // modal de filtros
    if (filtros.tipoAtividade) {
      params = params.append('tipoAtividade', filtros.tipoAtividade);
    }

    if (filtros.etapaEnsino) {
      params = params.append('etapaEnsino', filtros.etapaEnsino);
    }

    if (filtros.componentesCurriculares) {
      params = params.append('componentesCurriculares', filtros.componentesCurriculares);
    }

    if (filtros.eixoComputacao) {
      params = params.append('eixoComputacao', filtros.eixoComputacao);
    }

    if (filtros.isGeradoIA !== undefined && filtros.isGeradoIA !== null) {
      params = params.append('isGeradoIA', filtros.isGeradoIA);
    }

    // identifica o autor quando a pesquisa for em Meus Planos
    if (filtros.idAutor !== undefined && filtros.idAutor !== null) {
      params = params.append('idAutor', filtros.idAutor);
    }

    // filtros de ordenação
    if (filtros.orderBy) {
      params = params.append('orderBy', filtros.orderBy);
    } else {
      params = params.append('orderBy', 'MAIS_RECENTES');
    }

    return this.http.get<{ content: PlanoAulaApiResponse[] }>(
      `${this.apiUrl}/plano-aula/pesquisar`,
      { params }
    ).pipe(
      map(resposta =>
        resposta.content.map(plano => this.montarPlano(plano))
      )
    );
  }
}
