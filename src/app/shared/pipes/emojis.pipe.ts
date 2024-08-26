import { Pipe, PipeTransform } from '@angular/core';
import { SafeHtml } from '@angular/platform-browser';

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
      value.toString().includes('<3')) {
      value = value.toString().replace(':-)', '<img class="emoji" src="/img/emojis/laughing.svg">');
      value = value.toString().replace(':-(', '<img class="emoji" src="/img/emojis/sad.svg">');
      value = value.toString().replace(':-P', '<img class="emoji" src="/img/emojis/tongue.svg">');
      value = value.toString().replace(':-D', '<img class="emoji" src="/img/emojis/haha2.svg">');
      value = value.toString().replace(':-O', '<img class="emoji" src="/img/emojis/wink.svg">');
      value = value.toString().replace(':-S', '<img class="emoji" src="/img/emojis/disbelief.svg">');
      value = value.toString().replace(':-|', '<img class="emoji" src="/img/emojis/neutral.svg">');
      value = value.toString().replace(':-*', '<img class="emoji" src="/img/emojis/kiss.svg">');
      value = value.toString().replace(':-$', '<img class="emoji" src="/img/emojis/money.svg">');
      value = value.toString().replace(':-@', '<img class="emoji" src="/img/emojis/angry.svg">');
      value = value.toString().replace(':-#', '<img class="emoji" src="/img/emojis/cute.svg">');
      value = value.toString().replace(':-&', '<img class="emoji" src="/img/emojis/mask.svg">');
      value = value.toString().replace(':-^', '<img class="emoji" src="/img/emojis/sleep.svg">');
      value = value.toString().replace(':-%', '<img class="emoji" src="/img/emojis/love.svg">');
      value = value.toString().replace(':-+', '<img class="emoji" src="/img/emojis/wow.svg">');
      value = value.toString().replace(':-!', '<img class="emoji" src="/img/emojis/angry.svg">');
      value = value.toString().replace(':-?', '<img class="emoji" src="/img/emojis/demon.svg">');
      return value;
    }
    return value;
  }

}
