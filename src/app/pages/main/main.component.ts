import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, switchMap } from 'rxjs';
import { LOCK, UNLOCK } from 'src/app/shared/consts/images.const';
import { IImage, ITag } from 'src/app/shared/models/image.model';
import { ApiService } from 'src/app/shared/services/api.service';
import { AuthorizationService } from 'src/app/shared/services/authorization.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
})
export class MainComponent implements AfterViewInit {
  LOCK = LOCK;
  UNLOCK = UNLOCK;

  imagesTable: (IImage & { imageData?: string; previewData?: string })[][] = [];
  images: IImage[] = [];
  tags: ITag[] = [];

  showImageModal: boolean = false;
  openedImage: (IImage & { imageData?: string; previewData?: string }) | null =
    null;

  loading: boolean = true;

  adminFunctionsLocked: boolean = true;
  showAuthModal: boolean = false;
  @ViewChild('password') adminPassword: ElementRef | undefined;

  @ViewChild('getWidth') getWidth: ElementRef | undefined;
  columnCount: number = 3;

  constructor(
    private readonly apiService: ApiService,
    private readonly cdr: ChangeDetectorRef,
    private readonly route: ActivatedRoute,
    private readonly authService: AuthorizationService
  ) {
    this.authService.$token.subscribe((token) => {
      this.adminFunctionsLocked = !authService.authorized;
      this.cdr.markForCheck();
    });
  }

  ngAfterViewInit(): void {
    combineLatest([
      this.route.paramMap,
      this.apiService.getListOfSections(),
      this.apiService.getAllTags(),
    ])
      .pipe(
        switchMap(([params, sections, tags]) => {
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
        this.images = images;
        if (this.getWidth) {
          this.columnCount = Math.trunc(
            this.getWidth.nativeElement.clientWidth / 300
          );
          this.columnCount = this.columnCount < 2 ? 2 : this.columnCount;
          for (let i = 0; i < this.columnCount; i++) {
            let col: (IImage & { imageData?: string; previewData?: string })[] =
              [];
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
      });
  }

  getTagSelectedForImage(tag: ITag, image: IImage) {
    return image.tags.some((_tag) => _tag.tagId === tag.tagId);
  }

  toggleTagOnImage(tag: ITag, image: IImage) {
    console.log(tag, image);
    if (this.authService.token) {
      (this.getTagSelectedForImage(tag, image)
        ? this.apiService.deleteTagFromImage
        : this.apiService.addTagToImage
      )
        .bind(this.apiService)(image.imageId, tag.tagId, this.authService.token)
        .subscribe(() => {
          console.log(this);
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
