import { inject, Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'safeHTML',
  standalone: true
})
export class HtmlConverterPipe implements PipeTransform {

  private sanitizer = inject(DomSanitizer);

  transform(value: string): SafeHtml {

    if (value) {
      value = value
      .replace('&lt;', '<')
      .replace('&gt;', '>')
      .replace('&quot;', '"')
      .replace('&amp;', '&')
      .replace('&lt;div&gt;', '')
      .replace('&lt;/div&gt;', '')
      .replace('<div>','')
      .replace('</div>','')
      .replace('&nbsp;','')

      return value;
    }
    return value;
  }

}
