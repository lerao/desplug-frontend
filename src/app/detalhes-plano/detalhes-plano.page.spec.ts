import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetalhesPlanoPage } from './detalhes-plano.page';

import { RouterModule } from '@angular/router';

describe('DetalhesPlanoPage', () => {
  let component: DetalhesPlanoPage;
  let fixture: ComponentFixture<DetalhesPlanoPage>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterModule.forRoot([])]
    });
    fixture = TestBed.createComponent(DetalhesPlanoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
