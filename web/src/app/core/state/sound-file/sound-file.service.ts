import { Injectable } from '@angular/core';
import { HttpUpdateConfig, NgEntityService } from '@datorama/akita-ng-entity-service';
import { SoundFileState, SoundFileStore } from './sound-file.store';
import { getEntityType, getIDType } from '@datorama/akita';
import { Observable } from 'rxjs';
import { EventService } from '../../event.service';

@Injectable({providedIn: 'root'})
export class SoundFileService extends NgEntityService<SoundFileState> {

  constructor(protected store: SoundFileStore) {
    super(store);
  }


  update<T>(id: getIDType<SoundFileState>, entity: Partial<getEntityType<SoundFileState>>, config?: HttpUpdateConfig<T>): Observable<T> {
    entity.clientId = EventService.CLIENT_ID;
    return super.update(id, entity, config);
  }
}
