import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CadastroPage } from './cadastro.page';
import { AppDialogService } from '../shared/app-dialog/app-dialog.service';

describe('CadastroPage', () => {
  let component: CadastroPage;
  let fixture: ComponentFixture<CadastroPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        { provide: AppDialogService, useValue: { show: async () => ({}) } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CadastroPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
