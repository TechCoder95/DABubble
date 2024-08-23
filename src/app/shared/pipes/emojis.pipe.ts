import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'emojis',
  standalone: true
})
export class EmojisPipe implements PipeTransform {

  transform(value: string): string {

    if (value.includes(':-)') || value.includes(':)')) {
      value = value.replace(':-)', '😊').replace(':)', '😊');
      return value;
    }

    if (value.includes(':-(') || value.includes(':(')) {
      value = value.replace(':-(', '😞').replace(':(', '😞');
      return value;
    }

    if (value.includes(':-D') || value.includes(':D')) {
      value = value.replace(':-D', '😁').replace(':D', '😁');
      return value;
    }

    if (value.includes(':-P') || value.includes(':P')) {
      value = value.replace(':-P', '😛').replace(':P', '😛');
      return value;
    }

    if (value.includes(':-O') || value.includes(':O')) {
      value = value.replace(':-O', '😮').replace(':O', '😮');
      return value;
    }

    if (value.includes(':-/') || value.includes(':/')) {
      value = value.replace(':-/', '😕').replace(':/', '😕');
      return value;
    }

    if (value.includes(':-*') || value.includes(':*')) {
      value = value.replace(':-*', '😘').replace(':*', '😘');
      return value;
    }

    if (value.includes(':-|') || value.includes(':|')) {
      value = value.replace(':-|', '😐').replace(':|', '😐');
      return value;
    }

    if (value.includes(':-$') || value.includes(':$')) {
      value = value.replace(':-$', '🤑').replace(':$', '🤑');
      return value;
    }

    if (value.includes(':-!') || value.includes(':!')) {
      value = value.replace(':-!', '😠').replace(':!', '😠');
      return value;
    }

    if (value.includes(':-@') || value.includes(':@')) {
      value = value.replace(':-@', '😡').replace(':@', '😡');
      return value;
    }

    if (value.includes(':-#') || value.includes(':#')) {
      value = value.replace(':-#', '🤐').replace(':#', '🤐');
      return value;
    }

    if (value.includes(':-&') || value.includes(':&')) {
      value = value.replace(':-&', '🤒').replace(':&', '🤒');
      return value;
    }

    if (value.includes(':-%') || value.includes(':%')) {
      value = value.replace(':-%', '🤕').replace(':%', '🤕');
      return value;
    }

    if (value.includes(':-^') || value.includes(':^')) {
      value = value.replace(':-^', '🤓').replace(':^', '🤓');
      return value;
    }
    
    return value;
  }

}
