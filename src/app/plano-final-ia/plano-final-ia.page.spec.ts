import { ComponentFixture, TestBed } from "@angular/core/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { IonicModule } from "@ionic/angular/lazy";
import { beforeEach, describe, expect, it } from "vitest";
import { PlanoFinalIaPage } from "./plano-final-ia.page";

describe("PlanoFinalIaPage", () => {
  let component: PlanoFinalIaPage;
  let fixture: ComponentFixture<PlanoFinalIaPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PlanoFinalIaPage],
      imports: [
        IonicModule.forRoot(),
        RouterTestingModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PlanoFinalIaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
