import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'audioStatus'
})
export class AudioStatusPipe implements PipeTransform {

  transform(value: boolean, ...args: unknown[]): unknown {
    return value;
  }

}
