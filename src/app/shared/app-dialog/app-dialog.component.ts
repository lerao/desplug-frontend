import { Component, Input, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ModalController } from '@ionic/angular/lazy';

export interface AppDialogButton {
  text: string;
  role: 'cancel' | 'confirm' | 'publish';
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
}

@Component({
  selector: 'app-dialog',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './app-dialog.component.html',
  styleUrls: ['./app-dialog.component.scss']
})
export class AppDialogComponent implements OnInit {
  private readonly modalController = inject(ModalController);

  @Input() title = '';
  @Input() message = '';
  @Input() input?: AppDialogOptions['input'];
  @Input() buttons: AppDialogButton[] = [];

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
