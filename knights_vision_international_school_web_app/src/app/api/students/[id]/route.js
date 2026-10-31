// Legacy route adapter. Existing clients keep their URL while inheriting the
// scoped RBAC checks and validation from the school-panel implementation.
export { PUT, DELETE } from '@/src/app/api-schools-panel/students/[id]/route';
