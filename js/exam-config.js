// ═══════════════════════════════════════════════════════
// js/exam-config.js (UPDATED with Timing Control)
// 40 நாள் தேர்வு திட்டம் + நேர கட்டுப்பாடு
// ═══════════════════════════════════════════════════════

// தேர்வு பிரிவுகள்
export const EXAM_CATEGORIES = {
  MATHS_SCIENCE: {
    id: 'maths_science',
    name: 'கணிதம் & அறிவியல்',
    englishName: 'Maths & Science',
    icon: '🔢🔬',
    color: '#0f766e',
    startDay: 1,
    endDay: 20,
    totalDays: 20
  },
  SOCIAL: {
    id: 'social',
    name: 'சமூக அறிவியல்',
    englishName: 'Social Science',
    icon: '🌍📜',
    color: '#4338ca',
    startDay: 21,
    endDay: 40,
    totalDays: 20
  }
};

// தேர்வு அட்டவணை (40 நாட்கள்)
export const EXAM_SCHEDULE = {
  startDate: '2026-05-20',  // ⚠️ உங்கள் தொடக்க தேதி
  totalDays: 40,
  
  // ஒவ்வொரு நாளும் என்ன தேர்வு
  getDayConfig: function(dayNumber) {
    if (dayNumber >= 1 && dayNumber <= 20) {
      return {
        dayNumber,
        category: EXAM_CATEGORIES.MATHS_SCIENCE,
        examTitle: `Day ${dayNumber} - கணிதம் & அறிவியல்`,
        totalQuestions: 50,
        duration: 60, // minutes
        examId: `maths_science_day_${dayNumber}`
      };
    } else if (dayNumber >= 21 && dayNumber <= 40) {
      const socialDay = dayNumber - 20;
      return {
        dayNumber,
        category: EXAM_CATEGORIES.SOCIAL,
        examTitle: `Day ${dayNumber} - சமூக அறிவியல்`,
        totalQuestions: 50,
        duration: 60,
        examId: `social_day_${socialDay}`
      };
    }
    return null;
  },
  
  // இன்றைய நாள் எண் கண்டுபிடிக்க
  getCurrentDayNumber: function() {
    const start = new Date(this.startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    start.setHours(0, 0, 0, 0);
    
    const diffTime = today - start;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 0;
    if (diffDays >= this.totalDays) return -1;
    
    return diffDays + 1;
  },
  
  // குறிப்பிட்ட நாளின் தேதி
  getDateForDay: function(dayNumber) {
    if (dayNumber < 1 || dayNumber > this.totalDays) return null;
    
    const start = new Date(this.startDate);
    start.setDate(start.getDate() + (dayNumber - 1));
    return start.toISOString().split('T')[0];
  },
  
  // இன்றைய தேர்வு config
  getTodayExam: function() {
    const dayNumber = this.getCurrentDayNumber();
    if (dayNumber <= 0 || dayNumber > this.totalDays) return null;
    
    const config = this.getDayConfig(dayNumber);
    const examDate = this.getDateForDay(dayNumber);
    
    return {
      ...config,
      examDate,
      isActive: true
    };
  },
  
  // எல்லா நாட்களின் பட்டியல்
  getAllDays: function() {
    const days = [];
    for (let i = 1; i <= this.totalDays; i++) {
      const config = this.getDayConfig(i);
      const examDate = this.getDateForDay(i);
      days.push({
        ...config,
        examDate
      });
    }
    return days;
  }
};

// ═══════════════════════════════════════════════════════
// ⏰ TIMING CONTROL - தேர்வு நேர கட்டுப்பாடு
// ═══════════════════════════════════════════════════════

export const EXAM_TIMING = {
  // தேர்வு நேரம்: 7:00 PM - 10:00 PM (IST)
  startHour: 19,      // 7 PM (24-hour format)
  startMinute: 0,
  endHour: 22,        // 10 PM (24-hour format)
  endMinute: 0,
  
  timezone: 'Asia/Kolkata',
  
  // தேர்வு கிடைக்கிறதா என்று check
  isExamAvailable: function() {
    const now = new Date();
    
    // IST time-ஐ கணக்கிட
    const istTime = new Date(now.toLocaleString('en-US', { 
      timeZone: 'Asia/Kolkata' 
    }));
    
    const hours = istTime.getHours();
    const minutes = istTime.getMinutes();
    const currentMinutes = hours * 60 + minutes;
    
    const startMinutes = this.startHour * 60 + this.startMinute;
    const endMinutes = this.endHour * 60 + this.endMinute;
    
    return currentMinutes >= startMinutes && currentMinutes < endMinutes;
  },
  
  // தேர்வு status மற்றும் மீதம் உள்ள நேரம்
  getExamStatus: function() {
    const now = new Date();
    
    // IST time
    const istTime = new Date(now.toLocaleString('en-US', { 
      timeZone: 'Asia/Kolkata' 
    }));
    
    const hours = istTime.getHours();
    const minutes = istTime.getMinutes();
    const currentMinutes = hours * 60 + minutes;
    
    const startMinutes = this.startHour * 60 + this.startMinute;
    const endMinutes = this.endHour * 60 + this.endMinute;
    
    if (currentMinutes < startMinutes) {
      // இன்னும் தொடங்கவில்லை
      const remaining = startMinutes - currentMinutes;
      const remainingHours = Math.floor(remaining / 60);
      const remainingMins = remaining % 60;
      
      return {
        status: 'not_started',
        isAvailable: false,
        hours: remainingHours,
        minutes: remainingMins,
        totalMinutes: remaining,
        message: `தேர்வு இன்று இரவு ${this.startHour}:${this.startMinute.toString().padStart(2, '0')} மணிக்கு தொடங்கும்`,
        countdown: `${remainingHours} மணி ${remainingMins} நிமிடம் இன்னும்`,
        icon: '⏰',
        color: '#f59e0b'
      };
    } else if (currentMinutes >= startMinutes && currentMinutes < endMinutes) {
      // தேர்வு நடக்கிறது
      const remaining = endMinutes - currentMinutes;
      const remainingHours = Math.floor(remaining / 60);
      const remainingMins = remaining % 60;
      
      // 10 நிமிடத்திற்கு குறைவாக இருந்தால் warning
      const isClosingSoon = remaining < 10;
      
      return {
        status: 'active',
        isAvailable: true,
        hours: remainingHours,
        minutes: remainingMins,
        totalMinutes: remaining,
        message: isClosingSoon 
          ? '⚠️ தேர்வு விரைவில் முடிவடையும்! இப்போது எழுதுங்கள்!'
          : `தேர்வு இப்போது கிடைக்கிறது`,
        countdown: `${remainingHours} மணி ${remainingMins} நிமிடம் மீதம்`,
        icon: isClosingSoon ? '⚠️' : '✅',
        color: isClosingSoon ? '#ef4444' : '#10b981',
        isClosingSoon
      };
    } else {
      // தேர்வு முடிந்துவிட்டது
      return {
        status: 'ended',
        isAvailable: false,
        hours: 0,
        minutes: 0,
        totalMinutes: 0,
        message: 'இன்றைய தேர்வு முடிந்துவிட்டது',
        countdown: 'நாளை மீண்டும் வாருங்கள்!',
        icon: '🔒',
        color: '#64748b'
      };
    }
  },
  
  // Next exam timing காட்ட
  getNextExamTime: function() {
    const status = this.getExamStatus();
    
    if (status.status === 'not_started') {
      return `இன்று இரவு ${this.startHour}:${this.startMinute.toString().padStart(2, '0')} மணிக்கு`;
    } else if (status.status === 'ended') {
      return `நாளை இரவு ${this.startHour}:${this.startMinute.toString().padStart(2, '0')} மணிக்கு`;
    } else {
      return `${this.endHour}:${this.endMinute.toString().padStart(2, '0')} மணி வரை`;
    }
  },
  
  // Format time for display
  formatTime: function(hour, minute) {
    const h = hour.toString().padStart(2, '0');
    const m = minute.toString().padStart(2, '0');
    return `${h}:${m}`;
  },
  
  // Current IST time
  getCurrentISTTime: function() {
    const now = new Date();
    const istTime = new Date(now.toLocaleString('en-US', { 
      timeZone: 'Asia/Kolkata' 
    }));
    
    const hours = istTime.getHours();
    const minutes = istTime.getMinutes();
    const seconds = istTime.getSeconds();
    
    return {
      hours,
      minutes,
      seconds,
      formatted: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    };
  }
};

// Registration Validation Rules
export const REGISTRATION_RULES = {
  nameMinLength: 2,
  nameMaxLength: 50,
  phoneLength: 10,
  allowedGrades: ['6', '7', '8', '9', '10'],
  allowMultipleAttempts: false,
  requireDailyRegistration: true
};

// Quiz Settings
export const QUIZ_SETTINGS = {
  questionsPerExam: 50,
  timePerExam: 60, // minutes
  marksPerQuestion: 1,
  negativeMarking: false,
  questionTypes: ['mcq', 'true_false'],
  difficultyLevels: ['easy', 'medium', 'hard'],
  difficultyDistribution: {
    easy: 20,
    medium: 20,
    hard: 10
  }
};

// Helper Functions
export function getCategoryById(categoryId) {
  return Object.values(EXAM_CATEGORIES).find(cat => cat.id === categoryId);
}

export function isCategoryActiveToday(categoryId) {
  const todayExam = EXAM_SCHEDULE.getTodayExam();
  if (!todayExam) return false;
  return todayExam.category.id === categoryId;
}

export function getActiveCategoryToday() {
  const todayExam = EXAM_SCHEDULE.getTodayExam();
  return todayExam ? todayExam.category : null;
}

export function formatDate(dateString) {
  const date = new Date(dateString);
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('ta-IN', options);
}

export function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Export default config object
export default {
  EXAM_CATEGORIES,
  EXAM_SCHEDULE,
  EXAM_TIMING,
  REGISTRATION_RULES,
  QUIZ_SETTINGS,
  getCategoryById,
  isCategoryActiveToday,
  getActiveCategoryToday,
  formatDate,
  formatTime
};
