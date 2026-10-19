import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { RouterTestingModule } from "@angular/router/testing";
import { IonicModule } from "@ionic/angular/lazy";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PerfilProfessorPage } from "./perfil-professor.page";

describe("PerfilProfessorPage", () => {
  let component: PerfilProfessorPage;
  let fixture: ComponentFixture<PerfilProfessorPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PerfilProfessorPage],
      imports: [
        FormsModule,
        IonicModule.forRoot(),
        RouterTestingModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PerfilProfessorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should show only favorite plans", () => {
    component.showRepository("favorites");
    expect(component.filteredPlans.length).toBe(2);
  });

  it("should apply filters only to favorite plans in the favorites view", () => {
    component.showRepository("favorites");
    component.filters.subject = "Sociologia";

    expect(component.repositoryView).toBe("favorites");
    expect(component.filteredPlans).toHaveLength(1);
    expect(component.filteredPlans[0].favorite).toBe(true);
  });

  it("should open contextual filters that only affect favorite plans", () => {
    component.publishedFilters.axis = "Mundo digital";
    component.showRepository("favorites");

    component.openRepositoryFilters();
    component.favoriteFilters.axis = "Pensamento computacional";

    expect(component.repositoryView).toBe("favorites");
    expect(component.filterPanelMode).toBe("favorites");
    expect(component.filtersOpen).toBe(true);
    expect(component.filteredPlans).toHaveLength(1);
    expect(component.filteredPlans[0].id).toBe(3);
    expect(component.filteredPlans.every((plan) => plan.favorite)).toBe(true);
    expect(component.publishedFilters.axis).toBe("Mundo digital");
  });

  it("should keep the favorites list selected after clearing favorite filters", () => {
    component.showRepository("favorites");
    component.openFavoriteFilters();
    component.favoriteFilters.axis = "Pensamento computacional";

    component.clearFilters();

    expect(component.repositoryView).toBe("favorites");
    expect(component.filteredPlans).toHaveLength(component.favoriteCount);
    expect(component.filteredPlans.every((plan) => plan.favorite)).toBe(true);
  });

  it("should open published-only filters from the repository title", () => {
    component.showRepository("favorites");
    component.filters.area = "Linguagens";

    component.openPublishedFilters();

    expect(component.repositoryView).toBe("published");
    expect(component.filterPanelMode).toBe("published");
    expect(component.filters.area).toBe("");
    expect(component.filteredPlans.every((plan) => plan.status === "published"))
      .toBe(true);
  });

  it("should combine published filters without including other repository types", () => {
    component.openPublishedFilters();
    component.publishedFilters.axis = "Mundo digital";
    component.publishedFilters.duration = "50 minutos";
    component.publishedFilters.grade = "Ensino médio";
    component.publishedFilters.activityType = "Digital";
    component.publishedFilters.subject = "Sociologia";
    component.publishedFilters.origin = "manual";

    expect(component.filteredPlans).toHaveLength(1);
    expect(component.filteredPlans[0].title).toBe(
      "Cidadania digital e privacidade",
    );
    expect(component.filteredPlans.every((plan) => plan.status === "published"))
      .toBe(true);
  });

  it("should clear every filter and restore the original published list", () => {
    component.showRepository("favorites");
    component.filters.subject = "Sociologia";
    component.publishedFilters.axis = "Mundo digital";
    component.publishedFilters.grade = "Ensino médio";
    component.search = "privacidade";

    component.clearFilters();

    expect(component.filters).toEqual({
      area: "",
      stage: "",
      axis: "",
      subject: "",
    });
    expect(component.publishedFilters).toEqual({
      stage: "",
      axis: "",
      activityType: "",
      subject: "",
      duration: "",
      grade: "",
      origin: "",
    });
    expect(component.search).toBe("");
    expect(component.repositoryView).toBe("published");
    expect(component.filteredPlans).toHaveLength(component.publishedCount);
  });

  it("should offer the complete curriculum and BNCC axis options", () => {
    expect(component.publishedSubjects).toContain("Língua Portuguesa");
    expect(component.publishedSubjects).toContain("Ciências");
    expect(component.publishedSubjects).toContain("Computação");
    expect(component.publishedAxes).toEqual([
      "Pensamento computacional",
      "Mundo digital",
      "Cultura digital",
    ]);
  });

  it("should search published plans by materials and BNCC skill codes", () => {
    component.openPublishedFilters();
    component.search = "EF06CO01";
    expect(component.filteredPlans.map((plan) => plan.id)).toEqual([1]);

    component.search = "tampinhas";
    expect(component.filteredPlans.map((plan) => plan.id)).toEqual([1]);
  });

  it("should filter plans by subject", () => {
    component.filters.subject = "Matemática";
    expect(component.filteredPlans.length).toBe(1);
    expect(component.filteredPlans[0].subject).toBe("Matemática");
  });

  it("should highlight the filter button in orange only when filters are active", () => {
    const filterButton = fixture.nativeElement.querySelector(".filter-button");
    expect(filterButton.classList.contains("active")).toBe(false);

    component.filters.subject = "Matemática";
    fixture.detectChanges();

    expect(filterButton.classList.contains("active")).toBe(true);
  });

  it("should show liked plans", () => {
    component.showRepository("liked");
    expect(component.filteredPlans.every((plan) => plan.liked)).toBe(true);
  });

  it("should open and close plan details", () => {
    const plan = component.plans[0];

    component.openPlan(plan);
    expect(component.selectedPlan).toBe(plan);

    component.closePlanDetails();
    expect(component.selectedPlan).toBeNull();
  });

  it("should navigate to the new lesson plan form when the add button is clicked", () => {
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, "navigateByUrl");

    component.newPlan();

    expect(navigateSpy).toHaveBeenCalledWith("/plano-aula");
  });

  it("should open the filter drawer and close it when filters are applied", () => {
    component.openFilters();
    expect(component.filtersOpen).toBe(true);

    component.applyFilters();
    expect(component.filtersOpen).toBe(false);
  });
});
