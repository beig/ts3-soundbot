import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {CoreService} from '../core.service';
import {Observable, Subject} from 'rxjs';
import {SoundFile} from '../data/sound-file';
import {FormBuilder, FormGroup} from '@angular/forms';
import {takeUntil} from 'rxjs/operators';
import {MatDialog} from '@angular/material/dialog';
import {BotControlComponent} from './bot-control/bot-control.component';
import {MatPaginator} from '@angular/material/paginator';
import {Status} from '../data/health';
import {MatTableDataSource} from '@angular/material/table';
import {MatSort} from '@angular/material/sort';

@Component({
  selector: 'app-soundboard',
  templateUrl: './soundboard.component.html',
  styleUrls: ['./soundboard.component.scss']
})
export class SoundboardComponent implements OnInit, OnDestroy {

  private unsubscribe = new Subject<boolean>();

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  displayedColumns: string[] = ['id', 'name', 'duration', 'play', 'playLocal'];
  soundFiles!: Observable<SoundFile[]>;
  filterForm!: FormGroup;
  health = this.core.health;
  status = Status;
  dataSource: MatTableDataSource<SoundFile>;

  get soundFilesCount(): number {
    return this.dataSource.data.length;
  }

  constructor(private core: CoreService,
              public dialog: MatDialog,
              private fb: FormBuilder) {
    this.dataSource = new MatTableDataSource<SoundFile>([]);
  }

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      inputFilter: []
    });

    this.core.soundFiles.subscribe(value => {
      this.dataSource = new MatTableDataSource<SoundFile>(value);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });

    this.filterForm.controls.inputFilter.valueChanges.pipe(takeUntil(this.unsubscribe)).subscribe(value => {
      this.dataSource.filter = value.trim().toLowerCase();

      if (this.dataSource.paginator) {
        this.dataSource.paginator.firstPage();
      }
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe.next(true);
    this.unsubscribe.complete();
  }

  showBotControl(): void {
    this.dialog.open(BotControlComponent);
  }

  async playFile(file: SoundFile): Promise<void> {
    await this.core.playFile(file).toPromise();
  }
}
