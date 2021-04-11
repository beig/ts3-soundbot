import { Injectable } from '@angular/core';
import { EntityState, EntityStore, getEntityType, StoreConfig } from '@datorama/akita';
import { SoundFile } from './sound-file.model';

export interface SoundFileState extends EntityState<SoundFile> {
}

@Injectable({providedIn: 'root'})
@StoreConfig({name: 'files', idKey: 'name'})
export class SoundFileStore extends EntityStore<SoundFileState> {

  constructor() {
    super();
  }

  akitaPreAddEntity(newEntity: SoundFile): getEntityType<SoundFileState> {
    if (!newEntity.tags) {
      newEntity.tags = [];
    }
    return super.akitaPreAddEntity(newEntity);
  }

  akitaPreUpdateEntity(_: Readonly<getEntityType<SoundFileState>>, nextEntity: any): getEntityType<SoundFileState> {
    return super.akitaPreUpdateEntity(_, nextEntity);
  }
}
