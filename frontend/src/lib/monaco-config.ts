// Export Monaco types from monaco-editor package
// @monaco-editor/react handles worker configuration automatically,
// but we still need Monaco types for other components that use the Monaco API directly
import * as Monaco from "monaco-editor";

export { Monaco };
