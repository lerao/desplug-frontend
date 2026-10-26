import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { IonicModule } from "@ionic/angular/lazy";
import { PerfilProfessorPageRoutingModule } from "./perfil-professor-routing.module";
import { PerfilProfessorPage } from "./perfil-professor.page";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PerfilProfessorPageRoutingModule,
  ],
  declarations: [PerfilProfessorPage],
})
export class PerfilProfessorPageModule {}
