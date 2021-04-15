import { Component, ElementRef, Input, OnInit, QueryList, ViewChildren } from '@angular/core';
import { SoundFile } from '../../../core/state/sound-file/sound-file.model';
import { MatTableDataSource } from '@angular/material/table';
import { CategoryQuery } from '../../../core/state/category/category.query';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { map, startWith, take } from 'rxjs/operators';
import { SoundFileQuery } from '../../../core/state/sound-file/sound-file.query';
import { UploadFileComponent } from '../upload-file.component';
import { SoundFileService } from '../../../core/state/sound-file/sound-file.service';

@UntilDestroy()
@Component({
  selector: 'app-batch-upload',
  templateUrl: './batch-upload.component.html',
  styleUrls: ['./batch-upload.component.scss']
})
export class BatchUploadComponent implements OnInit {

  @ViewChildren('tagInput') tagInputs: QueryList<ElementRef<HTMLInputElement>>;

  @Input()
  uploadFileComponent: UploadFileComponent;

  private _soundFiles: SoundFile[];
  filteredTags: Observable<string[]>;
  tagCtrl = new FormControl();
  dataSource: MatTableDataSource<SoundFile>;
  displayedColumns: string[] = ['name', 'description', 'category', 'tags', 'delete'];
  allTags: string[] = ['Greeting', 'Leave-taking'];
  separatorKeysCodes: number[] = [ENTER, COMMA];

  @Input()
  set soundFiles(value: SoundFile[]) {
    this._soundFiles = value;
    console.log('setting', value);
    this.dataSource = new MatTableDataSource<SoundFile>(this._soundFiles);
  }

  constructor(public categoryQuery: CategoryQuery,
              private service: SoundFileService,
              private query: SoundFileQuery) {
  }

  ngOnInit(): void {
    this.query.getAll().forEach(value => {
      value.tags.forEach(tag => {
        if (!this.allTags.includes(tag)) {
          this.allTags.push(tag);
        }
      });
    });

    this.filteredTags = this.tagCtrl.valueChanges.pipe(
      untilDestroyed(this),
      startWith(null),
      map((tag: string | null) => tag ? this._filter(tag) : this.allTags.slice()));
  }

  add(event: MatChipInputEvent, file: SoundFile): void {
    const input = event.input;
    const value = event.value;

    if ((value || '').trim()) {
      if (!file.tags.map(t => t.toLowerCase()).includes(value.trim().toLowerCase())) {
        file.tags = [...file.tags, value.trim()];
      }
    }

    if (input) {
      input.value = '';
    }

    this.tagCtrl.setValue(null);
  }

  selected(event: MatAutocompleteSelectedEvent, file: SoundFile, index: number): void {
    if (!file.tags.map(t => t.toLowerCase()).includes(event.option.viewValue.toLowerCase())) {
      file.tags = [...file.tags, event.option.viewValue];
    }
    this.tagInputs.get(index)!.nativeElement.value = '';
    this.tagCtrl.setValue(null);
  }

  remove(tag: string, file: SoundFile): void {
    const index = file.tags.indexOf(tag);

    if (index >= 0) {
      file.tags.splice(index, 1);
    }
  }

  delete(element: number): void {
    this.dataSource.data.splice(element, 1);
    this.dataSource._updateChangeSubscription();
  }

  async save(): Promise<void> {
    const filesToSave = this.dataSource.data;

    await Promise.all(filesToSave.map(value => {
      return new Promise<void>(resolve => {
        this.service.add<SoundFile>(value).pipe(take(1)).subscribe(saved => {
          const update = {
            ...saved
          };
          this.service.update(update.name, update);
          resolve();
        });
      });
    }));

    this.uploadFileComponent.close();
  }

  cancel(): void {
    this.uploadFileComponent.close();
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.allTags.filter(tag => tag.toLowerCase().indexOf(filterValue) === 0);
  }
}
