import {Component, OnDestroy, OnInit} from '@angular/core';
import {CoreService} from '../core.service';
import {BehaviorSubject, combineLatest, Observable, Subject} from 'rxjs';
import {Health} from '../data/health';
import {SoundFile} from '../data/sound-file';
import {FormBuilder, FormGroup} from '@angular/forms';
import {map, startWith, take, takeUntil} from 'rxjs/operators';
import {MatDialog} from '@angular/material/dialog';
import {BotControlComponent} from './bot-control/bot-control.component';
import {PageEvent} from '@angular/material/paginator';

@Component({
  selector: 'app-soundboard',
  templateUrl: './soundboard.component.html',
  styleUrls: ['./soundboard.component.scss']
})
export class SoundboardComponent implements OnInit, OnDestroy {

  private unsubscribe = new Subject<boolean>();

  health = new BehaviorSubject<Health>({online: false, status: 'Offline', files: 0});
  soundFiles!: Observable<SoundFile[]>;
  filterForm!: FormGroup;
  filter = new Subject<string>();
  page = new BehaviorSubject<PageEvent>({length: 15, pageIndex: 0, pageSize: 15, previousPageIndex: 0});
  soundFilesCount = 0;

  set pageEvent(event: PageEvent) {
    this.page.next(event);
  }

  constructor(private core: CoreService,
              public dialog: MatDialog,
              private fb: FormBuilder) {
  }

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      filter: []
    });

    this.checkHealth();

    this.soundFiles = combineLatest([
      this.filter.pipe(startWith('')),
      this.core.getFiles(),
      this.page
    ]).pipe(map(([filter, soundFiles, page]) => {
      const start = page.pageIndex * 15;
      const end = (page.pageIndex + 1) * 15;

      const files = soundFiles.filter(value =>
        value.displayName?.toLowerCase().includes(filter.toLowerCase())
        || value.fileName?.toLowerCase().includes(filter.toLowerCase())
        || value.category?.toLowerCase().includes(filter.toLowerCase())
      );
      this.soundFilesCount = files.length;
      return files.slice(start, end);
    }), takeUntil(this.unsubscribe));

    this.filterForm.controls.filter.valueChanges.pipe(takeUntil(this.unsubscribe)).subscribe(value => {
      this.filter.next(value);
      this.page.next({length: 15, pageIndex: 0, pageSize: 15, previousPageIndex: 0});
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe.next(true);
    this.unsubscribe.complete();
  }

  private checkHealth(): void {
    this.core.status().pipe(take(1)).subscribe(value => {
      this.health.next(value);
    });
    setTimeout(() => this.checkHealth(), 5000);
  }

  showBotControl(): void {
    this.dialog.open(BotControlComponent);
  }
}
