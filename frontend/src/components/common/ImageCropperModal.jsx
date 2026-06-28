import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { X, ZoomIn, RotateCw, Check, Loader2 } from 'lucide-react';

const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

const getCroppedBlob = async (imageSrc, pixelCrop, rotation = 0) => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  const maxSize = Math.max(image.width, image.height);
  const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));
  canvas.width = safeArea;
  canvas.height = safeArea;

  ctx.translate(safeArea / 2, safeArea / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.translate(-safeArea / 2, -safeArea / 2);
  ctx.drawImage(
    image,
    safeArea / 2 - image.width * 0.5,
    safeArea / 2 - image.height * 0.5
  );
  const data = ctx.getImageData(0, 0, safeArea, safeArea);

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.putImageData(
    data,
    Math.round(0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x),
    Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y)
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, 'image/jpeg', 0.9);
  });
};

const ImageCropperModal = ({ imageSrc, aspect = 4 / 3, title = 'Crop Image', onCropComplete, onClose }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [processing, setProcessing] = useState(false);

  const onCropCompleteCallback = useCallback((croppedArea, croppedAreaPx) => {
    setCroppedAreaPixels(croppedAreaPx);
  }, []);

  const handleConfirm = async () => {
    setProcessing(true);
    try {
      const croppedBlob = await getCroppedBlob(imageSrc, croppedAreaPixels, rotation);
      const croppedUrl = URL.createObjectURL(croppedBlob);
      onCropComplete(croppedUrl, croppedBlob);
    } catch (err) {
      console.error('Crop failed:', err);
    } finally {
      setProcessing(false);
    }
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  return (
    <div className="image-cropper-overlay" onClick={onClose}>
      <div className="image-cropper-modal" onClick={(e) => e.stopPropagation()}>
        <div className="image-cropper-header">
          <span className="image-cropper-title">{title}</span>
          <button className="image-cropper-close" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="image-cropper-body">
          <div className="image-cropper-area">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={aspect}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropCompleteCallback}
            />
          </div>
        </div>

        <div className="image-cropper-controls">
          <div className="image-cropper-zoom">
            <ZoomIn size={16} />
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="image-cropper-zoom-slider"
            />
          </div>
          <button
            className="image-cropper-rotate-btn"
            onClick={handleRotate}
            aria-label="Rotate 90 degrees"
            title="Rotate"
          >
            <RotateCw size={18} />
          </button>
        </div>

        <div className="image-cropper-actions">
          <button className="btn image-cropper-cancel" onClick={onClose} disabled={processing}>
            Cancel
          </button>
          <button className="btn image-cropper-confirm" onClick={handleConfirm} disabled={processing}>
            {processing ? <Loader2 size={16} className="spin" /> : <Check size={16} />}
            {processing ? 'Processing…' : 'Apply Crop'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropperModal;