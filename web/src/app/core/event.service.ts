import {Injectable, NgZone} from '@angular/core';
import {environment} from '../../environments/environment';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EventService {

  get events(): Observable<MessageEvent> {
    return new Observable(observer => {
      const eventSource = this.getEventSource();

      eventSource.onmessage = (event: MessageEvent) => {
        this.zone.run(() => {
          observer.next(event);
        });
      };
    });
  }

  constructor(private zone: NgZone) {
  }

  private getEventSource(): EventSource {
    return new EventSource(environment.events);
  }

}
