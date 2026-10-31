import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular/lazy';

import { DetalhesPlanoPageRoutingModule } from './detalhes-plano-routing.module';

import { DetalhesPlanoPage } from './detalhes-plano.page';
import { ComponentsModule } from '../components/components.module'; 

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DetalhesPlanoPageRoutingModule,
    ComponentsModule
  ],
  declarations: [DetalhesPlanoPage]
})
export class DetalhesPlanoPageModule {}
