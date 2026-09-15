import { TestBed } from '@angular/core/testing';
import { LessonPlanService } from './lesson-plan';

describe('LessonPlanService', () => {
  let service: LessonPlanService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LessonPlanService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
