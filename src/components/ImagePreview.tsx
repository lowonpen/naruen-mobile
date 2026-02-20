"use client";

interface ImagePreviewProps {
  src: string;
  onRemove: () => void;
}

export default function ImagePreview({ src, onRemove }: ImagePreviewProps) {
  return (
    <div className="relative inline-block mx-3 mb-2">
      <img
        src={src}
        alt="첨부 이미지"
        className="h-20 w-20 object-cover rounded-lg border border-gray-200"
      />
      <button
        onClick={onRemove}
        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gray-700 text-white rounded-full text-xs flex items-center justify-center hover:bg-gray-900"
        aria-label="이미지 제거"
      >
        ×
      </button>
    </div>
  );
}
