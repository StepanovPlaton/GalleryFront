import { HttpEventType } from '@angular/common/http';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, combineLatest, last, map, of, switchMap } from 'rxjs';
import {
  ADD,
  ADD_IMAGE,
  LOCK,
  UNLOCK,
} from 'src/app/shared/consts/images.const';
import { IImage, ITag } from 'src/app/shared/models/image.model';
import { ApiService } from 'src/app/shared/services/api.service';
import { AuthorizationService } from 'src/app/shared/services/authorization.service';
import { TagsService } from 'src/app/shared/services/tags.service';
import { TagsColorService } from 'src/app/shared/utils/tags-colors.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
})
export class MainComponent implements AfterViewInit {
  LOCK = LOCK;
  UNLOCK = UNLOCK;
  ADD = ADD;
  ADD_IMAGE = ADD_IMAGE;

  imagesTable: (IImage & { imageData?: string; previewData?: string })[][] = [];
  allImages: IImage[] = [];
  images: IImage[] = [];
  tags: ITag[] = [];

  showImageModal: boolean = false;
  openedImage: (IImage & { imageData?: string; previewData?: string }) | null =
    null;

  loading: boolean = true;

  addingNewTag: boolean = false;

  showProgressBar: boolean = false;
  loadingProgress: { fileTmpId: string; loadingProgress: number }[] = [];

  adminFunctionsLocked: boolean = true;
  showAuthModal: boolean = false;
  @ViewChild('password') adminPassword: ElementRef | undefined;

  @ViewChild('getWidth') getWidth: ElementRef | undefined;
  columnCount: number = 3;

  constructor(
    private readonly apiService: ApiService,
    private readonly cdr: ChangeDetectorRef,
    private readonly route: ActivatedRoute,
    private readonly authService: AuthorizationService,
    private readonly tagsColorService: TagsColorService,
    private readonly tagsService: TagsService
  ) {
    this.adminFunctionsLocked = !authService.authorized;
    this.authService.$token.subscribe((token) => {
      this.adminFunctionsLocked = !authService.authorized;
      this.cdr.markForCheck();
      console.log('token', token, !this.adminFunctionsLocked);
    });
  }

  ngAfterViewInit(): void {
    combineLatest([
      this.route.paramMap,
      this.apiService.getListOfSections(),
      this.tagsService.tags.length === 0
        ? this.tagsService.$tags
        : of(this.tagsService.tags),
    ])
      .pipe(
        switchMap(([params, sections, tags]) => {
          this.allImages = [];
          this.images = [];
          this.imagesTable = [];
          this.tags = tags;
          this.loading = true;
          if (
            params.has('sectionId') &&
            sections.some(
              (section) => section.sectionId == +(params.get('sectionId') ?? 0)
            )
          ) {
            return this.apiService.getSectionImages(
              +(params.get('sectionId') ?? 0)
            );
          } else {
            return this.apiService.getAllImages();
          }
        })
      )
      .subscribe((images) => {
        this.allImages = images;
        this.createImageGrid(images);
      });
    this.tagsService.$filter.subscribe(() => {
      this.createImageGrid(this.allImages);
    });
  }

  createImageGrid(images: IImage[]) {
    this.imagesTable = [];
    this.images = images.filter((image) => {
      if (this.tagsService.filter.length === 0) return true;
      return this.tagsService.filter.every((ftag) => {
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
  }

  getTagSelectedForImage(tag: ITag, image: IImage) {
    return image.tags.some((_tag) => _tag.tagId === tag.tagId);
  }

  toggleTagOnImage(tag: ITag, image: IImage) {
    if (this.authService.token) {
      (this.getTagSelectedForImage(tag, image)
        ? this.apiService.deleteTagFromImage
        : this.apiService.addTagToImage
      )
        .bind(this.apiService)(image.imageId, tag.tagId, this.authService.token)
        .subscribe(() => {
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
        });
    }
  }

  changeTagName(tagId: number, newTagName: string) {
    if (this.authService.token) {
      this.apiService
        .changeTagName(tagId, newTagName, this.authService.token)
        .subscribe(() => {
          for (let tag of this.tags) {
            if (tag.tagId === tagId) tag.tag = newTagName;
          }
        });
    }
  }
  createNewTag(tagName: string) {
    if (this.authService.token) {
      this.apiService
        .createTag(tagName, this.authService.token)
        .subscribe(({ tagId }) => {
          this.tags.push(
            this.tagsColorService.addColorToTag({
              tagId: tagId,
              tag: tagName,
            })
          );
          this.addingNewTag = false;
        });
    }
  }
  deleteTag(tagId: number) {
    if (this.authService.token) {
      this.apiService.deleteTag(tagId, this.authService.token).subscribe(() => {
        this.tags = this.tags.filter((tag) => tag.tagId !== tagId);
      });
    }
  }

  openImageModal(image: IImage) {
    this.openedImage = image;
    this.showImageModal = true;
    this.apiService.getImageFile(image.image).subscribe((imageBlob) => {
      const reader = new FileReader();
      reader.readAsDataURL(imageBlob);
      reader.onload = (_event) => {
        if (this.openedImage)
          this.openedImage.imageData = String(reader.result);
      };
    });
  }
  closeImageModal() {
    this.showImageModal = false;
    setTimeout(() => {
      this.openedImage = null;
      this.cdr.markForCheck();
    }, 500);
  }

  closeAuthModal() {
    this.showAuthModal = false;
    setTimeout(() => {
      this.openedImage = null;
      this.cdr.markForCheck();
    }, 500);
  }

  uploadImage(event: any) {
    let files: File[] = event.target.files;
    for (let file of files) {
      this.apiService
        .addImage(file)
        .pipe(
          map((event) => {
            switch (event.type) {
              case HttpEventType.Sent:
                this.showProgressBar = true;
                this.loadingProgress = [];
                return null;

              case HttpEventType.UploadProgress:
                if (
                  this.loadingProgress.some(
                    (fileLoadingProgress) =>
                      fileLoadingProgress.fileTmpId === file.name + file.size
                  )
                ) {
                  for (let lp of this.loadingProgress) {
                    if (lp.fileTmpId === file.name + file.size) {
                      lp.loadingProgress = event.total
                        ? Math.round((100 * event.loaded) / event.total)
                        : 0;
                    }
                  }
                } else {
                  this.loadingProgress.push({
                    fileTmpId: file.name + file.size,
                    loadingProgress: event.total
                      ? Math.round((100 * event.loaded) / event.total)
                      : 0,
                  });
                }
                return null;

              case HttpEventType.Response:
                this.showProgressBar = false;
                return event.body;
            }
            return null;
          }),
          last(),
          switchMap((event) => {
            if (event) {
              return this.apiService.getImage(event.imageId);
            }
            return of(null);
          })
        )
        .subscribe((image) => {
          if (image) {
            this.allImages.push(image);
            this.createImageGrid(this.allImages);
          }
        });
    }
  }

  getGlobalLoadingProgress() {
    return (
      this.loadingProgress.reduce((sum, v) => {
        return sum + v.loadingProgress;
      }, 0) / this.loadingProgress.length
    );
  }

  auth() {
    this.authService
      .authorization(this.adminPassword?.nativeElement.value)
      .subscribe();
    this.showAuthModal = false;
  }
  logout() {
    this.authService.logout();
  }
}
