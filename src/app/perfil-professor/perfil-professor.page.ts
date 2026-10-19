import { Component, inject } from "@angular/core";
import { Router } from "@angular/router";
import { addIcons } from "ionicons";
import { AppDialogService } from "../shared/app-dialog/app-dialog.service";
import {
  addOutline,
  bookmark,
  bookmarkOutline,
  chevronDownOutline,
  chevronForwardOutline,
  closeOutline,
  filterOutline,
  heart,
  heartOutline,
  logOutOutline,
  readerOutline,
  searchOutline,
  sparklesOutline,
} from "ionicons/icons";

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
}

interface PlanFilters {
  area: string;
  stage: string;
  axis: string;
  subject: string;
}

interface PublishedPlanFilters {
  stage: string;
  axis: string;
  activityType: string;
  subject: string;
  duration: string;
  grade: string;
  origin: string;
}

type FilterPanelMode = "general" | "published" | "favorites";

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
  readonly repositoryOptions: Array<{
    value: RepositoryView;
    label: string;
  }> = [
    { value: "published", label: "Planos publicados" },
    { value: "drafts", label: "Rascunhos" },
    { value: "ai", label: "Adaptações com IA" },
    { value: "favorites", label: "Planos favoritos" },
    { value: "liked", label: "Planos curtidos" },
  ];
  readonly areas = [
    "Matemática e suas Tecnologias",
    "Ciências Humanas e Sociais Aplicadas",
    "Linguagens",
  ];
  readonly stages = [
    "Anos iniciais do Ensino Fundamental",
    "Anos finais do Ensino Fundamental",
    "Ensino Médio",
  ];
  readonly axes = [
    "Pensamento computacional",
    "Mundo digital",
    "Cultura digital",
  ];
  readonly subjects = [
    "Computação",
    "Língua Portuguesa",
    "Arte",
    "Educação Física",
    "Língua Inglesa",
    "Matemática",
    "Ciências",
    "Geografia",
    "História",
    "Ensino Religioso",
    "Biologia",
    "Física",
    "Química",
    "Filosofia",
    "Sociologia",
  ];
  readonly publishedActivityTypes = ["Desplugada", "Maker", "Digital"];
  readonly publishedOrigins = [
    { value: "manual", label: "Planos manuais" },
    { value: "ai", label: "Gerados/adaptados por IA" },
  ];

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
      stage: "Anos finais do Ensino Fundamental",
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
      stage: "Anos iniciais do Ensino Fundamental",
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
      stage: "Anos iniciais do Ensino Fundamental",
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

  filters: PlanFilters = this.emptyFilters();
  publishedFilters: PublishedPlanFilters = this.emptyPublishedFilters();
  favoriteFilters: PublishedPlanFilters = this.emptyPublishedFilters();
  repositoryView: RepositoryView = "published";
  search = "";
  selectedPlan: LessonPlan | null = null;
  filtersOpen = false;
  filterPanelMode: FilterPanelMode = "general";

  constructor() {
    addIcons({
      addOutline,
      bookmark,
      bookmarkOutline,
      chevronDownOutline,
      chevronForwardOutline,
      closeOutline,
      filterOutline,
      heart,
      heartOutline,
      logOutOutline,
      readerOutline,
      searchOutline,
      sparklesOutline,
    });
  }

  get firstName(): string {
    return this.userName.split(" ")[0];
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
    return this.plans.filter((plan) => plan.status === "published").length;
  }

  get favoriteCount(): number {
    return this.plans.filter((plan) => plan.favorite).length;
  }

  get activeFilterCount(): number {
    return [
      ...Object.values(this.filters),
      ...Object.values(
        this.repositoryView === "favorites"
          ? this.favoriteFilters
          : this.publishedFilters,
      ),
      ...(this.search.trim() ? [this.search] : []),
    ].filter(Boolean).length;
  }

  get contextFilterCount(): number {
    return [
      ...Object.values(
        this.filterPanelMode === "favorites"
          ? this.favoriteFilters
          : this.publishedFilters,
      ),
      ...Object.values(this.filters),
      ...(this.search.trim() ? [this.search] : []),
    ].filter(Boolean).length;
  }

  get contextFilters(): PublishedPlanFilters {
    return this.filterPanelMode === "favorites"
      ? this.favoriteFilters
      : this.publishedFilters;
  }

  get publishedStages(): string[] {
    return this.publishedOptions("stage");
  }

  get publishedAxes(): string[] {
    return this.axes;
  }

  get publishedDurations(): string[] {
    return this.publishedOptions("duration");
  }

  get publishedGrades(): string[] {
    return this.publishedOptions("grade");
  }

  get publishedSubjects(): string[] {
    return this.subjects;
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

      return (
        belongsToView &&
        (!this.filters.area || plan.area === this.filters.area) &&
        (!this.filters.stage || plan.stage === this.filters.stage) &&
        (!this.filters.axis || plan.axis === this.filters.axis) &&
        (!this.filters.subject || plan.subject === this.filters.subject) &&
        (!(this.repositoryView === "published" ||
          this.repositoryView === "favorites") ||
          this.matchesContextFilters(
            plan,
            this.repositoryView === "favorites"
              ? this.favoriteFilters
              : this.publishedFilters,
          )) &&
        (!query ||
          `${plan.title} ${plan.description} ${plan.tags.join(" ")} ${plan.materials?.join(" ") ?? ""} ${plan.bnccSkills?.join(" ") ?? ""} ${plan.curricularComponents.join(" ")}`
            .toLocaleLowerCase("pt-BR")
            .includes(query))
      );
    });
  }

  countByView(view: RepositoryView): number {
    if (view === "published") {
      return this.plans.filter((plan) => plan.status === "published").length;
    }
    if (view === "drafts") {
      return this.plans.filter((plan) => plan.status === "draft").length;
    }
    if (view === "ai") {
      return this.plans.filter((plan) => plan.status === "ai").length;
    }
    if (view === "favorites") {
      return this.favoriteCount;
    }
    return this.plans.filter((plan) => plan.liked).length;
  }

  statusLabel(plan: LessonPlan): string {
    if (plan.status === "draft") return "Rascunho";
    if (plan.status === "ai") return "Adaptado com IA";
    return "Publicado";
  }

  openFilters(): void {
    this.filterPanelMode = "general";
    this.filtersOpen = true;
  }

  openPublishedFilters(): void {
    this.repositoryView = "published";
    this.filters = this.emptyFilters();
    this.filterPanelMode = "published";
    this.filtersOpen = true;
  }

  openFavoriteFilters(): void {
    this.repositoryView = "favorites";
    this.filters = this.emptyFilters();
    this.filterPanelMode = "favorites";
    this.filtersOpen = true;
  }

  openRepositoryFilters(): void {
    if (this.repositoryView === "published") {
      this.openPublishedFilters();
    } else if (this.repositoryView === "favorites") {
      this.openFavoriteFilters();
    } else {
      this.openFilters();
    }
  }

  applyFilters(): void {
    this.filtersOpen = false;
    document
      .querySelector(".library")
      ?.scrollIntoView?.({ behavior: "smooth", block: "start" });
  }

  closeFilters(): void {
    this.filtersOpen = false;
  }

  clearFilters(): void {
    this.filters = this.emptyFilters();
    this.publishedFilters = this.emptyPublishedFilters();
    this.favoriteFilters = this.emptyPublishedFilters();
    this.search = "";
    this.repositoryView =
      this.filterPanelMode === "favorites" ? "favorites" : "published";
  }

  showRepository(view: RepositoryView): void {
    this.repositoryView = view;
    document
      .querySelector(".library")
      ?.scrollIntoView?.({ behavior: "smooth", block: "start" });
  }

  toggleLike(planId: number): void {
    this.plans = this.plans.map((plan) =>
      plan.id === planId ? { ...plan, liked: !plan.liked } : plan,
    );
  }

  toggleFavorite(planId: number): void {
    this.plans = this.plans.map((plan) =>
      plan.id === planId ? { ...plan, favorite: !plan.favorite } : plan,
    );
  }

  newPlan(): void {
    void this.router.navigateByUrl("/plano-aula");
  }

  openPlan(plan: LessonPlan): void {
    if (plan.status === "draft") {
      this.continuePlan(plan);
      return;
    }

    this.selectedPlan = plan;
  }

  closePlanDetails(): void {
    this.selectedPlan = null;
  }

  adaptSelectedPlan(): void {
    if (!this.selectedPlan) return;

    localStorage.setItem(
      "desplugai-selected-plan",
      JSON.stringify(this.selectedPlan),
    );
    this.closePlanDetails();
    void this.router.navigateByUrl("/plano-ia");
  }

  private continuePlan(plan: LessonPlan): void {
    localStorage.setItem("desplugai-selected-plan", JSON.stringify(plan));
    void this.router.navigateByUrl("/plano-ia");
  }

  async registerApplicationReport(): Promise<void> {
    if (!this.selectedPlan) return;

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
    if (result.role !== "confirm" || !relato) return;

    const reports = JSON.parse(
      localStorage.getItem("desplugai-relatos-aplicacao") ?? "[]",
    ) as Array<{ planId: number; relato: string; createdAt: string }>;
    reports.push({
      planId: plan.id,
      relato,
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem("desplugai-relatos-aplicacao", JSON.stringify(reports));
  }

  logout(): void {
    void this.router.navigateByUrl("/visitante");
  }

  private emptyFilters(): PlanFilters {
    return { area: "", stage: "", axis: "", subject: "" };
  }

  private emptyPublishedFilters(): PublishedPlanFilters {
    return {
      stage: "",
      axis: "",
      activityType: "",
      subject: "",
      duration: "",
      grade: "",
      origin: "",
    };
  }

  private publishedOptions(
    field: "stage" | "axis" | "duration" | "grade",
  ): string[] {
    return [
      ...new Set(
        this.plans
          .filter((plan) =>
            this.repositoryView === "favorites"
              ? plan.favorite
              : plan.status === "published",
          )
          .map((plan) => plan[field])
          .filter((value): value is string => Boolean(value)),
      ),
    ];
  }

  private matchesContextFilters(
    plan: LessonPlan,
    filters: PublishedPlanFilters,
  ): boolean {
    return (
      (!filters.stage || plan.stage === filters.stage) &&
      (!filters.axis || plan.axis === filters.axis) &&
      (!filters.activityType || plan.activityType === filters.activityType) &&
      (!filters.subject ||
        plan.curricularComponents.includes(filters.subject)) &&
      (!filters.duration || plan.duration === filters.duration) &&
      (!filters.grade || plan.grade === filters.grade) &&
      (!filters.origin ||
        (filters.origin === "ai" ? plan.generatedByAI : !plan.generatedByAI))
    );
  }
}
