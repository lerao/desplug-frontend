import { Component, Input, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ModalController } from '@ionic/angular/lazy';
import { CommonModule } from '@angular/common';

export interface AppDialogButton {
  text: string;
  role: 'cancel' | 'confirm' | 'publish' | 'destructive';
}

export interface AppDialogOptions {
  title: string;
  message: string;
  input?: {
    name: string;
    type: 'email' | 'text';
    placeholder: string;
    value?: string;
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
  @Input() input?: AppDialogOptions['input'];
  @Input() buttons: AppDialogButton[] = [];
  @Input() autoClose = false;

  inputValue = '';

  ngOnInit(): void {
    this.inputValue = this.input?.value ?? '';
  }

  close(role: AppDialogButton['role']): void {
    void this.modalController.dismiss(
      this.input ? { [this.input.name]: this.inputValue } : undefined,
      role
    );
  }
}
