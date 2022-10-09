import { EventEmitter, Injectable } from '@angular/core';
import { combineLatest, first, from, map, merge, of, switchMap } from 'rxjs';
import { IImage } from '../models/image.model';
import { ApiService } from './api.service';
import { SectionsService } from './sections.service';
import { TagsService } from './tags.service';

@Injectable({
  providedIn: 'root',
})
export class ImagesService {
  private __images: IImage[] = [];

  $images = new EventEmitter<IImage[]>();

  private set _images(newImages: IImage[]) {
    this.__images = newImages;
    this.$images.next(newImages);
  }
  private get _images(): IImage[] {
    return this.__images;
  }

  get images(): IImage[] {
    return this.__images;
  }
  constructor(
    private readonly apiService: ApiService,
    private readonly tagsService: TagsService,
    private readonly sectionsService: SectionsService
  ) {
    this.apiService
      .getAllImages()
      .subscribe((images) => (this._images = images));
    combineLatest([
      this.getImages().pipe(first()),
      this.tagsService.$tags,
    ]).subscribe(([images, tags]) => {
      this._images = images.map((image) => {
        return {
          ...image,
          tags: image.tags.map((tag) => {
            return tags.find((_tag) => _tag.tagId === tag.tagId) ?? tag;
          }),
        };
      });
    });
    combineLatest([
      this.getImages().pipe(first()),
      this.sectionsService.$sections,
    ]).subscribe(([images, sections]) => {
      this._images = images.map((image) => {
        return {
          ...image,
          sections: sections.filter((section) =>
            image.tags.some((tag) =>
              section.tags.some((_tag) => _tag.tagId === tag.tagId)
            )
          ),
        };
      });
    });
  }

  getImages() {
    return this.images.length === 0
      ? from(this.$images)
      : merge(of(this.images), this.$images);
  }
  getSection(sectionId: number) {
    return this.getImages().pipe(
      switchMap((images) => {
        return of(
          images.filter((image) => {
            return image.sections.some(
              (section) => section.sectionId === sectionId
            );
          })
        );
      })
    );
  }
}
