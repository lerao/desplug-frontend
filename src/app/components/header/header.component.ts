import { Component, Input } from '@angular/core';

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
  @Input() routerLink: string = '/';
}