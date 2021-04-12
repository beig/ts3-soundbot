import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'apply',
})
export class ApplyPipe implements PipeTransform {
  transform<T, U extends any[]>(fn: (...fnArgs: U) => T, ...args: U): T {
    console.log(fn, ...args);
    return fn(...args);
  }
}
