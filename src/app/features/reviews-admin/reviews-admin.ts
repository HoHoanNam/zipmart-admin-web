import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { Review } from '../../core/models/review.model';
import { ProductsAdminService } from '../products-admin/products-admin.service';
import { ReviewsAdminService } from './reviews-admin.service';

@Component({
  selector: 'app-reviews-admin',
  imports: [FormsModule, DatePipe],
  templateUrl: './reviews-admin.html',
})
export class ReviewsAdmin {
  private readonly reviewsService = inject(ReviewsAdminService);
  private readonly productsAdminService = inject(ProductsAdminService);

  readonly reviews = signal<Review[]>([]);
  readonly productNameById = signal<Map<string, string>>(new Map());
  readonly loading = signal(true);
  readonly savingReplyId = signal<string | null>(null);
  readonly replyDraft = signal<Record<string, string>>({});

  readonly hideHidden = signal(false);
  readonly visibleReviews = computed(() =>
    this.hideHidden() ? this.reviews().filter((r) => !r.hidden) : this.reviews(),
  );

  constructor() {
    void this.load();
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    try {
      const [reviews, productPage] = await Promise.all([
        this.reviewsService.findAll(),
        this.productsAdminService.findAll({ limit: 100 }),
      ]);
      this.reviews.set(reviews);
      this.productNameById.set(new Map(productPage.items.map((p) => [p.id, p.name])));
      this.replyDraft.set(Object.fromEntries(reviews.map((r) => [r.id, r.adminReply ?? ''])));
    } finally {
      this.loading.set(false);
    }
  }

  productName(review: Review): string {
    return this.productNameById().get(review.productId) ?? review.productId;
  }

  draftFor(reviewId: string): string {
    return this.replyDraft()[reviewId] ?? '';
  }

  updateDraft(reviewId: string, value: string): void {
    this.replyDraft.update((drafts) => ({ ...drafts, [reviewId]: value }));
  }

  async toggleHidden(review: Review): Promise<void> {
    const updated = await this.reviewsService.moderate(review.id, { hidden: !review.hidden });
    this.applyUpdate(updated);
  }

  async saveReply(review: Review): Promise<void> {
    this.savingReplyId.set(review.id);
    try {
      const updated = await this.reviewsService.moderate(review.id, {
        adminReply: this.draftFor(review.id),
      });
      this.applyUpdate(updated);
    } finally {
      this.savingReplyId.set(null);
    }
  }

  private applyUpdate(updated: Review): void {
    this.reviews.update((list) => list.map((r) => (r.id === updated.id ? updated : r)));
  }
}
