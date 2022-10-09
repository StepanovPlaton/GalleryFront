import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { of } from 'rxjs';
import { IImage, ITag } from 'src/app/shared/models/image.model';
import { ApiService } from 'src/app/shared/services/api.service';
import { AuthorizationService } from 'src/app/shared/services/authorization.service';
import { TagsService } from 'src/app/shared/services/tags.service';

type openedImage =
  | (IImage & { imageData?: string; previewData?: string })
  | null;

@Component({
  selector: 'app-image-view',
  templateUrl: './image-view.component.html',
  styleUrls: ['./image-view.component.scss'],
})
export class ImageViewComponent implements OnInit {
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
  toggleTagOnImageInGrid = new EventEmitter<ITag>();
  @Output() closeModal = new EventEmitter<void>();

  constructor(
    private readonly apiService: ApiService,
    private readonly cdr: ChangeDetectorRef,
    private readonly tagsService: TagsService
  ) {
    this.tagsService.getTags().subscribe((tags) => {
      this.tags = tags;
    });
  }

  ngOnInit() {}

  getTagSelectedForImage(tag: ITag) {
    return this.openedImage
      ? this.openedImage.tags.some((_tag) => _tag.tagId === tag.tagId)
      : false;
  }

  toggleTagOnImage(tag: ITag) {
    if (this.openedImage) {
      (this.getTagSelectedForImage(tag)
        ? this.apiService.deleteTagFromImage
        : this.apiService.addTagToImage
      )
        .bind(this.apiService)(this.openedImage.imageId, tag.tagId)
        .subscribe(() => {
          this.toggleTagOnImageInGrid.next(tag);
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
