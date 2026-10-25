
import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CadastroRequest {
  nome: string;
  email: string;
  senha: string;
  perfisUsuario: {
    perfil: string;
  }[];
}

export type PerfilLogin =
  | 'ROLE_PROFESSOR_PENDING'
  | 'ROLE_ADMIN'
  | 'ROLE_PROFESSOR'
  | 'ROLE_SECRETARIA';

export interface LoginRequest {
  email: string;
  senha: string;
  perfil: PerfilLogin;
}

export interface SessaoUsuarioResponse {
  id: number;

  usuario: {
    id: number;
    nome: string;
    email: string;
  };

  token: string;
  perfilAtivo: PerfilLogin;
  dataCriacao: string;
  dataExpiracao: string;
}

export interface SessaoSalva {
  usuarioId: number;
  nome: string;
  email: string;
  token: string;
  perfil: PerfilLogin;
  dataExpiracao: string;
}

@Injectable({ providedIn: 'root'})

export class AuthService {

  private apiUrl = environment.apiUrl;
  private readonly chaveSessao = 'desplugai_sessao';

  private readonly statusSessao =
    signal<SessaoSalva | null>(this.recuperarSessao());

  readonly sessaoAtual = this.statusSessao.asReadonly();

  constructor(private http: HttpClient) { }

  // CADASTRO
  cadastrar(dados: CadastroRequest): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/usuario`,
      dados
    );
  }

  // LOGIN
  login(dados: LoginRequest): Observable<SessaoUsuarioResponse> {
    return this.http.post<SessaoUsuarioResponse>(
      `${this.apiUrl}/auth`,
      dados
    );
  }

  // SALVAR SESSÃO
  salvarSessao(resposta: SessaoUsuarioResponse): void {

    if ( !resposta?.token || !resposta?.usuario?.id || !resposta?.perfilAtivo || !resposta?.dataExpiracao) {
      throw new Error('Resposta de autenticação inválida.');
    }

    // Verificar expiração do JWT recebido
    if (this.tokenExpirado(resposta.token)) {
      throw new Error('O JWT recebido está expirado ou é inválido.');
    }

    const sessao: SessaoSalva = {
      usuarioId: resposta.usuario.id,
      nome: resposta.usuario.nome,
      email: resposta.usuario.email,
      token: resposta.token,
      perfil: resposta.perfilAtivo,
      dataExpiracao: resposta.dataExpiracao
    };

    sessionStorage.setItem( this.chaveSessao, JSON.stringify(sessao));

    this.statusSessao.set(sessao);
  }

  // RECUPERAR SESSÃO AO RECARREGAR
  private recuperarSessao(): SessaoSalva | null {
    const dados = sessionStorage.getItem(this.chaveSessao);

    if (!dados) {
      return null;
    }

    try {
      const sessao = JSON.parse(dados) as SessaoSalva;
      if ( !sessao?.token || !sessao?.usuarioId || !sessao?.perfil || this.tokenExpirado(sessao.token)) {
        sessionStorage.removeItem(this.chaveSessao);
        return null;
      }
      return sessao;
    } catch {
      sessionStorage.removeItem(this.chaveSessao);
      return null;
    }
  }

  // VERIFICAR EXPIRAÇÃO DO JWT
  private tokenExpirado(token: string): boolean {
    try {
      const partes = token.split('.');
      // JWT compacto possui três partes
      if (
        partes.length !== 3 ||
        partes.some(parte => !parte)
      ) {
        return true;
      }
      // Decodificar o payload do JWT
      const base64 = partes[1]
        .replace(/-/g, '+')
        .replace(/_/g, '/');

      const base64Completo = base64.padEnd( Math.ceil(base64.length / 4) * 4,'=');

      const payload = JSON.parse( atob(base64Completo)) as { exp?: number };
      if ( typeof payload.exp !== 'number' || !Number.isFinite(payload.exp)) {
        return true;
      }
      // exp utiliza segundos; Date.now utiliza milissegundos
      return Date.now() >= payload.exp * 1000;

    } catch {
      return true;
    }
  }

  // RECUPERAR TOKEN NÃO EXPIRADO
  obterTokenValido(): string | null {

    const sessao = this.statusSessao();

    if (!sessao) {
      return null;
    }

    if (this.tokenExpirado(sessao.token)) {
      this.sair();
      return null;
    }

    return sessao.token;
  }

  // ENCERRAR SESSÃO
  sair(): void {
    sessionStorage.removeItem(this.chaveSessao);
    this.statusSessao.set(null);
  }
}
