import { Pipe, PipeTransform } from '@angular/core';
import { MSG } from '../chat.service';
@Pipe({
  name: 'orderby'
})
export class OrderbyPipe implements PipeTransform {

  transform(array: Array<MSG>): any {
    console.log(array);
    if(!array || array === undefined || array.length === 0) return null;    
    array.sort((a:any, b:any) => {
      if(a.index < b.index) return 1;
      else if (a.index > b.index) return -1;
      else return 0;
    });
    console.log(array);
    return array;
  }
}
