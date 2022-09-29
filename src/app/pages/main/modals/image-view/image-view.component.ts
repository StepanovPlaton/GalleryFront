import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { of } from 'rxjs';
import { ADD } from 'src/app/shared/consts/images.const';
import { IImage, ITag } from 'src/app/shared/models/image.model';
import { ApiService } from 'src/app/shared/services/api.service';
import { AuthorizationService } from 'src/app/shared/services/authorization.service';
import { TagsService } from 'src/app/shared/services/tags.service';
import { TagsColorService } from 'src/app/shared/utils/tags-colors.service';

type openedImage =
  | (IImage & { imageData?: string; previewData?: string })
  | null;

@Component({
  selector: 'app-image-view',
  templateUrl: './image-view.component.html',
  styleUrls: ['./image-view.component.scss'],
})
export class ImageViewComponent implements OnInit {
  ADD = ADD;

  showImageModal: boolean = false;

  addingNewTag: boolean = false;
  tags: ITag[] = [];

  @Input() authorized: boolean = false;

  openedImage: openedImage = null;
  @Input()
  set inputImage(image: IImage | null) {
    if (image) this.openImageModal(image);
    else this.closeImageModal();
  }
  get inputImage(): IImage | null {
    return this.openedImage;
  }

  @Output()
  toggleTagOnImageInGrid = new EventEmitter<{ tag: ITag; image: IImage }>();
  @Output() closeModal = new EventEmitter<void>();

  constructor(
    private readonly apiService: ApiService,
    private readonly authService: AuthorizationService,
    private readonly tagsColorService: TagsColorService,
    private readonly cdr: ChangeDetectorRef,
    private readonly tagsService: TagsService
  ) {
    this.tagsService.tags.length === 0
      ? this.tagsService.$tags
      : of(this.tagsService.tags).subscribe((tags) => {
          this.tags = tags;
        });
  }

  ngOnInit() {}

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
        .subscribe(() => {});
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
    this.closeModal.next();
    setTimeout(() => {
      this.openedImage = null;
      this.cdr.markForCheck();
    }, 500);
  }
}
