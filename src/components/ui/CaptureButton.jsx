import { useMemo, useState } from 'react';
import { useBudgetStore } from '../../store/budgetStore.js';
import { useGameStore } from '../../store/gameStore.js';
import { canvasToBlob, captureScreenshot, downloadCanvasAsPng } from '../../utils/screenshotCapture.js';

function sanitizeFileName(value) {
  return String(value || 'my-payday-kingdom')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'my-payday-kingdom';
}

export default function CaptureButton({ captureContext, onCaptureStateChange }) {
  const [isCapturing, setIsCapturing] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [captureCanvas, setCaptureCanvas] = useState(null);
  const [previewDataUrl, setPreviewDataUrl] = useState('');
  const [message, setMessage] = useState('');

  const kingdomName = useBudgetStore((state) => state.kingdomName || 'My Payday Kingdom');

  const fileName = useMemo(() => sanitizeFileName(kingdomName), [kingdomName]);

  const onCaptureClick = async () => {
    if (!captureContext?.renderer || !captureContext?.scene || !captureContext?.camera || isCapturing) {
      return;
    }

    setIsCapturing(true);
    setMessage('');
    onCaptureStateChange?.(true);

    try {
      await new Promise((resolve) => window.setTimeout(resolve, 40));
      const canvas = await captureScreenshot(
        captureContext.renderer,
        captureContext.scene,
        captureContext.camera,
        useGameStore.getState(),
        useBudgetStore.getState()
      );

      setCaptureCanvas(canvas);
      setPreviewDataUrl(canvas.toDataURL('image/png'));
      setIsOpen(true);
      setMessage('Kingdom captured. Choose an action.');
    } catch {
      setMessage('Capture failed. Please try again.');
    } finally {
      onCaptureStateChange?.(false);
      setIsCapturing(false);
    }
  };

  const onDownload = () => {
    if (!captureCanvas) {
      return;
    }

    downloadCanvasAsPng(captureCanvas, fileName);
    setMessage('PNG downloaded.');
  };

  const onCopy = async () => {
    if (!captureCanvas) {
      return;
    }

    if (!navigator.clipboard || (typeof navigator.clipboard.write !== 'function' && typeof navigator.clipboard.writeImage !== 'function')) {
      setMessage('Clipboard image copy is not supported in this browser.');
      return;
    }

    try {
      const blob = await canvasToBlob(captureCanvas);

      if (typeof navigator.clipboard.writeImage === 'function') {
        await navigator.clipboard.writeImage(blob);
      } else {
        if (typeof ClipboardItem === 'undefined') {
          throw new Error('ClipboardItem is unavailable.');
        }

        await navigator.clipboard.write([
          new ClipboardItem({
            'image/png': blob
          })
        ]);
      }

      setMessage('Copied screenshot to clipboard.');
    } catch {
      setMessage('Clipboard copy failed. Use Download instead.');
    }
  };

  const onShare = async () => {
    if (!captureCanvas) {
      return;
    }

    if (typeof navigator.share !== 'function') {
      onDownload();
      setMessage('Native share unavailable here. Downloaded instead.');
      return;
    }

    try {
      const blob = await canvasToBlob(captureCanvas);
      const file = new File([blob], `${fileName}.png`, { type: 'image/png' });
      const payload = {
        title: kingdomName,
        text: 'My Payday Kingdom progress',
        files: [file]
      };

      if (typeof navigator.canShare === 'function' && !navigator.canShare({ files: payload.files })) {
        onDownload();
        setMessage('This device cannot share files directly. Downloaded instead.');
        return;
      }

      await navigator.share(payload);
      setMessage('Shared successfully.');
    } catch {
      setMessage('Share cancelled or unavailable.');
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={onCaptureClick}
        disabled={!captureContext || isCapturing}
        className="min-h-11 rounded-md border border-white/25 bg-slate-800/80 px-3 text-xs font-semibold text-white transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Capture kingdom screenshot"
        title="Capture kingdom screenshot"
      >
        {isCapturing ? 'CAPTURING...' : 'CAPTURE'}
      </button>

      {isOpen && (
        <div className="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <div className="w-full max-w-3xl rounded-xl border border-white/15 bg-slate-950 p-4 shadow-2xl sm:p-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="font-pixel text-xs text-amber-300 sm:text-sm">Screenshot & Share</h2>
              <button
                type="button"
                className="min-h-11 rounded border border-white/20 bg-slate-800 px-3 text-xs text-white hover:bg-slate-700"
                onClick={() => setIsOpen(false)}
              >
                Close
              </button>
            </div>

            {previewDataUrl ? (
              <img src={previewDataUrl} alt="Kingdom capture preview" className="max-h-[52vh] w-full rounded-lg border border-white/20 object-contain" />
            ) : null}

            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={onDownload}
                className="min-h-11 flex-1 rounded-lg border border-emerald-300/40 bg-emerald-600/85 px-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
              >
                Download PNG
              </button>
              <button
                type="button"
                onClick={onCopy}
                className="min-h-11 flex-1 rounded-lg border border-slate-300/30 bg-slate-700 px-3 text-sm font-semibold text-white transition-colors hover:bg-slate-600"
              >
                Copy to Clipboard
              </button>
              <button
                type="button"
                onClick={onShare}
                className="min-h-11 flex-1 rounded-lg border border-sky-300/30 bg-sky-700/80 px-3 text-sm font-semibold text-white transition-colors hover:bg-sky-600"
              >
                Share
              </button>
            </div>

            {message ? <p className="mt-3 text-xs text-slate-300">{message}</p> : null}
          </div>
        </div>
      )}
    </>
  );
}
