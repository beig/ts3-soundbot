import { Component, Injector } from '@angular/core';
import { EventService } from './core/event.service';
import { SoundFileService } from './core/state/sound-file/sound-file.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'web';

  constructor(private injector: Injector) {
    this.injector.get(EventService);
    this.injector.get(SoundFileService);
  }
}
