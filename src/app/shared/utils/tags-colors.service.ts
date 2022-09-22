import { Injectable } from '@angular/core';
import { ITag, ITagWithoutBgColor } from '../models/image.model';

@Injectable({
  providedIn: 'root',
})
export class TagsColorService {
  addColorToTag(tag: ITagWithoutBgColor): ITag {
    return {
      ...tag,
      BgColor:
        `rgba(${Math.floor(Math.random() * 256)}, ` +
        `${Math.floor(Math.random() * 256)}, ` +
        `${Math.floor(Math.random() * 256)}, 1)`,
    };
  }
}
