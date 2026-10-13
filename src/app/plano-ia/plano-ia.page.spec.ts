import { ComponentFixture, TestBed } from "@angular/core/testing";
import { Router } from "@angular/router";
import { RouterTestingModule } from "@angular/router/testing";
import { FormsModule } from "@angular/forms";
import { IonicModule } from "@ionic/angular/lazy";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PlanoIaPage } from "./plano-ia.page";
import { AppDialogService } from "../shared/app-dialog/app-dialog.service";

describe("PlanoIaPage", () => {
  let component: PlanoIaPage;
  let fixture: ComponentFixture<PlanoIaPage>;
  const dialog = { show: vi.fn(async () => ({ role: "publish" })) };

  beforeEach(async () => {
    dialog.show.mockClear();
    localStorage.removeItem("desplugai-plan");
    localStorage.removeItem("desplugai-plan-published");
    await TestBed.configureTestingModule({
      declarations: [PlanoIaPage],
      imports: [
        FormsModule,
        IonicModule.forRoot(),
        RouterTestingModule,
      ],
      providers: [
        { provide: AppDialogService, useValue: dialog }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PlanoIaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("asks for confirmation before publishing the lesson plan", async () => {
    const router = TestBed.inject(Router);
    const navigateSpy = vi
      .spyOn(router, "navigateByUrl")
      .mockResolvedValue(true);

    await component.savePlan();

    expect(component.plan.skillCodes.length).toBeGreaterThan(0);
    expect(component.plan.status).toBe("PUBLICADO");
    expect(localStorage.getItem("desplugai-plan-published")).toBe("true");
    expect(navigateSpy).toHaveBeenCalledWith("/plano-final-ia");
    expect(dialog.show).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Salvar e publicar",
        message: "Deseja salvar e publicar o plano de aula no app?",
        buttons: [
          { text: "Cancelar", role: "cancel" },
          { text: "Publicar", role: "publish" },
        ],
      }),
    );
  });

  it("does not publish the plan when confirmation is cancelled", async () => {
    dialog.show.mockResolvedValueOnce({ role: "cancel" });
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, "navigateByUrl");

    await component.savePlan();

    expect(component.plan.status).toBe("RASCUNHO");
    expect(localStorage.getItem("desplugai-plan-published")).toBeNull();
    expect(navigateSpy).not.toHaveBeenCalled();
  });
});
