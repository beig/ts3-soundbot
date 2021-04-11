import { Injectable } from '@angular/core';
import { HashMap, QueryEntity } from '@datorama/akita';
import { CategoryState, CategoryStore } from './category.store';
import { Category } from './category.model';

@Injectable({providedIn: 'root'})
export class CategoryQuery extends QueryEntity<CategoryState> {
  private asd: HashMap<Category>;

  constructor(protected store: CategoryStore) {
    super(store);
  }
}
