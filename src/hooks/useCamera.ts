"use client";

import { useState, useRef, useCallback, type ChangeEvent } from "react";

export function useCamera() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openCamera = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 이미지 리사이징 (모바일 카메라 사진은 매우 크므로)
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxSize = 1024; // 최대 1024px
        let { width, height } = img;

        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = (height / width) * maxSize;
            width = maxSize;
          } else {
            width = (width / height) * maxSize;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);

        const resized = canvas.toDataURL("image/jpeg", 0.8);
        setImagePreview(resized);
        setImageBase64(resized);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);

    // input 초기화 (같은 파일 다시 선택 가능)
    e.target.value = "";
  }, []);

  const clearImage = useCallback(() => {
    setImagePreview(null);
    setImageBase64(null);
  }, []);

  return { imagePreview, imageBase64, openCamera, handleFileChange, clearImage, fileInputRef };
}
