import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { IonicModule } from "@ionic/angular/lazy";
import { PlanoIaPageRoutingModule } from "./plano-ia-routing.module";
import { PlanoIaPage } from "./plano-ia.page";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PlanoIaPageRoutingModule,
  ],
  declarations: [PlanoIaPage],
})
export class PlanoIaPageModule {}
