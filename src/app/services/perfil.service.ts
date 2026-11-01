import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { PerfilDados } from '../models/perfil.model';

@Injectable({
  providedIn: 'root'
})
export class PerfilService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/perfil`;

  /** Busca os dados do perfil do usuário logado */
  getPerfil(): Observable<PerfilDados> {
    return this.http.get<PerfilDados>(this.baseUrl);
  }

  /** Atualiza nome e e-mail do perfil */
  atualizarPerfil(dados: Pick<PerfilDados, 'name' | 'email'>): Observable<PerfilDados> {
    return this.http.put<PerfilDados>(this.baseUrl, dados);
  }

  /** Faz upload da foto de perfil via FormData */
  uploadFoto(file: File): Observable<{ photo: string }> {
    const formData = new FormData();
    formData.append('foto', file);
    return this.http.post<{ photo: string }>(`${this.baseUrl}/foto`, formData);
  }

  /** Remove a foto de perfil */
  removerFoto(): Observable<{ photo: null }> {
    return this.http.delete<{ photo: null }>(`${this.baseUrl}/foto`);
  }
}
