import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DetalhesPlanoPage } from './detalhes-plano.page';

const routes: Routes = [
  {
    path: '',
    component: DetalhesPlanoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DetalhesPlanoPageRoutingModule {}
