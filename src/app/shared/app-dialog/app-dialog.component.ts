import { Component, Input, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ModalController } from '@ionic/angular/lazy';
import { CommonModule } from '@angular/common';

export interface AppDialogButton {
  text: string;
  role: 'cancel' | 'confirm' | 'publish' | 'destructive';
}

export interface AppDialogSelectOption {
  value: string;
  label: string;
}

export interface AppDialogOptions {
  title: string;
  message: string;
  isConfirm?: boolean;
  input?: {
    name: string;
    type: 'email' | 'text';
    placeholder: string;
    value?: string;
  };
  select?: {
    name: string;
    placeholder?: string;
    value?: string;
    options: AppDialogSelectOption[];
  };
  buttons: AppDialogButton[];
  autoClose?: boolean;
}

@Component({
  selector: 'app-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app-dialog.component.html',
  styleUrls: ['./app-dialog.component.scss']
})
export class AppDialogComponent implements OnInit {
  private readonly modalController = inject(ModalController);

  @Input() title = '';
  @Input() message = '';
  @Input() isConfirm = false;
  @Input() input?: AppDialogOptions['input'];
  @Input() select?: AppDialogOptions['select'];
  @Input() buttons: AppDialogButton[] = [];
  @Input() autoClose = false;

  inputValue = '';
  selectedValue = '';

  ngOnInit(): void {
    this.inputValue = this.input?.value ?? '';
    this.selectedValue = this.select?.value ?? '';
  }

  selecionarOpcao(value: string): void {
    this.selectedValue = value;
  }

  fechar(role: AppDialogButton['role']): void {
    let payload: Record<string, string> | undefined;

    if (this.input) {
      payload = { [this.input.name]: this.inputValue };
    } else if (this.select) {
      payload = { [this.select.name]: this.selectedValue };
    }

    void this.modalController.dismiss(payload, role);
  }
}