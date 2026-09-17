import { Component, OnInit } from '@angular/core';
import { LessonPlanService } from '../services/lesson-plan';
import { LessonPlan } from '../models/lesson-plan.model';

@Component({
  selector: 'app-visitante',
  templateUrl: './visitante.page.html',
  styleUrls: ['./visitante.page.scss'],
  standalone: false, 
})
export class VisitantePage implements OnInit {
  lessonPlans: LessonPlan[] = [];
  searchTerm: string = '';

  customPopoverOptions = {
  header: 'Ordenar por',
  alignment: 'center',
  cssClass: 'custom-sort-popover'
};

  constructor(public lessonPlanService: LessonPlanService) {}

  ngOnInit() {
    this.fetchPublishedPlans();
  }

  fetchPublishedPlans() {
    this.lessonPlanService.getPublicPlans().subscribe({
      next: (plans: LessonPlan[]) => {
        this.lessonPlans = plans;
      },
      error: (err: any) => {
        console.error('Erro ao buscar planos publicados:', err);
      }
    });
  }

  isFilterOpen = false;

  openFilters() {
    this.isFilterOpen = true;
  }

  closeFilters() {
    this.isFilterOpen = false;
  }

  applyFilters() {
    this.isFilterOpen = false;
  }
}