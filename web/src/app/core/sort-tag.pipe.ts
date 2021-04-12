import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sortTag'
})
export class SortTagPipe implements PipeTransform {

  transform(value: string[]): string[] {
    value.sort((a: string, b: string) => {
      if (a === 'Greeting') {
        return -1;
      } else if (b === 'Greeting') {
        return 1;
      }

      if (a === 'Leave-taking') {
        return -1;
      } else if (b === 'Leave-taking') {
        return 1;
      }

      if (a > b) {
        return 1;
      }

      if (b > a) {
        return -1;
      }

      return 0;

    });
    return value;
  }

}
