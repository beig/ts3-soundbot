import { Injectable } from '@angular/core';
import { NgEntityService } from '@datorama/akita-ng-entity-service';
import { SoundFileStore, SoundFileState } from './sound-file.store';

@Injectable({ providedIn: 'root' })
export class SoundFileService extends NgEntityService<SoundFileState> {

  constructor(protected store: SoundFileStore) {
    super(store);
  }

}
