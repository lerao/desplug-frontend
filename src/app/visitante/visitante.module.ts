import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular/lazy';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VisitantePage } from './visitante.page';
import { ExploreContainerComponentModule } from '../explore-container/explore-container.module';
import { VisitantePageRoutingModule } from './visitante-routing.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ExploreContainerComponentModule,
    VisitantePageRoutingModule
  ],
  declarations: [VisitantePage]
})
export class VisitantePageModule {}