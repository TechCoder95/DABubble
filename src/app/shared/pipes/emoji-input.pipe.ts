import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'emojiInput',
  standalone: true
})
export class EmojiInputPipe implements PipeTransform {

  transform(value: string): string {

    if (
      value.includes(':-)')) {
      value = value.replaceAll(':-)', '😂');
      return value;
    }
    if (
      value.includes(':-(')) {
      value = value.replaceAll(':-(', '😢');
      return value;
    }
    if (
      value.includes(':-P')) {
      value = value.replaceAll(':-P', '😛');
      return value;
    }
    if (
      value.includes(':-D')) {
      value = value.replaceAll(':-D', '😁');
      return value;
    }
    if (
      value.includes(':-O')) {
      value = value.replaceAll(':-O', '😲');
      return value;
    }
    if (
      value.includes(':-S')) {
      value = value.replaceAll(':-S', '😐');
      return value;
    }
    if (
      value.includes(':-|')) {
      value = value.replaceAll(':-|', '😐');
      return value;
    }
    if (
      value.includes(':-*')) {
      value = value.replaceAll(':-*', '😘');
      return value;
    }
    if (
      value.includes(':-$')) {
      value = value.replaceAll(':-$', '😡');
      return value;
    }
    if (
      value.includes(':-@')) {
      value = value.replaceAll(':-@', '😡');
      return value;
    }

    
    return value;
  }
}
