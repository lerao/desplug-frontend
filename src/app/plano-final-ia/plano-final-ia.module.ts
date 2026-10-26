import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { IonicModule } from "@ionic/angular/lazy";
import { PlanoFinalIaPageRoutingModule } from "./plano-final-ia-routing.module";
import { PlanoFinalIaPage } from "./plano-final-ia.page";

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    PlanoFinalIaPageRoutingModule,
  ],
  declarations: [PlanoFinalIaPage],
})
export class PlanoFinalIaPageModule {}
