import { NgModule } from '@angular/core';

import { ChatIaPageRoutingModule } from './chat-ia-routing.module';
import { ChatIaPage } from './chat-ia.page';

@NgModule({
  imports: [
    ChatIaPage,
    ChatIaPageRoutingModule
  ]
})
export class ChatIaPageModule {}
