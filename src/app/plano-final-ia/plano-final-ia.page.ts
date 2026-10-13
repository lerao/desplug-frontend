import { Component, OnInit, inject } from "@angular/core";
import { Router } from "@angular/router";
import { addIcons } from "ionicons";
import {
  BnccSkill,
  createDefaultLessonPlan,
  LessonPlan,
  normalizeLessonPlan,
} from "../plano-ia/lesson-plan-adaptation.model";
import {
  arrowBackOutline,
  checkmarkOutline,
  documentTextOutline,
  downloadOutline,
  printOutline,
} from "ionicons/icons";

@Component({
  selector: "app-plano-final-ia",
  templateUrl: "./plano-final-ia.page.html",
  styleUrls: ["./plano-final-ia.page.scss"],
  standalone: false,
})
export class PlanoFinalIaPage implements OnInit {
  private readonly router = inject(Router);

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

  downloaded = false;
  plan: LessonPlan = createDefaultLessonPlan();

  constructor() {
    addIcons({
      arrowBackOutline,
      checkmarkOutline,
      documentTextOutline,
      downloadOutline,
      printOutline,
    });
  }

  ngOnInit(): void {
    const savedPlan = localStorage.getItem("desplugai-plan");
    if (savedPlan) {
      try {
        this.plan = normalizeLessonPlan(JSON.parse(savedPlan) as unknown);
      } catch (error) {
        console.error("Não foi possível carregar o plano salvo.", error);
        localStorage.removeItem("desplugai-plan");
      }
    }
  }

  get selectedSkills(): BnccSkill[] {
    return this.plan.skillCodes
      .map((code) => this.skills.find((skill) => skill.code === code))
      .filter((skill): skill is BnccSkill => skill !== undefined);
  }

  get statusLabel(): string {
    switch (this.plan.status) {
      case "PENDENTE_MODERACAO":
        return "Enviado para análise";
      case "PUBLICADO":
        return "Publicado";
      case "ARQUIVADO":
        return "Arquivado";
      default:
        return "Rascunho";
    }
  }

  backToStudio(): void {
    void this.router.navigateByUrl("/plano-ia");
  }

  printPlan(): void {
    window.print();
  }

  downloadPlan(): void {
    const plan = this.plan;
    const skills = this.selectedSkills
      .map(
        (skill) =>
          `<p><strong>${this.escapeHtml(skill.code)} — ${this.escapeHtml(skill.title)}.</strong> ${this.escapeHtml(skill.description)}</p>`,
      )
      .join("");
    const materials = plan.materials
      .map((material) => `<li>${this.escapeHtml(material)}</li>`)
      .join("");
    const components = plan.curricularComponents
      .map((component) => this.escapeHtml(component))
      .join(", ");
    const steps = plan.steps
      .map(
        (step, index) => `
          <div class="step">
            <p><strong>${index + 1}. ${this.escapeHtml(step.title)} (${this.escapeHtml(step.time)})</strong></p>
            <p>${this.escapeHtml(step.text)}</p>
          </div>`,
      )
      .join("");

    const documentHtml = `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <title>Plano de aula - DesplugAI</title>
  <style>
    @page {
      size: A4;
      margin-top: 3cm;
      margin-right: 2cm;
      margin-bottom: 2cm;
      margin-left: 3cm;
    }
    body {
      margin: 0;
      font-family: Arial, sans-serif;
      font-size: 12pt;
      line-height: 1.5;
      color: #000;
    }
    .wordmark {
      margin-bottom: 36pt;
      text-align: center;
      font-family: Arial, sans-serif;
      font-size: 18pt;
      font-weight: bold;
    }
    .desplug { color: #0f5d63; }
    .ai { color: #ff8a00; }
    h1 {
      margin-bottom: 36pt;
      text-align: center;
      text-transform: uppercase;
      font-size: 14pt;
    }
    h2 {
      margin-top: 24pt;
      margin-bottom: 6pt;
      text-transform: uppercase;
      font-size: 12pt;
    }
    p {
      margin: 0 0 6pt;
      text-align: justify;
      text-indent: 1.25cm;
    }
    .metadata p,
    .step p,
    .reference p {
      text-indent: 0;
    }
    .step { margin-bottom: 9pt; }
  </style>
</head>
<body>
  <div class="wordmark">
    <span class="desplug">desplug</span><span class="ai">AI</span>
  </div>
  <h1>Plano de aula adaptado</h1>
  <div class="metadata">
    <p><strong>Título:</strong> ${this.escapeHtml(plan.title)}</p>
    <p><strong>Etapa de ensino:</strong> ${this.escapeHtml(plan.teachingStage)}</p>
    <p><strong>Anos indicados:</strong> ${this.escapeHtml(plan.grade)}</p>
    <p><strong>Duração estimada:</strong> ${this.escapeHtml(plan.duration)}</p>
    <p><strong>Tipo de atividade:</strong> ${this.escapeHtml(plan.activityType)}</p>
    <p><strong>Componentes curriculares:</strong> ${components}</p>
  </div>
  <h2>1 Apresentação</h2>
  <p>${this.escapeHtml(plan.summary)}</p>
  <h2>2 Habilidades BNCC</h2>
  ${skills}
  <h2>3 Justificativa</h2>
  <p>${this.escapeHtml(plan.reason)}</p>
  <h2>4 Objetivo de aprendizagem</h2>
  <p>${this.escapeHtml(plan.objective)}</p>
  <h2>5 Materiais necessários</h2>
  <ul>${materials}</ul>
  <h2>6 Metodologia e passo a passo</h2>
  ${steps}
  <h2>7 Critérios de avaliação</h2>
  <p>${this.escapeHtml(plan.assessment)}</p>
  <h2>8 Linhagem do plano</h2>
  <div class="reference">
    <p>Adaptado com DesplugAI a partir do plano <strong>${this.escapeHtml(plan.origin.title)}</strong>, de ${this.escapeHtml(plan.origin.author)}. O plano original permanece preservado.</p>
  </div>
</body>
</html>`;

    const blob = new Blob(["\ufeff", documentHtml], {
      type: "application/msword;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "plano-de-aula-desplugai.doc";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    this.downloaded = true;
  }

  private escapeHtml(value: string): string {
    const element = document.createElement("div");
    element.textContent = value;
    return element.innerHTML;
  }
}
