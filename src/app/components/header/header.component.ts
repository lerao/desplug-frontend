
import { Component, Input } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: false,
})
export class HeaderComponent {
  @Input() title: string = '';
  @Input() backButtonText: string = 'Voltar';
  @Input() iconName: string = 'arrow-back-outline';
  @Input() routerLink: string | null = null;

  constructor( private navCtrl: NavController, private router: Router) {}

  voltar(): void {
    if (this.routerLink) {
      this.router.navigateByUrl(this.routerLink);
    } else {
      this.navCtrl.back();
    }
  }
}
