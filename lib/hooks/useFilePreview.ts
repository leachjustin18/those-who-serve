import { useState, type RefObject, type ChangeEvent } from "react";

export function useFilePreview() {
  const [file, setFile] = useState<File | undefined>(undefined);
  const [previewFile, setPreviewFile] = useState<string | undefined>(undefined);

  const onFileChange = (
    e: ChangeEvent<HTMLInputElement>,
    photoInputRef: RefObject<HTMLInputElement | null>,
  ) => {
    const f = e.target.files?.[0];

    if (f) {
      if (previewFile) {
        URL.revokeObjectURL(previewFile);
      }
      setFile(f);
      setPreviewFile(URL.createObjectURL(f));
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
