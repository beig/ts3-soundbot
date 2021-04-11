import { Injectable, NgZone } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EventService {

  constructor(private zone: NgZone) {
  }

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

  private getEventSource(): EventSource {
    return new EventSource(environment.events);
  }

}
