
import { Component, inject } from "@angular/core";
import { Router } from "@angular/router";
import { AppDialogService } from "../shared/app-dialog/app-dialog.service";

type PlanStatus = "published" | "draft" | "ai";

type RepositoryView =
  | "published"
  | "drafts"
  | "ai"
  | "favorites"
  | "liked";

interface LessonPlan {
  id: number;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  area: string;
  stage: string;
  axis: string;
  subject: string;
  grade: string;
  duration?: string;
  activityType: "Desplugada" | "Maker" | "Digital";
  curricularComponents: string[];
  generatedByAI: boolean;
  materials?: string[];
  bnccSkills?: string[];
  applicationCount?: number;
  tags: string[];
  likes: number;
  favorite: boolean;
  liked: boolean;
  updatedAt: string;
  status: PlanStatus;
  originalPlan?: string;
  originalAuthor?: string;
  quantidadeFavoritos?: number;
  quantidadeAdaptacoes?: number;
}

@Component({
  selector: "app-perfil-professor",
  templateUrl: "./perfil-professor.page.html",
  styleUrls: ["./perfil-professor.page.scss"],
  standalone: false,
})
export class PerfilProfessorPage {
  private readonly router = inject(Router);
  private readonly dialog = inject(AppDialogService);

  readonly userName = "Ana Souza";
  readonly teacherApproved = true;

  plans: LessonPlan[] = [
    {
      id: 1,
      title: "Missão Algoritmo: caminhos sem telas",
      description:
        "Sequências lógicas com papelão, tampinhas e cartões para aprender programação de forma concreta.",
      image:
        "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=900&q=85",
      imageAlt: "Professora conduzindo uma atividade em sala de aula",
      area: "Matemática e suas Tecnologias",
      stage: "Anos Finais (Ensino Fundamental)",
      axis: "Pensamento computacional",
      subject: "Matemática",
      grade: "6º ano",
      duration: "45 minutos",
      activityType: "Desplugada",
      curricularComponents: ["Computação", "Matemática"],
      generatedByAI: false,
      materials: ["papelão", "tampinhas", "cartões"],
      bnccSkills: ["EF06CO01"],
      tags: ["Desplugada", "Pensamento computacional"],
      likes: 87,
      favorite: false,
      liked: true,
      updatedAt: "Atualizado hoje",
      status: "published",
    },
    {
      id: 2,
      title: "Cidadania digital e privacidade",
      description:
        "Debate guiado sobre pegada digital, privacidade online e uso responsável das redes sociais.",
      image:
        "https://images.unsplash.com/photo-1758270705172-07b53627dfcb?auto=format&fit=crop&w=900&q=85",
      imageAlt: "Estudantes reunidos em torno de um computador",
      area: "Ciências Humanas e Sociais Aplicadas",
      stage: "Ensino Médio",
      axis: "Mundo digital",
      subject: "Sociologia",
      grade: "Ensino médio",
      duration: "50 minutos",
      activityType: "Digital",
      curricularComponents: ["Computação", "Sociologia"],
      generatedByAI: false,
      materials: ["computador", "internet"],
      bnccSkills: ["EM13CHS106"],
      applicationCount: 7,
      tags: ["Digital", "Mundo digital"],
      likes: 95,
      favorite: true,
      liked: true,
      updatedAt: "Há 3 dias",
      status: "published",
    },
    {
      id: 3,
      title: "Mapa de soluções colaborativas",
      description:
        "Uma prática em grupo para decompor desafios reais e construir soluções criativas passo a passo.",
      image:
        "https://images.unsplash.com/photo-1786926274316-981cac2a2662?auto=format&fit=crop&w=900&q=85",
      imageAlt: "Crianças desenhando juntas em uma atividade escolar",
      area: "Linguagens",
      stage: "Anos Iniciais (Ensino Fundamental)",
      axis: "Pensamento computacional",
      subject: "Arte",
      grade: "Anos iniciais",
      duration: "45 minutos",
      activityType: "Maker",
      curricularComponents: ["Computação", "Arte"],
      generatedByAI: true,
      tags: ["Colaboração", "Criatividade"],
      likes: 42,
      favorite: true,
      liked: false,
      updatedAt: "Há 1 semana",
      status: "ai",
      originalPlan: "Soluções para o bairro",
      originalAuthor: "Prof. Carlos Mendes",
    },
    {
      id: 4,
      title: "Circuito de comandos no pátio",
      description:
        "Rascunho de uma dinâmica corporal para trabalhar comandos, sequências e depuração.",
      image:
        "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=900&q=85",
      imageAlt: "Estudantes em uma sala de aula",
      area: "Matemática e suas Tecnologias",
      stage: "Anos Iniciais (Ensino Fundamental)",
      axis: "Pensamento computacional",
      subject: "Matemática",
      grade: "4º ano",
      activityType: "Desplugada",
      curricularComponents: ["Computação", "Matemática"],
      generatedByAI: false,
      tags: ["Movimento", "Algoritmos"],
      likes: 0,
      favorite: false,
      liked: false,
      updatedAt: "Editado ontem",
      status: "draft",
    },
  ];

