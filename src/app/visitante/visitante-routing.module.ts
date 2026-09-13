import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VisitantePage } from './visitante.page';

const routes: Routes = [
  {
    path: '',
    component: VisitantePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VisitantePageRoutingModule {}
