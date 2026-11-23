import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it } from 'vitest';
import { PerfilDados } from '../models/perfil.model';
import { PerfilService } from '../services/perfil.service';
import { AuthService } from '../security/auth.service';
import { PerfilProfessorPageModule } from './perfil-professor.module';
import { PerfilProfessorPage } from './perfil-professor.page';

describe('PerfilProfessorPage', () => {
  let component: PerfilProfessorPage;
  let fixture: ComponentFixture<PerfilProfessorPage>;

  const mockPerfil: PerfilDados = {
    id: 1,
    name: 'Natália Firmino',
    email: 'natalia@email.com.br',
    photo: null,
    role: 'professor',
    secretaria: 'Secretaria Municipal de Educação',
    cidade: 'Afogados da Ingazeira',
    estado: 'PE',
    uf: 'PE',
    statusHomologacao: 'APROVADO',
    statusVinculo: 'VINCULADO',
    dataRegistro: '2026-02-08T12:00:00Z',
    dataHomologacao: '2026-02-10T14:00:00Z',
  };

  const perfilServiceMock = {
    getPerfil: () => of(mockPerfil),
    atualizarPerfil: () => of(mockPerfil),
    uploadFoto: () => of({ photo: 'http://foto.jpg' }),
    removerFoto: () => of({ photo: null }),
    atualizarSenha: () => of(undefined),
  };

  const authServiceMock = {
    sessaoAtual: () => ({
      usuarioId: 1,
      nome: 'Natália Firmino',
      email: 'natalia@email.com.br',
      token: 'jwt-token',
      perfil: 'ROLE_PROFESSOR',
      dataExpiracao: '2026-12-31',
    }),
    atualizarPerfilLocal: () => {},
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PerfilProfessorPageModule, RouterModule.forRoot([])],
      providers: [
        { provide: PerfilService, useValue: perfilServiceMock },
        { provide: AuthService, useValue: authServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PerfilProfessorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve carregar dados de perfil do professor', () => {
    expect(component.nome()).toBe('Natália Firmino');
    expect(component.email()).toBe('natalia@email.com.br');
    expect(component.secretaria()).toBe('Secretaria Municipal de Educação');
    expect(component.cidade()).toBe('Afogados da Ingazeira');
    expect(component.uf()).toBe('PE');
    expect(component.statusHomologacao()).toBe('APROVADO');
    expect(component.statusVinculo()).toBe('VINCULADO');
  });

  it('deve formatar data corretamente', () => {
    expect(component.formatarData('2026-02-08T12:00:00Z')).toBe('08/02/2026');
    expect(component.formatarData(null)).toBe('—');
  });

  it('deve gerar iniciais do professor', () => {
    expect(component.previsualizarIniciais()).toBe('NF');
  });
});
