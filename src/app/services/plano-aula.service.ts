
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

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

//
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
  componenteCurricular?: string;

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

@Injectable({
  providedIn: 'root'
})
export class PlanoAulaService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private authService: AuthService) { }

  // Cadastrar plano de aula

  // Cadastrar plano de aula
  cadastrar(dados: PlanoAulaRequest):
    Observable<PlanoAulaResponse> {

    const token = this.authService.obterTokenValido();

    if (!token) {
      return throwError(() =>
        new Error('É necessário fazer login para cadastrar um plano.')
      );
    }

    return this.http.post<PlanoAulaResponse>(
      `${this.apiUrl}/plano-aula`,
      dados,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
  }


  // Buscar habilidades BNCC
  listarHabilidades(): Observable<HabilidadeBncc[]> {

    const token = this.authService.obterTokenValido();

    if (!token) {
      return throwError(() =>
        new Error('É necessário fazer login para consultar as habilidades.')
      );
    }

    return this.http.get<HabilidadeBncc[]>(
      `${this.apiUrl}/habilidade-bncc`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
  }

  // Buscar todos os planos para a tela de visitante (temporário) - alterar para que aceite apenas planos com status "Publicado" 

  // Buscar planos para visitantes sem autenticação
  getPlanosPublicos(): Observable<PlanoAula[]> {

    return this.http.get<PlanoAulaApiResponse[]>(
      `${this.apiUrl}/plano-aula`
    ).pipe(
      map(planos =>
        planos.map(plano => this.converterPlano(plano))
      )
    );
  }


  // Buscar detalhes de um plano como visitante - detalhes_planos
  getPlanoPublicoById(id: number): Observable<PlanoAula> {

    return this.http.get<PlanoAulaApiResponse>(
      `${this.apiUrl}/plano-aula/${id}`
    ).pipe(
      map(plano => this.converterPlano(plano))
    );
  }

  // Buscar um plano específico pelo ID - detalhes_planos
  getPlanoById(id: number): Observable<PlanoAula> {

    const token = this.authService.obterTokenValido();

    if (!token) {
      return throwError(() =>
        new Error('É necessário fazer login para visualizar o plano.')
      );
    }

    return this.http.get<PlanoAulaApiResponse>(
      `${this.apiUrl}/plano-aula/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    ).pipe(
      map(plano => this.converterPlano(plano))
    );
  }

  // Converter dados da API para o modelo usado nos cards
  private converterPlano(plano: PlanoAulaApiResponse): PlanoAula {
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

      componenteCurricular: plano.componentesCurriculares,

      autor: {
        id: plano.autor?.id ?? 0,
        nome: plano.autor?.nome || 'Autor não informado',
        email: plano.autor?.email ?? ''
      },

      // Ainda não codificados pela API
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

  // Gerar as iniciais do autor

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
}
