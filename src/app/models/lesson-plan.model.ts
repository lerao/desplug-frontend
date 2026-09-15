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

export interface LessonPlan {
  id: number;
  titulo: string;
  resumo: string;
  descricaoCompleta?: string;
  imagemCapa: string;
  status: 'Publicado' | 'Rascunho' | 'Arquivado'; 
  
  etapaEnsino: 'Educação Infantil' | 'Anos Iniciais' | 'Anos Finais' | 'Ensino Médio';
  eixoBNCC: 'Pensamento Computacional' | 'Mundo Digital' | 'Cultura Digital' | string;
  tipoAtividade: 'Desplugada' | 'Maker' | 'Digital' | 'Híbrida';
  componenteCurricular?: string; 
  
  autor: User;
  
  quantidadeFavoritos: number;
  quantidadeAdaptacoes: number;
  adaptadoPorIA: boolean;
  dataCriacao?: string;

  habilidadesBncc?: BNCC[];
  passos?: string[];
  comoRealizar?: string;
  materiais?: string[];
  planoOrigem?: PlanoOrigem;
}