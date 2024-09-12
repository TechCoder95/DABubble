import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'verlinkung',
  standalone: true
})
export class VerlinkungPipe implements PipeTransform {

  transform(value: string): string {
    const userRegex = /(@[\wäöüÄÖÜß-]+(?:\s[\wäöüÄÖÜß]+)?)\u200B/g;
    const channelRegex = /(#\w+(?:\s[\wäöüÄÖÜß]+)?)(?=\s|$|\u200B)\u200B/g;


    return value.replace(userRegex, '<span class="user-verlinkung">$1</span>')
      .replace(channelRegex, '<span class="channel-verlinkung">$1</span>');
  }

}
