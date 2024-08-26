import { Injectable } from '@angular/core';
import { concat, from, interval, of } from 'rxjs';
import { concatMap, delay, ignoreElements, map, take } from 'rxjs/operators';

interface TypeParams {
  word: string;
  speed: number;
}

@Injectable({
  providedIn: 'root',
})
export class TypewriterService {
  private type({ word, speed }: TypeParams) {
    return interval(speed).pipe(
      map((x) => word.substring(0, x + 1) + (x < word.length ? '|' : '')),
      take(word.length + 1)
    );
  }

  typeEffect(word: string) {
    return concat(
      this.type({ word, speed: 100 }),
      of('').pipe(delay(1200), ignoreElements())
    );
  }

  getTypewriterEffect(titles: string[]) {
    return from(titles).pipe(
      concatMap((title) => this.typeEffect(title))
    );
  }
}
