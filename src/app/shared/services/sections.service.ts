import { EventEmitter, Injectable } from '@angular/core';
import { from, map, merge, of } from 'rxjs';
import { ISection, ITag } from '../models/image.model';
import { ApiService } from './api.service';
import { TagsService } from './tags.service';

@Injectable({
  providedIn: 'root',
})
export class SectionsService {
  private __sections: ISection[] = [];

  $sections = new EventEmitter<ISection[]>();

  private set _sections(newSections: ISection[]) {
    this.__sections = newSections;
    this.$sections.next(newSections);
  }
  private get _sections(): ISection[] {
    return this.__sections;
  }

  get sections(): ISection[] {
    return this.__sections;
  }
  constructor(
    private readonly apiService: ApiService,
    private readonly tagsService: TagsService
  ) {
    this.apiService.getListOfSections().subscribe((sections) => {
      this._sections = sections;
    });
    this.tagsService.$tags.subscribe((tags) => {
      this._sections = this._sections.map((section) => {
        return {
          ...section,
          tags: section.tags.map((tag) => {
            return tags.find((_tag) => _tag.tagId === tag.tagId) ?? tag;
          }),
        };
      });
    });
  }

  getSections() {
    return this.sections.length === 0
      ? from(this.$sections)
      : merge(this.$sections, of(this.sections));
  }

  toggleTagOnSection(tag: ITag, section: ISection) {
    this._sections = this._sections.map((_section) => {
      if (_section.sectionId === section.sectionId) {
        if (_section.tags.some((_tag) => _tag.tagId === tag.tagId)) {
          _section.tags = _section.tags.filter(
            (_tag) => _tag.tagId !== tag.tagId
          );
        } else {
          _section.tags.push(tag);
        }
      }
      return _section;
    });
  }

  changeSectionName(sectionId: number, newSectionName: string) {
    return this.apiService.changeSectionName(sectionId, newSectionName).pipe(
      map(() => {
        this._sections = this._sections.map((section) =>
          section.sectionId === sectionId
            ? { ...section, section: newSectionName }
            : section
        );
      })
    );
  }
}
