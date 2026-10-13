import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ChatIaPage } from './chat-ia.page';

const routes: Routes = [
  {
    path: '',
    component: ChatIaPage
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class ChatIaPageRoutingModule {}