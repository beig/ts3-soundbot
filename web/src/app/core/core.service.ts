import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Health, Status } from '../data/health';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, distinctUntilChanged, filter, map, take } from 'rxjs/operators';
import { Channel } from '../data/channel';
import { environment } from '../../environments/environment';
import { SoundFile } from './state/sound-file/sound-file.model';

@Injectable({
  providedIn: 'root'
})
export class CoreService {

  private url = environment.url;

  constructor(private http: HttpClient) {
    this.observeStatus();
    this._health.pipe(distinctUntilChanged((x, y) => x.status === y.status),
      filter(value => value.status === Status.ONLINE)).subscribe(() => {
      // this.getFiles().pipe(map(value => {
      //   let idCount = 0;
      //   value.forEach(soundFile => soundFile.id = ++idCount);
      //   return value;
      // }), take(1)).subscribe(value => this._soundFiles$.next(value));
    });
  }

  private _health = new BehaviorSubject<Health>({online: false, status: Status.OFFLINE, files: 0});

  get health(): Observable<Health> {
    return this._health.asObservable();
  }

  playFile(file: SoundFile): Observable<any> {
    return this.http.get(`${this.url}/files/${file.name}/play`);
  }

  downloadFile(file: SoundFile): Observable<Blob> {
    return this.http.get(`${this.url}/files/${file.name}/download`, {responseType: 'blob'});
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

  async restart(): Promise<void> {
    await this.http.get(`${this.url}/ts3/restart`).toPromise();
  }

  private observeStatus(): void {
    this.status().pipe(take(1)).subscribe(value => {
      this._health.next(value);
    });
    setTimeout(() => this.observeStatus(), 5000);
  }

  private status(): Observable<Health> {
    return this.http.get<Health>(`${this.url}/status`).pipe(catchError(() => {
      const health: Health = {
        status: Status.OFFLINE,
        files: 0,
        online: false
      };
      return of(health);
    }));
  }
}
