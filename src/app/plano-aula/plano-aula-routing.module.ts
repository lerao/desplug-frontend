import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PlanoAulaPage } from './plano-aula.page';

const routes: Routes = [
  {
    path: '',
    component: PlanoAulaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PlanoAulaPageRoutingModule {}
