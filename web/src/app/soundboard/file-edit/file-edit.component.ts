import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { SoundFile } from '../../core/state/sound-file/sound-file.model';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatAutocomplete, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { map, startWith, take } from 'rxjs/operators';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { SoundFileQuery } from '../../core/state/sound-file/sound-file.query';
import { SoundFileService } from '../../core/state/sound-file/sound-file.service';
import { CategoryQuery } from '../../core/state/category/category.query';
import { Category } from '../../core/state/category/category.model';

@UntilDestroy()
@Component({
  selector: 'app-file-edit',
  templateUrl: './file-edit.component.html',
  styleUrls: ['./file-edit.component.scss']
})
export class FileEditComponent implements OnInit {

  @ViewChild('tagInput') tagInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto') matAutocomplete: MatAutocomplete;

  selectable = true;
  removable = true;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  tagCtrl = new FormControl();
  filteredTags: Observable<string[]>;
  allTags: string[] = ['Greeting', 'Leave-taking'];
  tags: string[] = [];
  description = '';
  descriptionControl: FormControl;
  category: Category;
  isNew: boolean;

  constructor(@Inject(MAT_DIALOG_DATA) public data: SoundFile,
              private query: SoundFileQuery,
              private service: SoundFileService,
              public categoryQuery: CategoryQuery,
              public dialogRef: MatDialogRef<FileEditComponent>) {
    this.descriptionControl = new FormControl();

    if (data.isNew) {
      this.isNew = data.isNew;
      this.init(data);
    } else {
      this.query.selectEntity(data.name).subscribe(value => {
        this.init(value!);
      });
    }

    this.descriptionControl.valueChanges.pipe(untilDestroyed(this)).subscribe(value => {
      this.description = value;
    });

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

  ngOnInit(): void {
  }

  add(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    if ((value || '').trim()) {
      if (!this.tags.map(t => t.toLowerCase()).includes(value.trim().toLowerCase())) {
        this.tags = [...this.tags, value.trim()];
      }
    }

    if (input) {
      input.value = '';
    }

    this.tagCtrl.setValue(null);
  }

  remove(tag: string): void {
    const index = this.tags.indexOf(tag);

    if (index >= 0) {
      this.tags.splice(index, 1);
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    if (!this.tags.map(t => t.toLowerCase()).includes(event.option.viewValue.toLowerCase())) {
      this.tags = [...this.tags, event.option.viewValue];
    }
    this.tagInput.nativeElement.value = '';
    this.tagCtrl.setValue(null);
  }

  cancel(): void {
    this.dialogRef.close();
  }

  save(): void {
    this.data = {
      ...this.data,
      description: this.description,
      tags: this.tags,
      category: this.category?.id
    };
    if (this.isNew) {
      this.service.add<SoundFile>(this.data).pipe(take(1)).subscribe((value: SoundFile) => {
        const update = {
          ...value
        };
        this.service.update(value.name, update);
        this.dialogRef.close();
      });
    } else {
      this.service.update(this.data.name, this.data).pipe(take(1)).subscribe(() => {
        this.dialogRef.close();
      });
    }
  }

  private init(entity: SoundFile): void {
    this.tags = [...entity.tags];
    this.description = entity.description;
    this.descriptionControl.setValue(entity.description);
    this.category = this.categoryQuery.getEntity(entity.category)!;
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.allTags.filter(tag => tag.toLowerCase().indexOf(filterValue) === 0);
  }
}
