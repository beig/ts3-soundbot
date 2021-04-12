import { Injectable, NgZone } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { SoundFile } from './state/sound-file/sound-file.model';
import { SoundFileStore } from './state/sound-file/sound-file.store';
import { EventData } from '../data/event-data';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class EventService {

  public static CLIENT_ID = uuidv4();

  constructor(private zone: NgZone, private soundStore: SoundFileStore) {
    this.events.subscribe(value => {
      const eventData: EventData = JSON.parse(value.data);
      const update: SoundFile = eventData.payload;
      if (eventData.clientId) {
        if (eventData.clientId && eventData.clientId !== EventService.CLIENT_ID) {
          this.soundStore.update(update.name, update);
        }
      } else {
        this.soundStore.update(update.name, update);
      }

    });
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
