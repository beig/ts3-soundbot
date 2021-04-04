import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Health} from './data/health';
import {Observable, of} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {SoundFile} from './data/sound-file';

@Injectable({
  providedIn: 'root'
})
export class CoreService {

  private url = 'http://localhost:32600/api';

  constructor(private http: HttpClient) {
  }

  status(): Observable<Health> {
    return this.http.get<Health>(`${this.url}/status`).pipe(catchError(() => {
      const health: Health = {
        status: 'Offline',
        files: 0,
        online: false
      };
      return of(health);
    }));
  }

  getFiles(): Observable<SoundFile[]> {
    return this.http.get<SoundFile[]>(`${this.url}/files`);
  }

  playFile(file: SoundFile): Observable<any> {
    return this.http.get(`${this.url}/files/${file.fileName}/play`);
  }
}
