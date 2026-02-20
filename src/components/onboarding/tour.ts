import { driver } from 'driver.js';
import { tourSteps } from './steps';
import { toPersianDigits } from '../CourseNode';

export function startTour(): void {
  const driverInstance = driver({
    steps: tourSteps,
    showProgress: true,
    progressText: '{{current}} از {{total}}',
    nextBtnText: 'بعدی',
    prevBtnText: 'قبلی',
    doneBtnText: 'پایان',
    allowClose: true,
    allowKeyboardControl: true,
    animate: true,
    smoothScroll: true,
    overlayOpacity: 0.5,
    stagePadding: 8,
    stageRadius: 8,
    popoverOffset: 12,
    showButtons: ['next', 'previous', 'close'],
    onPopoverRender: (popover) => {
      popover.progress.textContent = toPersianDigits(
        popover.progress.textContent || '',
      );
    },
  });

  driverInstance.drive();
}
