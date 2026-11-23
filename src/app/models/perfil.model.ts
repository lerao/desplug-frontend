export interface PerfilUsuarioDTO {
  id?: number;
  perfil: string;
}

export interface UsuarioPerfilDTO {
  id: number;
  nome: string;
  email: string;
  perfisUsuario?: PerfilUsuarioDTO[];
  statusHomologacao?: 'PENDENTE' | 'APROVADO' | 'REPROVADO' | string | null;
  dataRegistro?: string | null;
  dataHomologacao?: string | null;
  usuarioHomologacao?: string | null;
}

export interface SecretariaEducacaoDTO {
  id: number;
  nome: string;
  tipo?: string;
  uf?: string;
  municipio?: string;
  dominioOficial?: string;
  ativo?: boolean;
}

export interface ProfessorAfiliacaoDTO {
  id?: number | null;
  professor: UsuarioPerfilDTO;
  secretaria?: SecretariaEducacaoDTO | null;
  status?: 'PENDENTE' | 'VINCULADO' | 'DESVINCULADO' | string | null;
  dataVinculacao?: string | null;
}

export interface PerfilDados {
  id?: number;
  name: string;
  email: string;
  photo: string | null;
  role: 'professor' | 'admin';
  secretaria?: string | null;
  cep?: string | null;
  cidade?: string | null;
  estado?: string | null;
  uf?: string | null;
  statusHomologacao?: 'PENDENTE' | 'APROVADO' | 'REPROVADO' | string | null;
  statusVinculo?: 'PENDENTE' | 'VINCULADO' | 'DESVINCULADO' | string | null;
  dataRegistro?: string | null;
  dataHomologacao?: string | null;
  dataVinculacao?: string | null;
}

export type PerfilErros = Partial<Record<'name' | 'email' | 'photo', string>>;

