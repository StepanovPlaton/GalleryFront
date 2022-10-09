import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, of, switchMap } from 'rxjs';
import { IImage, ITag } from 'src/app/shared/models/image.model';
import { ApiService } from 'src/app/shared/services/api.service';
import { AuthorizationService } from 'src/app/shared/services/authorization.service';
import { ImagesService } from 'src/app/shared/services/images.service';
import { SectionsService } from 'src/app/shared/services/sections.service';
import { TagsService } from 'src/app/shared/services/tags.service';
import { TagsColorService } from 'src/app/shared/utils/tags-colors.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
})
export class MainComponent implements AfterViewInit {
  imagesTable: (IImage & { imageData?: string; previewData?: string })[][] = [];
  allImages: IImage[] = [];
  images: IImage[] = [];

  loading: boolean = true;

  authorized: boolean = false;

  viewedImage: IImage | null = null;

  currentSectionId: number = -1;

  @ViewChild('getWidth') getWidth: ElementRef | undefined;
  columnCount: number = 3;

  constructor(
    private readonly apiService: ApiService,
    private readonly cdr: ChangeDetectorRef,
    private readonly route: ActivatedRoute,
    private readonly authService: AuthorizationService,
    private readonly tagsColorService: TagsColorService,
    private readonly tagsService: TagsService,
    private readonly sectionsService: SectionsService,
    private readonly imagesService: ImagesService
  ) {
    this.authorized = authService.authorized;
    this.authService.$token.subscribe(() => {
      this.authorized = authService.authorized;
      this.cdr.markForCheck();
    });
  }

  ngAfterViewInit() {
    combineLatest([this.route.paramMap, this.sectionsService.getSections()])
      .pipe(
        switchMap(([params, sections]) => {
          console.log(sections);
          this.allImages = [];
          this.images = [];
          this.imagesTable = [];
          this.loading = true;
          if (
            params.has('sectionId') &&
            sections.some(
              (section) => section.sectionId == +(params.get('sectionId') ?? -1)
            )
          ) {
            this.currentSectionId = +(params.get('sectionId') ?? -1);
            return combineLatest([
              this.imagesService.getSection(this.currentSectionId),
            ]);
          } else {
            return combineLatest([this.imagesService.getImages()]);
          }
        })
      )
      .subscribe(([images]) => {
        this.allImages = images;
        this.createImageGrid(images, []);
      });
    this.tagsService.$filter.subscribe((filter) => {
      this.createImageGrid(this.allImages, filter);
    });
    this.sectionsService.$sections.subscribe((sections) => {
      let currentSection = sections.find(
        (section) => section.sectionId === this.currentSectionId
      );
      this.createImageGrid(
        this.allImages,
        this.tagsService.tags.filter((tag) => {
          if (currentSection)
            currentSection.tags.some((_tag) => tag.tagId === _tag.tagId);
        })
      );
    });
  }

  createImageGrid(images: IImage[], filter: ITag[]) {
    this.imagesTable = [];
    this.images = images.filter((image) => {
      if (filter.length === 0) return true;
      return filter.every((ftag) => {
        return image.tags.some((tag) => tag.tagId === ftag.tagId);
      });
    });
    if (this.getWidth) {
      this.columnCount = Math.trunc(
        this.getWidth.nativeElement.clientWidth / 300
      );
      this.columnCount = this.columnCount < 2 ? 2 : this.columnCount;
      for (let i = 0; i < this.columnCount; i++) {
        let col: (IImage & { imageData?: string; previewData?: string })[] = [];
        for (
          let i = 0;
          i < Math.ceil(this.images.length / this.columnCount);
          i++
        ) {
          const image = this.images.pop();
          if (image) {
            col.push(image);
            this.apiService
              .getPreviewImageFile(image.image)
              .subscribe((imageBlob) => {
                const reader = new FileReader();
                reader.readAsDataURL(imageBlob);
                reader.onload = (_event) => {
                  col[i].previewData = String(reader.result);
                };
              });
          } else break;
        }
        if (col.length !== 0) this.imagesTable.push(col);
        if (this.images.length === 0) break;
      }
    }
    this.loading = false;
    this.images = images;
    this.cdr.markForCheck();
  }

  getTagSelectedForImage(tag: ITag, image: IImage) {
    return image.tags.some((_tag) => _tag.tagId === tag.tagId);
  }
  toggleTagOnImageInGrid(tag: ITag, image: IImage | null) {
    if (!image) return; //never

    for (let column of this.imagesTable) {
      for (let _image of column) {
        if (_image.imageId === image.imageId) {
          if (this.getTagSelectedForImage(tag, image)) {
            _image.tags = _image.tags.filter(
              (_tag) => _tag.tagId !== tag.tagId
            );
          } else {
            _image.tags.push(tag);
          }
        }
      }
    }
  }
}
