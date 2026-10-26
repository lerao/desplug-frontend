import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { PlanoIaPage } from "./plano-ia.page";

const routes: Routes = [
  {
    path: "",
    component: PlanoIaPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PlanoIaPageRoutingModule {}
