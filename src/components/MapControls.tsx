import { useCallback, useState, useEffect } from 'react';
import { Panel, MiniMap, useReactFlow, useViewport } from '@xyflow/react';
import { toPersianDigits } from './CourseNode';

const MIN_ZOOM = 0.2;
const MAX_ZOOM = 2.5;

// Convert zoom level to slider position (logarithmic for natural feel)
function zoomToSlider(zoom: number) {
  return ((Math.log(zoom) - Math.log(MIN_ZOOM)) / (Math.log(MAX_ZOOM) - Math.log(MIN_ZOOM))) * 100;
}
function sliderToZoom(val: number) {
  return MIN_ZOOM * Math.pow(MAX_ZOOM / MIN_ZOOM, val / 100);
}

interface MapControlsProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export default function MapControls({ containerRef }: MapControlsProps) {
  const { zoomIn, zoomOut, fitView, zoomTo } = useReactFlow();
  const { zoom } = useViewport();
  const [showMinimap, setShowMinimap] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const zoomPercent = Math.round(zoom * 100);
  const sliderValue = zoomToSlider(zoom);

  const handleSliderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newZoom = sliderToZoom(Number(e.target.value));
      zoomTo(newZoom, { duration: 80 });
    },
    [zoomTo],
  );

  const resetZoom = useCallback(() => {
    zoomTo(1, { duration: 200 });
  }, [zoomTo]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }, [containerRef]);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  // Intercept Ctrl+/- to zoom the mindmap instead of the browser
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      if (e.key === '=' || e.key === '+') {
        e.preventDefault();
        zoomIn({ duration: 200 });
      } else if (e.key === '-') {
        e.preventDefault();
        zoomOut({ duration: 200 });
      } else if (e.key === '0') {
        e.preventDefault();
        zoomTo(1, { duration: 200 });
      }
    };
    window.addEventListener('keydown', handler, { capture: true });
    return () => window.removeEventListener('keydown', handler, { capture: true });
  }, [zoomIn, zoomOut, zoomTo]);

  const btnBase =
    'flex items-center justify-center rounded-lg transition-all cursor-pointer select-none';
  const btnSize = 'w-9 h-9 sm:w-10 sm:h-10';
  const btnColor =
    'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 active:scale-95';
  const btnActive =
    'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 hover:bg-primary-100 dark:hover:bg-primary-800/40 active:scale-95';

  return (
    <>
      <Panel position="bottom-center" className="!mb-3 !mx-2">
        <div className="flex items-center gap-0.5 sm:gap-1 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/80 dark:border-gray-700/80 px-1.5 sm:px-2.5 py-1.5 sm:py-2">
          {/* Zoom out */}
          <button
            onClick={() => zoomOut({ duration: 200 })}
            className={`${btnBase} ${btnSize} ${btnColor}`}
            title="کوچک‌نمایی (Ctrl −)"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>

          {/* Zoom slider */}
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={sliderValue}
            onChange={handleSliderChange}
            className="zoom-slider w-20 sm:w-28 h-9 sm:h-10 cursor-pointer"
            title="بزرگنمایی"
          />

          {/* Zoom percentage — click to reset to 100% */}
          <button
            onClick={resetZoom}
            className={`${btnBase} h-9 sm:h-10 px-2 min-w-[3rem] text-xs sm:text-sm font-semibold tabular-nums ${
              zoomPercent === 100
                ? 'text-primary-600 dark:text-primary-400'
                : 'text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400'
            }`}
            title="بازنشانی بزرگنمایی به ۱۰۰٪"
          >
            ٪{toPersianDigits(zoomPercent)}
          </button>

          {/* Zoom in */}
          <button
            onClick={() => zoomIn({ duration: 200 })}
            className={`${btnBase} ${btnSize} ${btnColor}`}
            title="بزرگ‌نمایی (Ctrl +)"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>

          {/* Divider */}
          <div className="w-px h-6 bg-gray-200 dark:bg-gray-600 mx-0.5 sm:mx-1 shrink-0" />

          {/* Fit view */}
          <button
            onClick={() => fitView({ padding: 0.08, duration: 300 })}
            className={`${btnBase} ${btnSize} ${btnColor}`}
            title="نمایش کل نقشه"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h6v6" /><path d="M9 21H3v-6" />
              <path d="M21 3l-7 7" /><path d="M3 21l7-7" />
            </svg>
          </button>

          {/* Minimap toggle */}
          <button
            onClick={() => setShowMinimap((v) => !v)}
            className={`${btnBase} ${btnSize} ${showMinimap ? btnActive : btnColor}`}
            title={showMinimap ? 'بستن نقشه کوچک' : 'نقشه کوچک'}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <rect x="12" y="12" width="9" height="9" rx="1" />
            </svg>
          </button>

          {/* Fullscreen toggle */}
          <button
            onClick={toggleFullscreen}
            className={`${btnBase} ${btnSize} ${isFullscreen ? btnActive : btnColor}`}
            title={isFullscreen ? 'خروج از تمام‌صفحه' : 'تمام‌صفحه'}
          >
            {isFullscreen ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 14h6v6" /><path d="M20 10h-6V4" />
                <path d="M14 10l7-7" /><path d="M3 21l7-7" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 3H5a2 2 0 0 0-2 2v3" />
                <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
                <path d="M3 16v3a2 2 0 0 0 2 2h3" />
                <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
              </svg>
            )}
          </button>
        </div>
      </Panel>

      {/* MiniMap — toggled by the control button */}
      {showMinimap && (
        <MiniMap
          position="bottom-right"
          pannable
          zoomable
          className="!bg-white/90 dark:!bg-gray-800/90 !backdrop-blur-sm !border !border-gray-200 dark:!border-gray-700 !rounded-xl !shadow-lg !mb-16 !mr-3"
          maskColor="rgba(0,0,0,0.08)"
          nodeColor={(node) => {
            if (node.data?.completed) return '#22c55e';
            if (node.data?.dimmed) return '#d1d5db';
            const cat = node.data?.category;
            if (cat === 'base') return '#3b82f6';
            if (cat === 'specialized') return '#f43f5e';
            if (cat === 'elective') return '#f59e0b';
            if (cat === 'special') return '#10b981';
            return '#6b7280';
          }}
        />
      )}
    </>
  );
}