  repositoryView: RepositoryView = "published";
  search = "";
  selectedPlan: LessonPlan | null = null;
  isFilterOpen = false;
  headerCompact = false;

  get firstName(): string {
    return this.userName.split(" ")[0];
  }

  onContentScroll(event: CustomEvent<{ scrollTop: number }>): void {
    this.headerCompact = event.detail.scrollTop > 48;
  }

  get initials(): string {
    return this.userName
      .split(" ")
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase();
  }

  get publishedCount(): number {
    return this.plans.filter(
      (plan) => plan.status === "published",
    ).length;
  }

  get favoriteCount(): number {
    return this.plans.filter((plan) => plan.favorite).length;
  }

  get canDeletePlans(): boolean {
    return (
      this.repositoryView !== "favorites" &&
      this.repositoryView !== "liked"
    );
  }

  get repositoryTitle(): string {
    const titles: Record<RepositoryView, string> = {
      published: "Meus Planos Publicados",
      drafts: "Meus Rascunhos",
      ai: "Minhas Adaptações com IA",
      favorites: "Meus Planos Favoritos",
      liked: "Meus Planos Curtidos",
    };

    return titles[this.repositoryView];
  }

  get filteredPlans(): LessonPlan[] {
    const query = this.search.trim().toLocaleLowerCase("pt-BR");

    return this.plans.filter((plan) => {
      const belongsToView =
        this.repositoryView === "published"
          ? plan.status === "published"
          : this.repositoryView === "drafts"
            ? plan.status === "draft"
            : this.repositoryView === "ai"
              ? plan.status === "ai"
              : this.repositoryView === "favorites"
                ? plan.favorite
                : plan.liked;

      const searchableText = [
        plan.title,
        plan.description,
        plan.tags.join(" "),
        plan.materials?.join(" ") ?? "",
        plan.bnccSkills?.join(" ") ?? "",
        plan.curricularComponents.join(" "),
      ]
        .join(" ")
        .toLocaleLowerCase("pt-BR");

      return (
        belongsToView &&
        (!query || searchableText.includes(query))
      );
    });
  }

  countByView(view: RepositoryView): number {
    if (view === "published") {
      return this.plans.filter(
        (plan) => plan.status === "published",
      ).length;
    }

    if (view === "drafts") {
      return this.plans.filter(
        (plan) => plan.status === "draft",
      ).length;
    }

    if (view === "ai") {
      return this.plans.filter(
        (plan) => plan.status === "ai",
      ).length;
    }

    if (view === "favorites") {
      return this.favoriteCount;
    }

    return this.plans.filter((plan) => plan.liked).length;
  }

  statusLabel(plan: LessonPlan): string {
    if (plan.status === "draft") {
      return "Rascunho";
    }

    if (plan.status === "ai") {
      return "Adaptado com IA";
    }

    return "Publicado";
  }

