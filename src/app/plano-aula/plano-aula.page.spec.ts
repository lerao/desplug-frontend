import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { IonicModule } from '@ionic/angular/lazy';
import { ComponentsModule } from '../components/components.module';
import { PlanoAulaPage } from './plano-aula.page';

describe('PlanoAulaPage', () => {
  let component: PlanoAulaPage;
  let fixture: ComponentFixture<PlanoAulaPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PlanoAulaPage],
      imports: [
        ComponentsModule,
        FormsModule,
        IonicModule.forRoot(),
        ReactiveFormsModule,
        RouterTestingModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PlanoAulaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
