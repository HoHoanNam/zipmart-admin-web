import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { ModerateReviewInput, Review } from '../../core/models/review.model';

@Injectable({ providedIn: 'root' })
export class ReviewsAdminService {
  private readonly http = inject(HttpClient);

  findAll(): Promise<Review[]> {
    return firstValueFrom(this.http.get<Review[]>(`${environment.apiUrl}/reviews/admin`));
  }

  moderate(id: string, input: ModerateReviewInput): Promise<Review> {
    return firstValueFrom(
      this.http.patch<Review>(`${environment.apiUrl}/reviews/admin/${id}`, input),
    );
  }
}
