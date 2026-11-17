export interface PerfilDados {
  name: string;
  email: string;
  photo: string | null;
  role: 'professor' | 'admin';
}

export type PerfilErros = Partial<Record<'name' | 'email' | 'photo', string>>;
