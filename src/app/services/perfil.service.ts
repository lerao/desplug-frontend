import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AuthService } from '../security/auth.service';
import { PerfilDados, ProfessorAfiliacaoDTO } from '../models/perfil.model';

@Injectable({
  providedIn: 'root'
})
export class PerfilService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private readonly apiUrl = environment.apiUrl;

  /**
   * Busca os dados do perfil do usuário logado conforme Swagger:
   * GET /usuario/perfil -> Retorna ProfessorAfiliacaoDTO
   */
  getPerfil(): Observable<PerfilDados> {
    return this.http.get<ProfessorAfiliacaoDTO | any>(`${this.apiUrl}/usuario/perfil`).pipe(
      map((res) => this.mapearPerfil(res))
    );
  }

  /**
   * Atualiza dados cadastrais do usuário via PUT /usuario/{id}
   */
  atualizarPerfil(dados: Pick<PerfilDados, 'name' | 'email'>, idUsuario?: number): Observable<PerfilDados> {
    const id = idUsuario || this.authService.sessaoAtual()?.usuarioId;
    if (id) {
      return this.http.put<any>(`${this.apiUrl}/usuario/${id}`, {
        nome: dados.name,
        email: dados.email,
        perfisUsuario: [],
      }).pipe(
        map((res) => ({
          id: res.id || id,
          name: res.nome || dados.name,
          email: res.email || dados.email,
          photo: null,
          role: 'professor',
        }))
      );
    }

    return this.http.put<PerfilDados>(`${this.apiUrl}/usuario/perfil`, dados);
  }

  /** Faz upload da foto de perfil via FormData */
  uploadFoto(file: File): Observable<{ photo: string }> {
    const formData = new FormData();
    formData.append('foto', file);
    return this.http.post<{ photo: string }>(`${this.apiUrl}/usuario/perfil/foto`, formData);
  }

  /** Remove a foto de perfil */
  removerFoto(): Observable<{ photo: null }> {
    return this.http.delete<{ photo: null }>(`${this.apiUrl}/usuario/perfil/foto`);
  }

  /** Altera a senha da conta do usuário autenticado */
  atualizarSenha(senhaAtual: string, novaSenha: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/usuario/perfil/senha`, {
      currentPassword: senhaAtual,
      newPassword: novaSenha,
    });
  }

  /**
   * Mapeia o contrato retornado pelo Swagger (ProfessorAfiliacaoDTO) para PerfilDados
   */
  private mapearPerfil(res: any): PerfilDados {
    if (res?.professor) {
      const prof = res.professor;
      const sec = res.secretaria;
      const ehAdmin = prof.perfisUsuario?.some((p: any) =>
        p.perfil === 'ROLE_ADMIN' || p.perfil === 'ADMIN'
      );

      return {
        id: prof.id,
        name: prof.nome || '',
        email: prof.email || '',
        photo: prof.foto || null,
        role: ehAdmin ? 'admin' : 'professor',
        secretaria: sec?.nome || null,
        cidade: sec?.municipio || null,
        estado: sec?.uf || null,
        uf: sec?.uf || null,
        cep: res.cep || null,
        statusHomologacao: prof.statusHomologacao || null,
        statusVinculo: res.status || null,
        dataRegistro: prof.dataRegistro || null,
        dataHomologacao: prof.dataHomologacao || null,
        dataVinculacao: res.dataVinculacao || null,
      };
    }

    // Fallback defensivo para respostas planas ou parciais
    const ehAdmin = res?.perfisUsuario?.some((p: any) =>
      p.perfil === 'ROLE_ADMIN' || p.perfil === 'ADMIN'
    ) || res?.role === 'admin' || res?.perfil === 'ROLE_ADMIN';

    return {
      id: res?.id,
      name: res?.nome || res?.name || '',
      email: res?.email || '',
      photo: res?.foto || res?.photo || null,
      role: ehAdmin ? 'admin' : 'professor',
      secretaria: res?.secretaria?.nome || (typeof res?.secretaria === 'string' ? res.secretaria : null),
      cidade: res?.cidade || res?.secretaria?.municipio || null,
      estado: res?.estado || res?.secretaria?.uf || null,
      uf: res?.uf || res?.secretaria?.uf || null,
      cep: res?.cep || null,
      statusHomologacao: res?.statusHomologacao || null,
      statusVinculo: res?.statusVinculo || res?.status || null,
      dataRegistro: res?.dataRegistro || null,
      dataHomologacao: res?.dataHomologacao || null,
      dataVinculacao: res?.dataVinculacao || null,
    };
  }
}

