import type { DriveStep } from 'driver.js';

export const tourSteps: DriveStep[] = [
  {
    element: '[data-tour="legend"]',
    popover: {
      title: 'فیلتر دسته‌بندی دروس',
      description:
        'با کلیک روی هر دسته (پایه، تخصصی، اختیاری، خاص) می‌توانید دروس مربوطه را فیلتر کنید.',
      side: 'bottom',
      align: 'end',
    },
  },
  {
    element: '.react-flow__node',
    popover: {
      title: 'ثبت درس گذرانده',
      description:
        'روی هر درس کلیک کنید تا جزئیات آن باز شود. سپس دکمه «گذرانده‌ام» را بزنید تا درس به عنوان گذرانده ثبت شود.',
      side: 'left',
      align: 'center',
    },
  },
  {
    element: '[data-tour="available-toggle"]',
    popover: {
      title: 'نمایش دروس قابل اخذ',
      description:
        'با فعال کردن این گزینه، فقط دروسی که پیشنیازهایشان را گذرانده‌اید رنگی نمایش داده می‌شوند.',
      side: 'bottom',
      align: 'start',
    },
  },
];
