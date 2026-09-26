import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlanoAulaPage } from './plano-aula.page';

describe('PlanoAulaPage', () => {
  let component: PlanoAulaPage;
  let fixture: ComponentFixture<PlanoAulaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PlanoAulaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
