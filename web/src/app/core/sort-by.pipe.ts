import { Pipe, PipeTransform } from '@angular/core';
import { TabData } from '../data/tab-data';

@Pipe({
  name: 'sortBy'
})
export class SortByPipe implements PipeTransform {

  transform(value: TabData[], order = '', ...args: unknown[]): TabData[] {
    if (!value || order === '' || !order) {
      return value;
    }

    if (value.length <= 1) {
      return value;
    }

    value.sort((a: TabData, b: TabData) => {
      return 1;
    });

    return value;
  }

}
