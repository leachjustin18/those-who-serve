import { useState, type RefObject, type ChangeEvent } from "react";

export function useFilePreview() {
  const [file, setFile] = useState<File | undefined>(undefined);
  const [previewFile, setPreviewFile] = useState<string | undefined>(undefined);

  const onFileChange = (
    e: ChangeEvent<HTMLInputElement>,
    photoInputRef: RefObject<HTMLInputElement | null>,
  ) => {
    const f = e.target.files?.[0];
    let nextPreview: string | undefined;

    if (f) {
      if (previewFile) {
        URL.revokeObjectURL(previewFile);
      }
      setFile(f);
      nextPreview = URL.createObjectURL(f);
      setPreviewFile(nextPreview);
    } else {
      if (previewFile) {
        URL.revokeObjectURL(previewFile);
      }
      setFile(undefined);
      setPreviewFile(undefined);
    }

    if (photoInputRef?.current?.value) {
      photoInputRef.current.value = "";
    }

    return nextPreview;
  };

  const clearFile = () => {
    if (previewFile) {
      URL.revokeObjectURL(previewFile);
    }
    setFile(undefined);
    setPreviewFile(undefined);
  };

  return { file, previewFile, onFileChange, clearFile };
}
