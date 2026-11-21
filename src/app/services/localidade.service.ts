import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

export interface LocalidadeApiResponse {
  cep: string;
  logradouro: string;
  localidade: string;
  uf: string;        
  estado: string;    
}

export interface Localidade {
  cep: string;
  logradouro: string;
  cidade: string;
  uf: string;
  estado: string;
}

@Injectable({
  providedIn: 'root'
})
export class LocalidadeService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  buscarPorCep(cep: string): Observable<Localidade> {
    const cepLimpo = (cep || '').replace(/\D/g, '');

    if (cepLimpo.length !== 8) {
      return throwError(() => new Error('CEP deve conter 8 dígitos numéricos.'));
    }

    return this.http.get<LocalidadeApiResponse>(`${this.apiUrl}/localidade/${cepLimpo}`).pipe(
      map(resposta => this.montarLocalidade(resposta))
    );
  }

  private montarLocalidade(dados: LocalidadeApiResponse): Localidade {
    const uf = (dados.uf || '').toUpperCase().trim();
    const cep = (dados.cep || '').replace(/\D/g, '') || dados.cep;

    return {
      cep: cep,
      logradouro: dados.logradouro?.trim() || '',
      cidade: dados.localidade?.trim() || '',
      uf: uf,
      estado: dados.estado?.trim() || uf
    };
  }
}