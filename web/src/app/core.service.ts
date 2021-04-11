import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Health, Status} from './data/health';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {catchError, distinctUntilChanged, filter, map, take} from 'rxjs/operators';
import {SoundFile} from './data/sound-file';
import {Channel} from './data/channel';
import {environment} from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CoreService {

  private url = environment.url;
  private _soundFiles$ = new BehaviorSubject<SoundFile[]>([]);
  private _health = new BehaviorSubject<Health>({online: false, status: Status.OFFLINE, files: 0});

  get health(): Observable<Health> {
    return this._health.asObservable();
  }

  constructor(private http: HttpClient) {
    this.observeStatus();
    this._health.pipe(distinctUntilChanged((x, y) => x.status === y.status),
      filter(value => value.status === Status.ONLINE)).subscribe(() => {
      this.getFiles().pipe(map(value => {
        let idCount = 0;
        value.forEach(soundFile => soundFile.id = ++idCount);
        return value;
      }), take(1)).subscribe(value => this._soundFiles$.next(value));
    });
  }

  private observeStatus(): void {
    this.status().pipe(take(1)).subscribe(value => {
      this._health.next(value);
    });
    setTimeout(() => this.observeStatus(), 5000);
  }

  get soundFiles$(): Observable<SoundFile[]> {
    return this._soundFiles$.asObservable();
  }

  get soundFiles(): SoundFile[] {
    return this._soundFiles$.getValue();
  }

  playFile(file: SoundFile): Observable<any> {
    return this.http.get(`${this.url}/files/${file.fileName}/play`);
  }

  downloadFile(file: SoundFile): Observable<Blob> {
    return this.http.get(`${this.url}/files/${file.fileName}/download`, {responseType: 'blob'});
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

  private getFiles(): Observable<SoundFile[]> {
    return this.http.get<SoundFile[]>(`${this.url}/files`);
  }
}
