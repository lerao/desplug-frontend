import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'visitante',
    pathMatch: 'full'
  },
  {
    path: 'visitante',
    loadChildren: () =>
      import('./visitante/visitante.module').then(m => m.VisitantePageModule)
  },
  {
    path: 'detalhes-plano/:id',
    loadChildren: () =>
      import('./detalhes-plano/detalhes-plano.module').then(m => m.DetalhesPlanoPageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then(m => m.LoginPageModule)
  },
  {
    path: 'entrar',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'cadastro',
    loadChildren: () => import('./cadastro/cadastro.module').then(m => m.CadastroPageModule)
  },
  {
    path: 'chat-ia',
    loadChildren: () => import('./chat-ia/chat-ia.module').then(m => m.ChatIaPageModule)
  },
  {
    path: 'plano-ia',
    loadChildren: () => import('./plano-ia/plano-ia.module').then(m => m.PlanoIaPageModule)
  },
  {
    path: 'plano-final-ia',
    loadChildren: () => import('./plano-final-ia/plano-final-ia.module').then(m => m.PlanoFinalIaPageModule)
  },
  {
    path: 'plano-aula',
    loadChildren: () => import('./plano-aula/plano-aula.module').then(m => m.PlanoAulaPageModule)
  },  {
    path: 'perfil-professor',
    loadChildren: () => import('./perfil-professor/perfil-professor.module').then(m => m.PerfilProfessorPageModule)
  }

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}