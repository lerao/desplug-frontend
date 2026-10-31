import { inject, Injectable } from '@angular/core';
import { ModalController } from '@ionic/angular/lazy';
import { AppDialogComponent, AppDialogOptions } from './app-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class AppDialogService {
  private readonly modalController = inject(ModalController);

  // Confirmação de ações (ex.: botão de excluir)
  async confirm(options: AppDialogOptions): Promise<{
    role?: string;
    data?: Record<string, string>;
  }> {
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

  // Alerta - sem botões (ex.: plano excluído com sucesso)
  async alert(message: string, title = 'Aviso'): Promise<void> {
    const modal = await this.modalController.create({
      component: AppDialogComponent,
      componentProps: {
        title,
        message,
        buttons: [],
        autoClose: true
      },
      cssClass: 'app-dialog-modal',
      backdropDismiss: false
    });

    await modal.present();

    setTimeout(() => {
      void modal.dismiss();
    }, 500);
  }
}