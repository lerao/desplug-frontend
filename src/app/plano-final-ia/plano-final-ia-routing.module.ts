import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { PlanoFinalIaPage } from "./plano-final-ia.page";

const routes: Routes = [
  {
    path: "",
    component: PlanoFinalIaPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PlanoFinalIaPageRoutingModule {}
