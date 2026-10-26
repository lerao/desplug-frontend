import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it } from 'vitest';
import { ChatIaPage } from './chat-ia.page';

describe('ChatIaPage', () => {
  let component: ChatIaPage;
  let fixture: ComponentFixture<ChatIaPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(ChatIaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
