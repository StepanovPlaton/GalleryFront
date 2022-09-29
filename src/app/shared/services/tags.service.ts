import { EventEmitter, Injectable } from '@angular/core';
import { ITag } from '../models/image.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class TagsService {
  private _tags: ITag[] = [];
  private _filter: ITag[] = [];

  $filter = new EventEmitter<ITag[]>();
  $tags = new EventEmitter<ITag[]>();

  get tags(): ITag[] {
    return this._tags;
  }
  get filter(): ITag[] {
    return this._filter;
  }

  constructor(private readonly apiService: ApiService) {
    this.apiService.getAllTags().subscribe((tags) => {
      this._tags = tags;
      this.$tags.next(tags);
    });
  }

  addTag(tag: ITag) {
    this._tags.push(tag);
    this.$tags.next(this._tags);
  }
  deleteTag(tagId: number) {
    this._tags = this._tags.filter((tag) => tag.tagId !== tagId);
    this.$tags.next(this._tags);
  }

  addTagToFilter(tag: ITag) {
    this._filter.push(tag);
    this.$filter.next(this._filter);
  }
  deleteTagFromFilter(tagId: number) {
    this._filter = this._filter.filter((tag) => tag.tagId !== tagId);
    this.$filter.next(this._filter);
  }
}
