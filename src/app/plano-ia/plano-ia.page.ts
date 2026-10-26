import { Component, OnInit, inject } from "@angular/core";
import { Router } from "@angular/router";
import { addIcons } from "ionicons";
import { AppDialogService } from "../shared/app-dialog/app-dialog.service";
import {
  BnccSkill,
  createDefaultLessonPlan,
  LessonPlan,
  normalizeLessonPlan,
  teachingStageForGrade,
} from "./lesson-plan-adaptation.model";
import {
  arrowBackOutline,
  checkmarkOutline,
  createOutline,
  saveOutline,
} from "ionicons/icons";

interface EditContext {
  title: string;
  excerpt: string;
}

@Component({
  selector: "app-plano-ia",
  templateUrl: "./plano-ia.page.html",
  styleUrls: ["./plano-ia.page.scss"],
  standalone: false,
})
export class PlanoIaPage implements OnInit {
  private readonly router = inject(Router);
  private readonly dialog = inject(AppDialogService);

  readonly grades = [
    "1º ano",
    "2º ano",
    "3º ano",
    "4º ano",
    "5º ano",
    "6º ano",
    "7º ano",
    "8º ano",
    "9º ano",
    "Ensino médio",
  ];

  readonly durations = [
    "30 minutos",
    "45 minutos",
    "50 minutos",
    "60 minutos",
    "90 minutos",
    "2 aulas",
  ];

  readonly activityTypes = [
    "Atividade desplugada",
    "Atividade maker",
    "Atividade digital",
    "Atividade híbrida",
    "Atividade colaborativa",
    "Atividade individual",
    "Dinâmica em duplas",
    "Rotação por estações",
    "Projeto prático",
    "Roda de conversa",
  ];

  readonly skills: BnccSkill[] = [
    {
      code: "EF06CO01",
      title: "Classificar informações em coleções",
      description:
        "Resolver problemas por meio da decomposição e da construção de sequências lógicas de instruções.",
    },
    {
      code: "EF06CO02",
      title: "Elaborar algoritmos com instruções",
      description:
        "Criar e testar sequências de passos para solucionar problemas individualmente e em colaboração.",
    },
    {
      code: "EF06CO03",
      title: "Descrever soluções com precisão",
      description:
        "Representar soluções por meio de sequências, fluxos e instruções claras.",
    },
    {
      code: "EF07CO01",
      title: "Criar estratégias para problemas",
      description:
        "Elaborar estratégias usando decomposição, padrões e sequências lógicas.",
    },
    {
      code: "EF07CO02",
      title: "Testar e aperfeiçoar algoritmos",
      description:
        "Executar e revisar algoritmos, identificando erros e propondo melhorias.",
    },
    {
      code: "EF07CO03",
      title: "Construir soluções por decomposição",
      description:
        "Dividir problemas complexos em partes menores e reconhecer relações.",
    },
    {
      code: "EF08CO04",
      title: "Analisar estratégias de solução",
      description:
        "Comparar algoritmos e avaliar clareza, eficiência e capacidade de resolução.",
    },
    {
      code: "EF09CO01",
      title: "Avaliar soluções computacionais",
      description:
        "Analisar soluções considerando correção, clareza e possibilidades de aprimoramento.",
    },
  ];

  plan: LessonPlan = createDefaultLessonPlan();

  constructor() {
    addIcons({
      arrowBackOutline,
      checkmarkOutline,
      createOutline,
      saveOutline,
    });
  }

  ngOnInit(): void {
    const savedPlan = localStorage.getItem("desplugai-plan");
    if (!savedPlan) return;

    try {
      this.plan = normalizeLessonPlan(JSON.parse(savedPlan) as unknown);
    } catch (error) {
      console.error("Não foi possível carregar o plano salvo.", error);
      localStorage.removeItem("desplugai-plan");
    }
  }

  get selectedSkill(): BnccSkill {
    return (
      this.skills.find((skill) => skill.code === this.plan.skillCodes[0]) ??
      this.skills[0]
    );
  }

  get selectedSkillCode(): string {
    return this.selectedSkill.code;
  }

  set selectedSkillCode(code: string) {
    this.plan.skillCodes = [code];
  }

  get materialsText(): string {
    return this.plan.materials.join("\n");
  }

  set materialsText(value: string) {
    this.plan.materials = value
      .split(/[\n,;]/)
      .map((material) => material.trim())
      .filter(Boolean);
  }

  get availableMaterialsText(): string {
    return this.plan.availableMaterials.join("\n");
  }

  set availableMaterialsText(value: string) {
    this.plan.availableMaterials = value
      .split(/[\n,;]/)
      .map((material) => material.trim())
      .filter(Boolean);
  }

  get curricularComponentsText(): string {
    return this.plan.curricularComponents.join(", ");
  }

  set curricularComponentsText(value: string) {
    this.plan.curricularComponents = value
      .split(",")
      .map((component) => component.trim())
      .filter(Boolean);
  }

  updateTeachingStage(): void {
    this.plan.teachingStage = teachingStageForGrade(this.plan.grade);
    this.persistPlan();
  }

  persistPlan(): void {
    localStorage.setItem("desplugai-plan", JSON.stringify(this.plan));
  }

  backToChat(): void {
    this.persistPlan();
    void this.router.navigateByUrl("/chat-ia");
  }

  editWithAi(title: string, excerpt: string): void {
    const context: EditContext = { title, excerpt };
    this.persistPlan();
    localStorage.setItem(
      "desplugai-edit-context",
      JSON.stringify(context),
    );
    void this.router.navigateByUrl("/chat-ia");
  }

  async savePlan(): Promise<void> {
    if (this.plan.skillCodes.length === 0) {
      await this.dialog.show({
        title: "Habilidade BNCC obrigatória",
        message: "Associe pelo menos uma habilidade ou competência BNCC antes de salvar o plano.",
        buttons: [{ text: "Entendi", role: "confirm" }],
      });
      return;
    }

    this.persistPlan();
    const result = await this.dialog.show({
      title: "Salvar e publicar",
      message: "Deseja salvar e publicar o plano de aula no app?",
      buttons: [
        { text: "Cancelar", role: "cancel" },
        { text: "Publicar", role: "publish" },
      ]
    });

    if (result.role === "publish") {
      this.plan.status = "PUBLICADO";
      this.persistPlan();
      localStorage.setItem("desplugai-plan-published", "true");
      await this.router.navigateByUrl("/plano-final-ia");
    }
  }
}
