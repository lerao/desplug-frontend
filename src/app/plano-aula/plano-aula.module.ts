import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular/lazy';
import { PlanoAulaPageRoutingModule } from './plano-aula-routing.module';
import { PlanoAulaPage } from './plano-aula.page';
import { ComponentsModule } from '../components/components.module'; 
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PlanoAulaPageRoutingModule,
    ComponentsModule,
    ReactiveFormsModule
  ],
  declarations: [PlanoAulaPage]
})
export class PlanoAulaPageModule {}
