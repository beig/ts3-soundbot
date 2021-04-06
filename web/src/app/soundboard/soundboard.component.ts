import {Component, OnDestroy, OnInit} from '@angular/core';
import {CoreService} from '../core.service';
import {BehaviorSubject, combineLatest, Observable, Subject} from 'rxjs';
import {SoundFile} from '../data/sound-file';
import {FormBuilder, FormGroup} from '@angular/forms';
import {map, startWith, takeUntil} from 'rxjs/operators';
import {MatDialog} from '@angular/material/dialog';
import {BotControlComponent} from './bot-control/bot-control.component';
import {PageEvent} from '@angular/material/paginator';
import {Status} from '../data/health';

@Component({
  selector: 'app-soundboard',
  templateUrl: './soundboard.component.html',
  styleUrls: ['./soundboard.component.scss']
})
export class SoundboardComponent implements OnInit, OnDestroy {

  private unsubscribe = new Subject<boolean>();

  soundFiles!: Observable<SoundFile[]>;
  filterForm!: FormGroup;
  inputFilter = new Subject<string>();
  page = new BehaviorSubject<PageEvent>({length: 15, pageIndex: 0, pageSize: 15, previousPageIndex: 0});
  soundFilesCount = 0;
  health = this.core.health;
  status = Status;

  set pageEvent(event: PageEvent) {
    this.page.next(event);
  }

  constructor(private core: CoreService,
              public dialog: MatDialog,
              private fb: FormBuilder) {
  }

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      inputFilter: []
    });

    this.soundFiles = combineLatest([
      this.inputFilter.pipe(startWith('')),
      this.core.soundFiles,
      this.page
    ]).pipe(map(([inputFilter, soundFiles, page]) => {
      const start = page.pageIndex * 15;
      const end = (page.pageIndex + 1) * 15;

      const files = soundFiles.filter(value =>
        value.displayName?.toLowerCase().includes(inputFilter.toLowerCase())
        || value.fileName?.toLowerCase().includes(inputFilter.toLowerCase())
        || value.category?.toLowerCase().includes(inputFilter.toLowerCase())
      );
      this.soundFilesCount = files.length;
      return files.slice(start, end);
    }), takeUntil(this.unsubscribe));

    this.filterForm.controls.inputFilter.valueChanges.pipe(takeUntil(this.unsubscribe)).subscribe(value => {
      this.inputFilter.next(value);
      this.page.next({length: 15, pageIndex: 0, pageSize: 15, previousPageIndex: 0});
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe.next(true);
    this.unsubscribe.complete();
  }

  showBotControl(): void {
    this.dialog.open(BotControlComponent);
  }
}
