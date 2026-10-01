export type CmsPageStatus = 'draft' | 'published';

export interface CmsPage {
  id: string;
  slug: string;
  title: string;
  status: CmsPageStatus;
  currentVersionId: string | null;
  /** Convenience join of the current version's content, if the backend includes it on the list/detail response. */
  currentContent?: string;
  createdAt: string;
  updatedAt: string;
}

/** Immutable snapshot — every save while editing creates a new row and repoints `CmsPage.currentVersionId`, never mutates a past version. */
export interface CmsPageVersion {
  id: string;
  pageId: string;
  content: string;
  createdByUserId: string;
  createdAt: string;
}

export interface CreateCmsPageInput {
  slug: string;
  title: string;
  content: string;
}

export interface UpdateCmsPageInput {
  title?: string;
  slug?: string;
  status?: CmsPageStatus;
}

export interface CreateCmsPageVersionInput {
  content: string;
}
