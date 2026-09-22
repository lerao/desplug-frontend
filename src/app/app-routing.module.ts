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
    path: 'tabs',
    loadChildren: () =>
      import('./tabs/tabs.module').then(m => m.TabsPageModule)
  },
  {
    path: 'detalhes-plano/:id',
    loadChildren: () =>
      import('./detalhes-plano/detalhes-plano.module').then(m => m.DetalhesPlanoPageModule)
  },
  {
    path: 'login',
    loadChildren: () =>
      import('./login/login.module').then(m => m.LoginPageModule)
  },
  {
    path: 'entrar',
    redirectTo: 'login',
    pathMatch: 'full'
  }

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}