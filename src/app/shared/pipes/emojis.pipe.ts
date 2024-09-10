import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'emojis',
  standalone: true
})
export class EmojisPipe implements PipeTransform {

  transform(value: string): string {

    if (
      value.toString().includes(':-)') ||
      value.toString().includes(':-(') ||
      value.toString().includes(':-P') ||
      value.toString().includes(':-D') ||
      value.toString().includes(':-O') || 
      value.toString().includes(':-S') || 
      value.toString().includes(':-|') || 
      value.toString().includes(':-*') || 
      value.toString().includes(':-$') || 
      value.toString().includes(':-@') || 
      value.toString().includes(':-#') || 
      value.toString().includes(':-&') || 
      value.toString().includes(':-^') || 
      value.toString().includes(':-%') || 
      value.toString().includes(':-+') || 
      value.toString().includes(':-!') || 
      value.toString().includes(':-?') ||
      value.toString().includes(':-/') ||

      value.toString().includes('😘') ||
      value.toString().includes('😂') ||
      value.toString().includes('😢') ||
      value.toString().includes('😛') ||
      value.toString().includes('😁') ||
      value.toString().includes('😲') ||
      value.toString().includes('😐') ||
      value.toString().includes('😘') ||
      value.toString().includes('😡') ||
      value.toString().includes('😇') ||
      value.toString().includes('😷') ||
      value.toString().includes('😴') ||
      value.toString().includes('😍') ||
      value.toString().includes('😲') ||
      value.toString().includes('😠') ||
      value.toString().includes('😈') ||
      value.toString().includes('😴') ||
      value.toString().includes('😘') ||
      value.toString().includes('😲') ||
      value.toString().includes('😠')) {
      value = value.toString().replaceAll(':-)', '<img class="emoji" src="/img/emojis/laughing.svg">');
      value = value.toString().replaceAll(':-/', '<img class="emoji" src="/img/emojis/feeling.svg">');
      value = value.toString().replaceAll(':-(', '<img class="emoji" src="/img/emojis/sad.svg">');
      value = value.toString().replaceAll(':-P', '<img class="emoji" src="/img/emojis/tongue.svg">');
      value = value.toString().replaceAll(':-D', '<img class="emoji" src="/img/emojis/haha2.svg">');
      value = value.toString().replaceAll(':-O', '<img class="emoji" src="/img/emojis/wink.svg">');
      value = value.toString().replaceAll(':-S', '<img class="emoji" src="/img/emojis/disbelief.svg">');
      value = value.toString().replaceAll(':-|', '<img class="emoji" src="/img/emojis/neutral.svg">');
      value = value.toString().replaceAll(':-*', '<img class="emoji" src="/img/emojis/kiss.svg">');
      value = value.toString().replaceAll(':-$', '<img class="emoji" src="/img/emojis/money.svg">');
      value = value.toString().replaceAll(':-@', '<img class="emoji" src="/img/emojis/angry.svg">');
      value = value.toString().replaceAll(':-#', '<img class="emoji" src="/img/emojis/cute.svg">');
      value = value.toString().replaceAll(':-&', '<img class="emoji" src="/img/emojis/mask.svg">');
      value = value.toString().replaceAll(':-^', '<img class="emoji" src="/img/emojis/sleep.svg">');
      value = value.toString().replaceAll(':-%', '<img class="emoji" src="/img/emojis/love.svg">');
      value = value.toString().replaceAll(':-+', '<img class="emoji" src="/img/emojis/wow.svg">');
      value = value.toString().replaceAll(':-!', '<img class="emoji" src="/img/emojis/angry.svg">');
      value = value.toString().replaceAll(':-?', '<img class="emoji" src="/img/emojis/demon.svg">');
      value = value.toString().replaceAll('😘', '<img class="emoji" src="/img/emojis/kiss.svg">');
      value = value.toString().replaceAll('😂', '<img class="emoji" src="/img/emojis/laughing.svg">');
      value = value.toString().replaceAll('😢', '<img class="emoji" src="/img/emojis/sad.svg">');
      value = value.toString().replaceAll('😛', '<img class="emoji" src="/img/emojis/tongue.svg">');
      value = value.toString().replaceAll('😁', '<img class="emoji" src="/img/emojis/haha2.svg">')
      value = value.toString().replaceAll('😲', '<img class="emoji" src="/img/emojis/wink.svg">')
      value = value.toString().replaceAll('😐', '<img class="emoji" src="/img/emojis/disbelief.svg">');
      value = value.toString().replaceAll('😘', '<img class="emoji" src="/img/emojis/neutral.svg">');
      value = value.toString().replaceAll('😡', '<img class="emoji" src="/img/emojis/angry.svg">');
      value = value.toString().replaceAll('😇', '<img class="emoji" src="/img/emojis/cute.svg">');
      value = value.toString().replaceAll('😷', '<img class="emoji" src="/img/emojis/mask.svg">');
      value = value.toString().replaceAll('😴', '<img class="emoji" src="/img/emojis/sleep.svg">');
      value = value.toString().replaceAll('😍', '<img class="emoji" src="/img/emojis/love.svg">');
      value = value.toString().replaceAll('😲', '<img class="emoji" src="/img/emojis/wow.svg">');
      value = value.toString().replaceAll('😠', '<img class="emoji" src="/img/emojis/angry.svg">');
      value = value.toString().replaceAll('😈', '<img class="emoji" src="/img/emojis/demon.svg">');
      value = value.toString().replaceAll('😴', '<img class="emoji" src="/img/emojis/sleep.svg">');
      return value;
    }
    return value;
  }

}
