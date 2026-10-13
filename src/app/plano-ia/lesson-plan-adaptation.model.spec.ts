import { describe, expect, it } from "vitest";
import {
  createDefaultLessonPlan,
  normalizeLessonPlan,
  teachingStageForGrade,
} from "./lesson-plan-adaptation.model";

describe("lesson plan adaptation model", () => {
  it("creates a complete plan with BNCC skill, evaluation and source lineage", () => {
    const plan = createDefaultLessonPlan();

    expect(plan.skillCodes.length).toBeGreaterThan(0);
    expect(plan.objective).toBeTruthy();
    expect(plan.materials.length).toBeGreaterThan(0);
    expect(plan.steps.length).toBeGreaterThan(0);
    expect(plan.assessment).toContain("Rubrica formativa");
    expect(plan.generatedByAI).toBe(true);
    expect(plan.isDerived).toBe(true);
    expect(plan.origin.title).toBeTruthy();
  });

  it("migrates plans saved with the previous single-skill format", () => {
    const plan = normalizeLessonPlan({
      title: "Plano anterior",
      grade: "8º ano",
      skillCode: "EF08CO04",
      activityType: "Atividade colaborativa",
    });

    expect(plan.title).toBe("Plano anterior");
    expect(plan.skillCodes).toEqual(["EF08CO04"]);
    expect(plan.teachingStage).toBe("Ensino Fundamental — Anos Finais");
    expect(plan.activityType).toBe("Atividade colaborativa");
    expect(plan.status).toBe("RASCUNHO");
    expect(plan.steps.length).toBeGreaterThan(0);
  });

  it("maps school years to the documented education stages", () => {
    expect(teachingStageForGrade("2º ano")).toBe(
      "Ensino Fundamental — Anos Iniciais",
    );
    expect(teachingStageForGrade("7º ano")).toBe(
      "Ensino Fundamental — Anos Finais",
    );
    expect(teachingStageForGrade("Ensino médio")).toBe("Ensino Médio");
  });
});
