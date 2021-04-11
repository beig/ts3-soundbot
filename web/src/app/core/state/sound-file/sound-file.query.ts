import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { SoundFileStore, SoundFileState } from './sound-file.store';

@Injectable({ providedIn: 'root' })
export class SoundFileQuery extends QueryEntity<SoundFileState> {

  constructor(protected store: SoundFileStore) {
    super(store);
  }

}
