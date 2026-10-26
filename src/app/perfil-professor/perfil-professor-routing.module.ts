import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PerfilProfessorPage } from './perfil-professor.page';

const routes: Routes = [
  {
    path: '',
    component: PerfilProfessorPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PerfilProfessorPageRoutingModule {}
