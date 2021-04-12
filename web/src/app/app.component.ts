import { Component, Injector } from '@angular/core';
import { EventService } from './core/event.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'web';

  constructor(private injector: Injector) {
    this.injector.get(EventService);
  }
}
