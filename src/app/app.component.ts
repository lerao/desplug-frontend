import { Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
  encapsulation: ViewEncapsulation.None,
})
export class AppComponent {

  constructor() {}
}