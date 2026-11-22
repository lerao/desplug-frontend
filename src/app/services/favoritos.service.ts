
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { PlanoAulaApiResponse } from './plano-aula.service';

export interface Favorito {
  id: number;
  dataRegistro?: string;
  usuario: {
    id: number;
    nome?: string;
  };
  planoAula: PlanoAulaApiResponse;
}

@Injectable({
  providedIn: 'root'
})
export class FavoritosService {

  private readonly apiUrl = `${environment.apiUrl}/favorito`;

  constructor(private http: HttpClient) {}

  listar(): Observable<Favorito[]> {
    return this.http.get<Favorito[]>(this.apiUrl);
  }

  adicionar(usuarioId: number, planoId: number): Observable<Favorito> {
    return this.http.post<Favorito>(this.apiUrl, {
      usuario: { id: usuarioId },
      planoAula: { id: planoId }
    });
  }

  remover(favoritoId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${favoritoId}`
    );
  }
}
