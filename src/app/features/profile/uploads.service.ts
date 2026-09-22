import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface UploadedImage {
  url: string;
  publicId: string;
}

@Injectable({ providedIn: 'root' })
export class UploadsService {
  private readonly http = inject(HttpClient);

  uploadAvatar(file: File): Promise<UploadedImage> {
    const formData = new FormData();
    formData.append('file', file);
    return firstValueFrom(
      this.http.post<UploadedImage>(`${environment.apiUrl}/uploads/avatar`, formData),
    );
  }
}
