import React, { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from './icons/Icons';

// Returns a Date object where the UTC date/time parts are the current date/time in IST.
export const getISTNow = (): Date => {
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hourCycle: 'h23',
  };
  
  const formatter = new Intl.DateTimeFormat('en-US', options);
  const parts = formatter.formatToParts(now);
  
  const values: { [key: string]: string } = {};
  for (const part of parts) {
    if (part.type !== 'literal') {
      values[part.type] = part.value;
    }
  }

  const year = parseInt(values.year);
  const month = parseInt(values.month) - 1; // JS month is 0-indexed
  const day = parseInt(values.day);
  const hour = parseInt(values.hour === '24' ? '0' : values.hour); // Handle midnight case
  const minute = parseInt(values.minute);
  const second = parseInt(values.second);
  
  return new Date(Date.UTC(year, month, day, hour, minute, second));
};


// Helper to get days for a calendar month view
const getMonthDays = (date: Date): (Date | null)[] => {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();

  const firstDayOfMonth = new Date(Date.UTC(year, month, 1));
  const lastDayOfMonth = new Date(Date.UTC(year, month + 1, 0));

  const daysInMonth = lastDayOfMonth.getUTCDate();
  const startDayOfWeek = (firstDayOfMonth.getUTCDay() + 6) % 7;

  const days: (Date | null)[] = [];

  for (let i = 0; i < startDayOfWeek; i++) {
    days.push(null);
  }

  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(Date.UTC(year, month, i)));
  }

  while (days.length % 7 !== 0) {
    days.push(null);
  }

  return days;
};

const isSameDay = (date1: Date, date2: Date): boolean => {
  if (!date1 || !date2) return false;
  return date1.getUTCFullYear() === date2.getUTCFullYear() &&
         date1.getUTCMonth() === date2.getUTCMonth() &&
         date1.getUTCDate() === date2.getUTCDate();
};

interface CalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

const Calendar: React.FC<CalendarProps> = ({ selectedDate, onSelectDate }) => {
  const [viewDate, setViewDate] = useState(selectedDate);
  const today = getISTNow();

  const handlePrevMonth = () => {
    setViewDate(new Date(Date.UTC(viewDate.getUTCFullYear(), viewDate.getUTCMonth() - 1, 1)));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(Date.UTC(viewDate.getUTCFullYear(), viewDate.getUTCMonth() + 1, 1)));
  };
  
  const monthDays = getMonthDays(viewDate);
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const monthName = viewDate.toLocaleString('en-US', { month: 'long', timeZone: 'UTC' });
  const year = viewDate.getUTCFullYear();

  return (
    <div className="bg-surface/50 backdrop-blur-xl p-6 rounded-box shadow-card border border-white/20 dark:bg-neutral-900/50 dark:border-white/10 transition-colors duration-300">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold dark:text-white">{monthName} {year}</h2>
        <div className="flex space-x-1">
          <button onClick={handlePrevMonth} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-white/20 dark:hover:bg-white/10 transition-colors" aria-label="Previous month">
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <button onClick={handleNextMonth} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-white/20 dark:hover:bg-white/10 transition-colors" aria-label="Next month">
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {dayNames.map(day => (
          <div key={day} className="font-semibold text-sm text-neutral-content/70 dark:text-neutral-400 mb-2">{day}</div>
        ))}
        {monthDays.map((day, index) => {
          if (!day) {
            return <div key={index} className="h-10 w-10"></div>;
          }
          const isToday = isSameDay(day, today);
          const isSelected = isSameDay(day, selectedDate);
          return (
            <button
              key={index}
              onClick={() => onSelectDate(day)}
              className={`flex items-center justify-center p-2 rounded-full cursor-pointer transition-all duration-200 h-10 w-10 mx-auto font-medium ${
                isSelected
                  ? 'bg-primary text-primary-content font-bold shadow-lg scale-110'
                  : isToday
                  ? 'bg-primary/20 text-primary ring-2 ring-primary/50'
                  : 'hover:bg-primary/10 dark:text-white dark:hover:bg-primary/20'
              }`}
            >
              {day.getUTCDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;