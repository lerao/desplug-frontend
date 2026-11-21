export interface PerfilDados {
  name: string;
  email: string;
  photo: string | null;
  role: 'professor' | 'admin';
  secretaria?: string | null;
  cep?: string | null;
  cidade?: string | null;
  estado?: string | null;
  uf?: string | null;
}

export type PerfilErros = Partial<Record<'name' | 'email' | 'photo', string>>;
