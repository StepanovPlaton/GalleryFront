import { EventEmitter, Injectable } from '@angular/core';
import { merge, of } from 'rxjs';
import { ITag } from '../models/image.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class TagsService {
  private __tags: ITag[] = [];
  private __filter: ITag[] = [];

  $filter = new EventEmitter<ITag[]>();
  $tags = new EventEmitter<ITag[]>();

  private set _tags(newTags: ITag[]) {
    this.__tags = newTags;
    this.$tags.next(newTags);
  }
  private set _filter(newFilter: ITag[]) {
    this.__filter = newFilter;
    this.$filter.next(newFilter);
  }
  private get _tags(): ITag[] {
    return this.__tags;
  }
  private get _filter(): ITag[] {
    return this.__filter;
  }

  get tags(): ITag[] {
    return this.__tags;
  }
  get filter(): ITag[] {
    return this.__filter;
  }

  constructor(private readonly apiService: ApiService) {
    this.apiService.getAllTags().subscribe((tags) => {
      this._tags = tags;
    });
  }

  getTags() {
    return this.tags.length === 0
      ? this.$tags
      : merge(of(this.tags), this.$tags);
  }
  getFilter() {
    return this.filter.length === 0
      ? this.$filter
      : merge(of(this.filter), this.$filter);
  }

  addTag(tag: ITag) {
    this._tags = [...this._tags, tag];
  }
  deleteTag(tagId: number) {
    this._tags = this._tags.filter((tag) => tag.tagId !== tagId);
  }
  changeTag(tagId: number, tag: string) {
    this._tags = this._tags.map((_tag) => {
      if (_tag.tagId === tagId) {
        _tag.tag = tag;
      }
      return _tag;
    });
    console.log(this.tags);
  }

  addTagToFilter(tag: ITag) {
    this._filter = [...this._filter, tag];
  }
  deleteTagFromFilter(tagId: number) {
    this._filter = this._filter.filter((tag) => tag.tagId !== tagId);
  }
  setFilter(tags: ITag[]) {
    this._filter = tags;
  }
  clearFilter() {
    this.setFilter([]);
  }
}
