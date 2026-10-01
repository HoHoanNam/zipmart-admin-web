import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import type {
  CmsPage,
  CmsPageVersion,
  CreateCmsPageInput,
  CreateCmsPageVersionInput,
  UpdateCmsPageInput,
} from '../../core/models/cms-page.model';

@Injectable({ providedIn: 'root' })
export class CmsAdminService {
  private readonly http = inject(HttpClient);

  findAll(): Promise<CmsPage[]> {
    return firstValueFrom(this.http.get<CmsPage[]>(`${environment.apiUrl}/cms/pages`));
  }

  findOne(id: string): Promise<CmsPage> {
    return firstValueFrom(this.http.get<CmsPage>(`${environment.apiUrl}/cms/pages/${id}`));
  }

  create(input: CreateCmsPageInput): Promise<CmsPage> {
    return firstValueFrom(this.http.post<CmsPage>(`${environment.apiUrl}/cms/pages`, input));
  }

  update(id: string, input: UpdateCmsPageInput): Promise<CmsPage> {
    return firstValueFrom(
      this.http.patch<CmsPage>(`${environment.apiUrl}/cms/pages/${id}`, input),
    );
  }

  remove(id: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${environment.apiUrl}/cms/pages/${id}`));
  }

  findVersions(pageId: string): Promise<CmsPageVersion[]> {
    return firstValueFrom(
      this.http.get<CmsPageVersion[]>(`${environment.apiUrl}/cms/pages/${pageId}/versions`),
    );
  }

  createVersion(pageId: string, input: CreateCmsPageVersionInput): Promise<CmsPageVersion> {
    return firstValueFrom(
      this.http.post<CmsPageVersion>(`${environment.apiUrl}/cms/pages/${pageId}/versions`, input),
    );
  }

  restoreVersion(pageId: string, versionId: string): Promise<CmsPage> {
    return firstValueFrom(
      this.http.post<CmsPage>(
        `${environment.apiUrl}/cms/pages/${pageId}/versions/${versionId}/restore`,
        {},
      ),
    );
  }
}