  openFilters(): void {
    this.isFilterOpen = true;
  }

  openRepositoryFilters(): void {
    this.openFilters();
  }

  applyFilters(): void {
    this.isFilterOpen = false;

    document
      .querySelector(".library")
      ?.scrollIntoView?.({
        behavior: "smooth",
        block: "start",
      });
  }

  closeFilters(): void {
    this.isFilterOpen = false;
  }

  clearFilters(): void {
    this.search = "";
  }

  showRepository(view: RepositoryView): void {
    this.repositoryView = view;

    document
      .querySelector(".library")
      ?.scrollIntoView?.({
        behavior: "smooth",
        block: "start",
      });
  }

  toggleLike(planId: number): void {
    this.plans = this.plans.map((plan) =>
      plan.id === planId
        ? { ...plan, liked: !plan.liked }
        : plan,
    );
  }

  toggleFavorite(planId: number): void {
    this.plans = this.plans.map((plan) =>
      plan.id === planId
        ? { ...plan, favorite: !plan.favorite }
        : plan,
    );
  }

  async deletePlan(planId: number): Promise<void> {
    if (!this.canDeletePlans) {
      return;
    }

    const plan = this.plans.find((item) => item.id === planId);

    if (!plan) {
      return;
    }

    const result = await this.dialog.show({
      title: "Excluir plano?",
      message: `“${plan.title}” será removido dos seus planos. Esta ação não pode ser desfeita.`,
      buttons: [
        { text: "Cancelar", role: "cancel" },
        { text: "Excluir", role: "confirm" },
      ],
    });

    if (result.role !== "confirm") {
      return;
    }

    this.plans = this.plans.filter(
      (item) => item.id !== planId,
    );

    if (this.selectedPlan?.id === planId) {
      this.closePlanDetails();
    }
  }

  newPlan(): void {
    void this.router.navigateByUrl("/plano-aula");
  }

  openPlan(plan: LessonPlan): void {
    if (plan.status === "draft") {
      this.continuePlan(plan);
      return;
    }

    void this.router.navigateByUrl(
      `/detalhes-plano/${plan.id}`,
    );
  }

  closePlanDetails(): void {
    this.selectedPlan = null;
  }

  adaptSelectedPlan(): void {
    if (!this.selectedPlan) {
      return;
    }

    localStorage.setItem(
      "desplugai-selected-plan",
      JSON.stringify(this.selectedPlan),
    );

    this.closePlanDetails();

    void this.router.navigateByUrl("/plano-ia");
  }

  private continuePlan(plan: LessonPlan): void {
    localStorage.setItem(
      "desplugai-selected-plan",
      JSON.stringify(plan),
    );

    void this.router.navigateByUrl("/plano-ia");
  }

  async registerApplicationReport(): Promise<void> {
    if (!this.selectedPlan) {
      return;
    }

    const plan = this.selectedPlan;

    const result = await this.dialog.show({
      title: "Registrar relato de aplicação",
      message: `Conte como foi aplicar “${plan.title}” em sua turma.`,
      input: {
        name: "relato",
        type: "text",
        placeholder: "Escreva seu relato",
      },
      buttons: [
        { text: "Cancelar", role: "cancel" },
        { text: "Salvar relato", role: "confirm" },
      ],
    });

    const relato = result.data?.["relato"]?.trim();

    if (result.role !== "confirm" || !relato) {
      return;
    }

    const reports = JSON.parse(
      localStorage.getItem("desplugai-relatos-aplicacao") ?? "[]",
    ) as Array<{
      planId: number;
      relato: string;
      createdAt: string;
    }>;

    reports.push({
      planId: plan.id,
      relato,
      createdAt: new Date().toISOString(),
    });

    localStorage.setItem(
      "desplugai-relatos-aplicacao",
      JSON.stringify(reports),
    );
  }
}
