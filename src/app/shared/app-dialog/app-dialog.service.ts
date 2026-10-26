import { inject, Injectable } from '@angular/core';
import { ModalController } from '@ionic/angular/lazy';
import { AppDialogComponent, AppDialogOptions } from './app-dialog.component';

@Injectable({ providedIn: 'root' })
export class AppDialogService {
  private readonly modalController = inject(ModalController);

  async show(options: AppDialogOptions): Promise<{ role?: string; data?: Record<string, string> }> {
    const modal = await this.modalController.create({
      component: AppDialogComponent,
      componentProps: options,
      cssClass: 'app-dialog-modal',
      backdropDismiss: true
    });

    await modal.present();
    const { role, data } = await modal.onDidDismiss<Record<string, string>>();
    return { role, data };
  }
}
