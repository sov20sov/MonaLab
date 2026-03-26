/** شكل عنصر المستند كما يعاد من GET /api/documents */
export type DocumentListItem = {
  id: string;
  title: string;
  content: string | null;
  projectId: string;
  createdAt: string;
  updatedAt: string;
};

/** للعرض في القائمة بعد تنسيق التاريخ */
export type DocumentListRow = Omit<DocumentListItem, "updatedAt"> & {
  updatedAt: string;
};
