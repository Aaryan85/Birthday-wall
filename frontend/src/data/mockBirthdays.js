// Mock data for the Birthday Wall
export const INITIAL_BIRTHDAYS = [
  {
    id: "b-0",
    name: "Arjun Kapoor",
    date: getRelativeDate(0),
  },
  {
    id: "b-0b",
    name: "Maya Lin",
    date: getRelativeDate(0),
  },
  {
    id: "b-1",
    name: "Rahul Sharma",
    date: getRelativeDate(3),
  },
  {
    id: "b-2",
    name: "Sneha Patil",
    date: getRelativeDate(6),
  },
  {
    id: "b-3",
    name: "Aditya Mehta",
    date: getRelativeDate(13),
  },
  {
    id: "b-4",
    name: "Ananya Iyer",
    date: getRelativeDate(18),
  },
  {
    id: "b-5",
    name: "Vikram Singhania",
    date: getRelativeDate(22),
  },
  {
    id: "b-6",
    name: "Pooja Deshmukh",
    date: getRelativeDate(29),
  },
  {
    id: "b-7",
    name: "Rohan Varma",
    date: getRelativeDate(35),
  },
  {
    id: "b-8",
    name: "Tanvi Kulkarni",
    date: getRelativeDate(42),
  },
  {
    id: "b-9",
    name: "Karan Malhotra",
    date: getRelativeDate(50),
  },
  {
    id: "b-10",
    name: "Isha Sundaram",
    date: getRelativeDate(64),
  },
  {
    id: "b-11",
    name: "Dev Patel",
    date: getRelativeDate(78),
  }
];

function getRelativeDate(daysFromNow) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatBirthdayDisplay(dateString) {
  if (!dateString) return { monthStr: '', dayStr: '', formatted: '', fullFormatted: '' };
  
  const parts = typeof dateString === 'string' && dateString.includes('T')
    ? dateString.split('T')[0].split('-')
    : (typeof dateString === 'string' ? dateString.split('-') : []);
    
  let month, day;
  if (parts.length >= 3) {
    month = parseInt(parts[1], 10) - 1;
    day = parseInt(parts[2], 10);
  } else {
    const d = new Date(dateString);
    month = d.getMonth();
    day = d.getDate();
  }
  
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const fullMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
  const monthStr = months[month] || '';
  const dayStr = String(day).padStart(2, '0');
  
  return {
    monthStr,
    dayStr,
    formatted: `${monthStr} ${dayStr}`,
    fullFormatted: `${fullMonths[month]} ${day}`,
    monthIndex: month,
    dayNum: day
  };
}

export function calculateDaysRemaining(dateString) {
  if (!dateString) return { days: 0, isToday: false, isTomorrow: false, label: '' };
  
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  
  let targetMonth, targetDay;
  if (typeof dateString === 'string' && dateString.includes('-')) {
    const parts = dateString.includes('T') ? dateString.split('T')[0].split('-') : dateString.split('-');
    targetMonth = parseInt(parts[1], 10) - 1;
    targetDay = parseInt(parts[2], 10);
  } else {
    const d = new Date(dateString);
    targetMonth = d.getMonth();
    targetDay = d.getDate();
  }
  
  let target = new Date(now.getFullYear(), targetMonth, targetDay);
  target.setHours(0, 0, 0, 0);
  
  if (target < now) {
    target.setFullYear(now.getFullYear() + 1);
  }
  
  const diffTime = target.getTime() - now.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  
  const isToday = diffDays === 0;
  const isTomorrow = diffDays === 1;
  
  let label = '';
  if (isToday) {
    label = 'Celebrating today!';
  } else if (isTomorrow) {
    label = 'Tomorrow';
  } else if (diffDays === 1) {
    label = '1 day to go';
  } else {
    label = `${diffDays} days to go`;
  }
  
  return {
    days: diffDays,
    isToday,
    isTomorrow,
    label
  };
}
