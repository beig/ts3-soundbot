import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Health} from './data/health';
import {Observable, of} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {SoundFile} from './data/sound-file';
import {Channel} from './data/channel';
import {environment} from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CoreService {

  private url = environment.url;

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

  async toggleConnection(value: boolean): Promise<void> {
    if (value) {
      await this.http.get(`${this.url}/ts3/connect`).toPromise();
    } else {
      await this.http.get(`${this.url}/ts3/disconnect`).toPromise();
    }
  }

  channels(): Observable<Channel[]> {
    return this.http.get<Channel[]>(`${this.url}/ts3/channels`);
  }

  currentChannel(): Observable<Channel> {
    return this.http.get<Channel>(`${this.url}/ts3/channel`);
  }

  async joinChannel(channel: Channel): Promise<void> {
    await this.http.get<Channel>(`${this.url}/ts3/channel/${channel.id}/join`).toPromise();
  }

}
