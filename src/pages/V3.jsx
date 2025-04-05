import React, { useRef, useEffect, memo, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import PeriodProgress from '../components/PeriodProgress';
import { useWeekSchedule } from '../context/WeekScheduleContext';
import Cookies from 'js-cookie';
import { FaEdit, FaSave, FaRedo, FaPlus, FaLayerGroup } from 'react-icons/fa';
import Schedule from '../components/Schedule';
import GoogleCalendar from '../components/GoogleCalendar';
import WeatherDashboard from '../components/WeatherDashboard';  // Updated import
import DayHeader from '../components/DayHeader';
import PopupMessage from '../components/PopupMessage';
import { useAuth } from '../context/AuthContext';
import QuickLinks from '../components/QuickLinks';
import {
  DEFAULT_PROGRESS_SIZE,
  DEFAULT_SCHEDULE_SIZE,
  DEFAULT_CALENDAR_SIZE,
  DEFAULT_WEATHER_SIZE,
  DEFAULT_HEADER_SIZE,
  DEFAULT_QUICK_LINKS_SIZE,
  DEFAULT_POSITIONS,
  DEFAULT_VISIBILITY,
  TEMPLATES,
  EDGE_PADDING,
  SNAP_THRESHOLD
} from '../layouts/dashtemplates';

// Add these helper functions after imports
const snapToComponentSizes = (newWidth, newHeight, currentComponent, allComponents) => {
  let snappedWidth = newWidth;
  let snappedHeight = newHeight;
  
  const components = allComponents.filter(comp => comp.component !== currentComponent);
  
  components.forEach(({width, height}) => {
    // Snap widths
    if (Math.abs(newWidth - width) < SNAP_THRESHOLD) {
      snappedWidth = width;
    }
    // Snap heights
    if (Math.abs(newHeight - height) < SNAP_THRESHOLD) {
      snappedHeight = height;
    }
  });
  
  return { width: snappedWidth, height: snappedHeight };
};

// Add this new component after imports, before V3
const SnapGuides = ({ activeGuides, collisions }) => {
  if (!activeGuides && !collisions) return null;
  
  return (
    <>
      {activeGuides?.vertical.map((x, i) => (
        <div
          key={`v-${i}`}
          className="fixed top-0 bottom-0 w-[1px] border-l border-dashed border-blue-400 pointer-events-none z-50"
          style={{ left: `${x}px` }}
        />
      ))}
      {activeGuides?.horizontal.map((y, i) => (
        <div
          key={`h-${i}`}
          className="fixed left-0 right-0 h-[1px] border-t border-dashed border-blue-400 pointer-events-none z-50"
          style={{ top: `${y}px` }}
        />
      ))}
      {collisions?.map((collision, i) => (
        <div
          key={`c-${i}`}
          className="fixed w-full h-full border-2 border-red-500 rounded-lg pointer-events-none z-40 animate-pulse"
          style={{
            left: `${collision.x}px`,
            top: `${collision.y}px`,
            width: `${collision.width}px`,
            height: `${collision.height}px`,
          }}
        />
      ))}
    </>
  );
};

const snapToComponents = (newX, newY, width, height, currentComponent, allComponents) => {
  let snappedX = newX;
  let snappedY = newY;
  const guides = { vertical: [], horizontal: [] };

  const components = allComponents.filter(comp => comp.component !== currentComponent);
  
  // Window edge snapping
  if (Math.abs(newX - EDGE_PADDING) < SNAP_THRESHOLD) {
    snappedX = EDGE_PADDING;
    guides.vertical.push(EDGE_PADDING);
  }
  if (Math.abs((newX + width) - (window.innerWidth - EDGE_PADDING)) < SNAP_THRESHOLD) {
    snappedX = window.innerWidth - width - EDGE_PADDING;
    guides.vertical.push(window.innerWidth - EDGE_PADDING);
  }
  
  // Window center snapping
  const windowCenterX = window.innerWidth / 2;
  if (Math.abs((newX + width/2) - windowCenterX) < SNAP_THRESHOLD) {
    snappedX = windowCenterX - width/2;
    guides.vertical.push(windowCenterX);
  }

  if (Math.abs(newY - EDGE_PADDING) < SNAP_THRESHOLD) {
    snappedY = EDGE_PADDING;
    guides.horizontal.push(EDGE_PADDING);
  }
  if (Math.abs((newY + height) - (window.innerHeight - EDGE_PADDING)) < SNAP_THRESHOLD) {
    snappedY = window.innerHeight - height - EDGE_PADDING;
    guides.horizontal.push(window.innerHeight - EDGE_PADDING);
  }
  const windowCenterY = window.innerHeight / 2;
  if (Math.abs((newY + height/2) - windowCenterY) < SNAP_THRESHOLD) {
    snappedY = windowCenterY - height/2;
    guides.horizontal.push(windowCenterY);
  }

  // Component alignment snapping
  components.forEach(({x, y, width: compWidth, height: compHeight}) => {
    // Left/right edges
    if (Math.abs(newX - x) < SNAP_THRESHOLD) {
      snappedX = x;
      guides.vertical.push(x);
    }
    if (Math.abs((newX + width) - (x + compWidth)) < SNAP_THRESHOLD) {
      snappedX = x + compWidth - width;
      guides.vertical.push(x + compWidth);
    }
    // Vertical center alignment
    const centerX = x + compWidth/2;
    if (Math.abs((newX + width/2) - centerX) < SNAP_THRESHOLD) {
      snappedX = centerX - width/2;
      guides.vertical.push(centerX);
    }

    // Top/bottom edges
    if (Math.abs(newY - y) < SNAP_THRESHOLD) {
      snappedY = y;
      guides.horizontal.push(y);
    }
    if (Math.abs((newY + height) - (y + compHeight)) < SNAP_THRESHOLD) {
      snappedY = y + compHeight - height;
      guides.horizontal.push(y + compHeight);
    }
    // Horizontal center alignment
    const centerY = y + compHeight/2;
    if (Math.abs((newY + height/2) - centerY) < SNAP_THRESHOLD) {
      snappedY = centerY - height/2;
      guides.horizontal.push(centerY);
    }
  });

  return { x: snappedX, y: snappedY, guides };
};

const V3 = memo(() => {
  const { currentTheme } = useTheme();
  const { weekSchedule, fetchSchedule } = useWeekSchedule();
  const { isAdmin } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const containerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState(() => {
    const saved = Cookies.get('progressBarSize');
    return saved ? JSON.parse(saved) : DEFAULT_PROGRESS_SIZE;
  });
  const [resizing, setResizing] = useState(null);
  const [scheduleSize, setScheduleSize] = useState(() => {
    const saved = Cookies.get('scheduleSize');
    return saved ? JSON.parse(saved) : DEFAULT_SCHEDULE_SIZE;
  });
  const [schedulePosition, setSchedulePosition] = useState(() => {
    const saved = Cookies.get('schedulePosition');
    return saved ? JSON.parse(saved) : DEFAULT_POSITIONS.schedule;
  });
  const scheduleRef = useRef(null);
  const [calendarSize, setCalendarSize] = useState(() => {
    const saved = Cookies.get('calendarSize');
    return saved ? JSON.parse(saved) : DEFAULT_CALENDAR_SIZE;
  });
  const [calendarPosition, setCalendarPosition] = useState(() => {
    const saved = Cookies.get('calendarPosition');
    return saved ? JSON.parse(saved) : DEFAULT_POSITIONS.calendar;
  });
  const [calendarDragging, setCalendarDragging] = useState(false);
  const calendarRef = useRef(null);
  const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0, component: null });
  const [visibleComponents, setVisibleComponents] = useState(() => {
    // First check template visibility
    const currentTemplateName = Cookies.get('currentTemplate') || 'default';
    const template = TEMPLATES[currentTemplateName];
    
    // Then check saved visibility, falling back to template defaults
    const saved = Cookies.get('componentVisibility');
    if (saved) {
      return {
        ...template.visibility, // Use template as base
        ...JSON.parse(saved)   // Override with any saved preferences
      };
    }
    
    return template.visibility;
  });
  const [showComponentList, setShowComponentList] = useState(false);
  const [announcement, setAnnouncement] = useState(null);
  const [showFullAnnouncement, setShowFullAnnouncement] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState(() => {
    return Cookies.get('currentTemplate') || 'default';
  });
  const [showDevOverlay, setShowDevOverlay] = useState(false);
  
  // Initialize position from cookies or center
  const [position, setPosition] = useState(() => {
    const saved = Cookies.get('progressBarPosition');
    return saved ? JSON.parse(saved) : DEFAULT_POSITIONS.progress;
  });

  // Add separate dragging states for each component
  const [progressDragging, setProgressDragging] = useState(false);
  const [scheduleDragging, setScheduleDragging] = useState(false);
  const [weatherSize, setWeatherSize] = useState(() => {
    const saved = Cookies.get('weatherSize');
    return saved ? JSON.parse(saved) : DEFAULT_WEATHER_SIZE;
  });
  const [weatherPosition, setWeatherPosition] = useState(() => {
    const saved = Cookies.get('weatherPosition');
    return saved ? JSON.parse(saved) : DEFAULT_POSITIONS.weather;
  });
  const weatherRef = useRef(null);
  const [weatherDragging, setWeatherDragging] = useState(false);
  const [headerSize, setHeaderSize] = useState(() => {
    const saved = Cookies.get('headerSize');
    return saved ? JSON.parse(saved) : DEFAULT_HEADER_SIZE;
  });
  const [headerPosition, setHeaderPosition] = useState(() => {
    const saved = Cookies.get('headerPosition');
    return saved ? JSON.parse(saved) : DEFAULT_POSITIONS.header;
  });
  const headerRef = useRef(null);
  const [headerDragging, setHeaderDragging] = useState(false);

  // Add new state to control animation timing
  const [startAnimations, setStartAnimations] = useState(false);

  // Add specific state for weather animation
  const [weatherMounted, setWeatherMounted] = useState(false);

  const [activeGuides, setActiveGuides] = useState({ vertical: [], horizontal: [] });
  const [collisions, setCollisions] = useState([]);

  // Add new state for QuickLinks
  const [quickLinksSize, setQuickLinksSize] = useState(() => {
    const saved = Cookies.get('quickLinksSize');
    return saved ? JSON.parse(saved) : DEFAULT_QUICK_LINKS_SIZE;
  });

  const [quickLinksPosition, setQuickLinksPosition] = useState(() => {
    const saved = Cookies.get('quickLinksPosition');
    return saved ? JSON.parse(saved) : DEFAULT_POSITIONS.quickLinks;
  });

  const quickLinksRef = useRef(null);
  const [quickLinksDragging, setQuickLinksDragging] = useState(false);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  // Add event listener for popup trigger
  useEffect(() => {
    const handlePopupTrigger = (e) => {
      setAnnouncement(e.detail.announcement);
      setShowFullAnnouncement(true);
    };

    window.addEventListener('showPopup', handlePopupTrigger);
    return () => window.removeEventListener('showPopup', handlePopupTrigger);
  }, []);

  // Add useEffect to trigger animations after a small delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setStartAnimations(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Modify useEffect to handle weather animation
  useEffect(() => {
    if (visibleComponents.weather) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        setWeatherMounted(true);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setWeatherMounted(false);
    }
  }, [visibleComponents.weather]);

  const handleDragStart = (e) => {
    if (!editMode) return;
    e.preventDefault(); // Prevent text selection while dragging
    setProgressDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  // Add this function to get all visible component positions
  const getVisibleComponents = () => {
    const components = [];
    if (visibleComponents.progress) {
      components.push({ x: position.x, y: position.y, width: size.width, height: size.height, component: 'progress' });
    }
    if (visibleComponents.schedule) {
      components.push({ x: schedulePosition.x, y: schedulePosition.y, width: scheduleSize.width, height: scheduleSize.height, component: 'schedule' });
    }
    if (visibleComponents.calendar) {
      components.push({ x: calendarPosition.x, y: calendarPosition.y, width: calendarSize.width, height: calendarSize.height, component: 'calendar' });
    }
    if (visibleComponents.weather) {
      components.push({ x: weatherPosition.x, y: weatherPosition.y, width: weatherSize.width, height: weatherSize.height, component: 'weather' });
    }
    if (visibleComponents.header) {
      components.push({ x: headerPosition.x, y: headerPosition.y, width: headerSize.width, height: headerSize.height, component: 'header' });
    }
    if (visibleComponents.quickLinks) {
      components.push({ x: quickLinksPosition.x, y: quickLinksPosition.y, width: quickLinksSize.width, height: quickLinksSize.height, component: 'quickLinks' });
    }
    return components;
  };

  // Modify drag handlers to use guides
  const handleDragMove = (e) => {
    if (!progressDragging || !editMode) return;
    
    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;
    
    const { x, y, guides } = snapToComponents(newX, newY, size.width, size.height, 'progress', getVisibleComponents());
    setPosition({ x, y });
    setActiveGuides(guides);
  };

  const handleDragEnd = () => {
    if (!editMode) return;
    setProgressDragging(false);
    setActiveGuides({ vertical: [], horizontal: [] });
    setCollisions([]);
    Cookies.set('progressBarPosition', JSON.stringify(position), { expires: 365 });
  };

  const handleResizeStart = (e, direction) => {
    if (!editMode) return;
    e.preventDefault();
    e.stopPropagation();
    setResizing('progress');
    setDragOffset({
      x: e.clientX,
      y: e.clientY,
      direction: direction
    });
  };

  const handleProgressResize = (e) => {
    if (!resizing || !editMode || resizing !== 'progress') return;
    
    const deltaX = e.clientX - dragOffset.x;
    const deltaY = e.clientY - dragOffset.y;
    
    // Store original values
    const originalWidth = size.width;
    const originalHeight = size.height;
    const originalX = position.x;
    const originalY = position.y;
    
    let newWidth = originalWidth;
    let newHeight = originalHeight;
    let newX = originalX;
    let newY = originalY;

    switch (dragOffset.direction) {
      case 'right':
        newWidth = Math.max(300, originalWidth + deltaX);
        break;
      case 'left':
        newWidth = Math.max(300, originalWidth - deltaX);
        newX = originalX + (originalWidth - newWidth);
        break;
      case 'bottom':
        newHeight = Math.max(100, originalHeight + deltaY);
        break;
      case 'top':
        newHeight = Math.max(100, originalHeight - deltaY);
        newY = originalY + (originalHeight - newHeight);
        break;
      case 'bottom-right':
        newWidth = Math.max(300, originalWidth + deltaX);
        newHeight = Math.max(100, originalHeight + deltaY);
        break;
      case 'bottom-left':
        newWidth = Math.max(300, originalWidth - deltaX);
        newHeight = Math.max(100, originalHeight + deltaY);
        newX = originalX + (originalWidth - newWidth);
        break;
      case 'top-right':
        newWidth = Math.max(300, originalWidth + deltaX);
        newHeight = Math.max(100, originalHeight - deltaY);
        newY = originalY + (originalHeight - newHeight);
        break;
      case 'top-left':
        newWidth = Math.max(300, originalWidth - deltaX);
        newHeight = Math.max(100, originalHeight - deltaY);
        newX = originalX + (originalWidth - newWidth);
        newY = originalY + (originalHeight - newHeight);
        break;
    }

    // Update both position and size atomically
    setSize({ width: newWidth, height: newHeight });
    setPosition({ x: newX, y: newY });
    
    setDragOffset({ x: e.clientX, y: e.clientY, direction: dragOffset.direction });
  };

  const handleProgressResizeEnd = () => {
    if (!editMode) return;
    setResizing(null);
    Cookies.set('progressBarSize', JSON.stringify(size), { expires: 365 });
  };

  const handleScheduleDragStart = (e) => {
    if (!editMode) return;
    e.preventDefault(); // Prevent text selection while dragging
    setScheduleDragging(true);
    setDragOffset({
      x: e.clientX - schedulePosition.x,
      y: e.clientY - schedulePosition.y
    });
  };

  const handleScheduleDragMove = (e) => {
    if (!scheduleDragging || !editMode) return;
    
    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;
    
    const { x, y, guides } = snapToComponents(newX, newY, scheduleSize.width, scheduleSize.height, 'schedule', getVisibleComponents());
    setSchedulePosition({ x, y });
    setActiveGuides(guides);
  };

  const handleScheduleDragEnd = () => {
    if (!editMode) return;
    setScheduleDragging(false);
    setActiveGuides({ vertical: [], horizontal: [] });
    setCollisions([]);
    Cookies.set('schedulePosition', JSON.stringify(schedulePosition), { expires: 365 });
  };

  const handleScheduleResizeStart = (e, direction) => {
    if (!editMode) return;
    e.preventDefault();
    e.stopPropagation();
    setResizing('schedule');
    setDragOffset({
      x: e.clientX,
      y: e.clientY,
      direction: direction
    });
  };

  const handleScheduleResize = (e) => {
    if (!resizing || !editMode || resizing !== 'schedule') return;

    const deltaX = e.clientX - dragOffset.x;
    const deltaY = e.clientY - dragOffset.y;
    
    // Store original values
    const originalWidth = scheduleSize.width;
    const originalHeight = scheduleSize.height;
    const originalX = schedulePosition.x;
    const originalY = schedulePosition.y;
    
    let newWidth = originalWidth;
    let newHeight = originalHeight;
    let newX = originalX;
    let newY = originalY;

    switch (dragOffset.direction) {
      case 'right':
        newWidth = Math.max(300, originalWidth + deltaX);
        break;
      case 'left':
        newWidth = Math.max(300, originalWidth - deltaX);
        newX = originalX + (originalWidth - newWidth);
        break;
      case 'bottom':
        newHeight = Math.max(400, originalHeight + deltaY);
        break;
      case 'top':
        newHeight = Math.max(400, originalHeight - deltaY);
        newY = originalY + (originalHeight - newHeight);
        break;
      case 'bottom-right':
        newWidth = Math.max(300, originalWidth + deltaX);
        newHeight = Math.max(400, originalHeight + deltaY);
        break;
      case 'bottom-left':
        newWidth = Math.max(300, originalWidth - deltaX);
        newHeight = Math.max(400, originalHeight + deltaY);
        newX = originalX + (originalWidth - newWidth);
        break;
      case 'top-right':
        newWidth = Math.max(300, originalWidth + deltaX);
        newHeight = Math.max(400, originalHeight - deltaY);
        newY = originalY + (originalHeight - newHeight);
        break;
      case 'top-left':
        newWidth = Math.max(300, originalWidth - deltaX);
        newHeight = Math.max(400, originalHeight - deltaY);
        newX = originalX + (originalWidth - newWidth);
        newY = originalY + (originalHeight - newHeight);
        break;
    }

    // Update both position and size atomically
    setScheduleSize({ width: newWidth, height: newHeight });
    setSchedulePosition({ x: newX, y: newY });
    
    setDragOffset({ x: e.clientX, y: e.clientY, direction: dragOffset.direction });
  };

  const handleScheduleResizeEnd = () => {
    if (!editMode) return;
    setResizing(null);
    Cookies.set('scheduleSize', JSON.stringify(scheduleSize), { expires: 365 });
  };

  // Add calendar handlers (similar to schedule handlers)
  const handleCalendarDragStart = (e) => {
    if (!editMode) return;
    e.preventDefault();
    setCalendarDragging(true);
    setDragOffset({
      x: e.clientX - calendarPosition.x,
      y: e.clientY - calendarPosition.y
    });
  };

  const handleCalendarDragMove = (e) => {
    if (!calendarDragging || !editMode) return;
    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;
    const { x, y, guides } = snapToComponents(newX, newY, calendarSize.width, calendarSize.height, 'calendar', getVisibleComponents());
    setCalendarPosition({ x, y });
    setActiveGuides(guides);
  };

  const handleCalendarDragEnd = () => {
    if (!editMode) return;
    setCalendarDragging(false);
    setActiveGuides({ vertical: [], horizontal: [] });
    setCollisions([]);
    Cookies.set('calendarPosition', JSON.stringify(calendarPosition), { expires: 365 });
  };

  const handleCalendarResizeStart = (e, direction) => {
    if (!editMode) return;
    e.preventDefault();
    e.stopPropagation();
    setResizing('calendar');
    setDragOffset({
      x: e.clientX,
      y: e.clientY,
      direction: direction
    });
  };

  const handleCalendarResize = (e) => {
    if (!resizing || !editMode || resizing !== 'calendar') return;

    const deltaX = e.clientX - dragOffset.x;
    const deltaY = e.clientY - dragOffset.y;
    
    // Store original values
    const originalWidth = calendarSize.width;
    const originalHeight = calendarSize.height;
    const originalX = calendarPosition.x;
    const originalY = calendarPosition.y;
    
    let newWidth = originalWidth;
    let newHeight = originalHeight;
    let newX = originalX;
    let newY = originalY;

    switch (dragOffset.direction) {
      case 'right':
        newWidth = Math.max(300, originalWidth + deltaX);
        break;
      case 'left':
        newWidth = Math.max(300, originalWidth - deltaX);
        newX = originalX + (originalWidth - newWidth);
        break;
      case 'bottom':
        newHeight = Math.max(400, originalHeight + deltaY);
        break;
      case 'top':
        newHeight = Math.max(400, originalHeight - deltaY);
        newY = originalY + (originalHeight - newHeight);
        break;
      case 'bottom-right':
        newWidth = Math.max(300, originalWidth + deltaX);
        newHeight = Math.max(400, originalHeight + deltaY);
        break;
      case 'bottom-left':
        newWidth = Math.max(300, originalWidth - deltaX);
        newHeight = Math.max(400, originalHeight + deltaY);
        newX = originalX + (originalWidth - newWidth);
        break;
      case 'top-right':
        newWidth = Math.max(300, originalWidth + deltaX);
        newHeight = Math.max(400, originalHeight - deltaY);
        newY = originalY + (originalHeight - newHeight);
        break;
      case 'top-left':
        newWidth = Math.max(300, originalWidth - deltaX);
        newHeight = Math.max(400, originalHeight - deltaY);
        newX = originalX + (originalWidth - newWidth);
        newY = originalY + (originalHeight - newHeight);
        break;
    }

    // Update both position and size atomically
    setCalendarSize({ width: newWidth, height: newHeight });
    setCalendarPosition({ x: newX, y: newY });
    
    setDragOffset({ x: e.clientX, y: e.clientY, direction: dragOffset.direction });
  };

  const handleCalendarResizeEnd = () => {
    if (!editMode) return;
    setResizing(null);
    Cookies.set('calendarSize', JSON.stringify(calendarSize), { expires: 365 });
  };

  // Add weather handlers (similar to other components)
  const handleWeatherDragStart = (e) => {
    if (!editMode) return;
    e.preventDefault();
    setDragOffset({
      x: e.clientX - weatherPosition.x,
      y: e.clientY - weatherPosition.y
    });
    setWeatherDragging(true);
  };

  const handleWeatherDragMove = (e) => {
    if (!weatherDragging || !editMode) return;
    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;
    const { x, y, guides } = snapToComponents(newX, newY, weatherSize.width, weatherSize.height, 'weather', getVisibleComponents());
    setWeatherPosition({ x, y });
    setActiveGuides(guides);
  };

  const handleWeatherDragEnd = () => {
    if (!editMode) return;
    setWeatherDragging(false);
    setActiveGuides({ vertical: [], horizontal: [] });
    setCollisions([]);
    Cookies.set('weatherPosition', JSON.stringify(weatherPosition), { expires: 365 });
  };

  const handleWeatherResizeStart = (e, direction) => {
    if (!editMode) return;
    e.preventDefault();
    e.stopPropagation();
    setResizing('weather');
    setDragOffset({
      x: e.clientX,
      y: e.clientY,
      direction: direction
    });
  };

  const handleWeatherResize = (e) => {
    if (!resizing || !editMode || resizing !== 'weather') return;

    const deltaX = e.clientX - dragOffset.x;
    const deltaY = e.clientY - dragOffset.y;
    
    // Store original values
    const originalWidth = weatherSize.width;
    const originalHeight = weatherSize.height;
    const originalX = weatherPosition.x;
    const originalY = weatherPosition.y;
    
    let newWidth = originalWidth;
    let newHeight = originalHeight;
    let newX = originalX;
    let newY = originalY;

    switch (dragOffset.direction) {
      case 'right':
        newWidth = Math.max(300, originalWidth + deltaX);
        break;
      case 'left':
        newWidth = Math.max(300, originalWidth - deltaX);
        newX = originalX + (originalWidth - newWidth);
        break;
      case 'bottom':
        newHeight = Math.max(150, originalHeight + deltaY);
        break;
      case 'top':
        newHeight = Math.max(150, originalHeight - deltaY);
        newY = originalY + (originalHeight - newHeight);
        break;
      case 'bottom-right':
        newWidth = Math.max(300, originalWidth + deltaX);
        newHeight = Math.max(150, originalHeight + deltaY);
        break;
      case 'bottom-left':
        newWidth = Math.max(300, originalWidth - deltaX);
        newHeight = Math.max(150, originalHeight + deltaY);
        newX = originalX + (originalWidth - newWidth);
        break;
      case 'top-right':
        newWidth = Math.max(300, originalWidth + deltaX);
        newHeight = Math.max(150, originalHeight - deltaY);
        newY = originalY + (originalHeight - newHeight);
        break;
      case 'top-left':
        newWidth = Math.max(300, originalWidth - deltaX);
        newHeight = Math.max(150, originalHeight - deltaY);
        newX = originalX + (originalWidth - newWidth);
        newY = originalY + (originalHeight - newHeight);
        break;
    }

    // Update both position and size atomically
    setWeatherSize({ width: newWidth, height: newHeight });
    setWeatherPosition({ x: newX, y: newY });
    
    setDragOffset({ x: e.clientX, y: e.clientY, direction: dragOffset.direction });
  };

  const handleWeatherResizeEnd = () => {
    if (!editMode) return;
    setResizing(null);
    Cookies.set('weatherSize', JSON.stringify(weatherSize), { expires: 365 });
  };

  // Add header handlers (similar to other components)
  const handleHeaderDragStart = (e) => {
    if (!editMode) return;
    e.preventDefault();
    setHeaderDragging(true);
    setDragOffset({
      x: e.clientX - headerPosition.x,
      y: e.clientY - headerPosition.y
    });
  };

  const handleHeaderDragMove = (e) => {
    if (!headerDragging || !editMode) return;
    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;
    const { x, y, guides } = snapToComponents(newX, newY, headerSize.width, headerSize.height, 'header', getVisibleComponents());
    setHeaderPosition({ x, y });
    setActiveGuides(guides);
  };

  const handleHeaderDragEnd = () => {
    if (!editMode) return;
    setHeaderDragging(false);
    setActiveGuides({ vertical: [], horizontal: [] });
    setCollisions([]);
    Cookies.set('headerPosition', JSON.stringify(headerPosition), { expires: 365 });
  };

  const handleHeaderResizeStart = (e, direction) => {
    if (!editMode) return;
    e.preventDefault();
    e.stopPropagation();
    setResizing('header');
    setDragOffset({
      x: e.clientX,
      y: e.clientY,
      direction: direction
    });
  };

  const handleHeaderResize = (e) => {
    if (!resizing || !editMode || resizing !== 'header') return;

    const deltaX = e.clientX - dragOffset.x;
    const deltaY = e.clientY - dragOffset.y;
    
    // Store original values
    const originalWidth = headerSize.width;
    const originalHeight = headerSize.height;
    const originalX = headerPosition.x;
    const originalY = headerPosition.y;
    
    let newWidth = originalWidth;
    let newHeight = originalHeight;
    let newX = originalX;
    let newY = originalY;

    switch (dragOffset.direction) {
      case 'right':
        newWidth = Math.max(300, originalWidth + deltaX);
        break;
      case 'left':
        newWidth = Math.max(300, originalWidth - deltaX);
        newX = originalX + (originalWidth - newWidth);
        break;
      case 'bottom':
        newHeight = Math.max(150, originalHeight + deltaY);
        break;
      case 'top':
        newHeight = Math.max(150, originalHeight - deltaY);
        newY = originalY + (originalHeight - newHeight);
        break;
      case 'bottom-right':
        newWidth = Math.max(300, originalWidth + deltaX);
        newHeight = Math.max(150, originalHeight + deltaY);
        break;
      case 'bottom-left':
        newWidth = Math.max(300, originalWidth - deltaX);
        newHeight = Math.max(150, originalHeight + deltaY);
        newX = originalX + (originalWidth - newWidth);
        break;
      case 'top-right':
        newWidth = Math.max(300, originalWidth + deltaX);
        newHeight = Math.max(150, originalHeight - deltaY);
        newY = originalY + (originalHeight - newHeight);
        break;
      case 'top-left':
        newWidth = Math.max(300, originalWidth - deltaX);
        newHeight = Math.max(150, originalHeight - deltaY);
        newX = originalX + (originalWidth - newWidth);
        newY = originalY + (originalHeight - newHeight);
        break;
    }

    // Update both position and size atomically
    setHeaderSize({ width: newWidth, height: newHeight });
    setHeaderPosition({ x: newX, y: newY });
    
    setDragOffset({ x: e.clientX, y: e.clientY, direction: dragOffset.direction });
  };

  const handleHeaderResizeEnd = () => {
    if (!editMode) return;
    setResizing(null);
    Cookies.set('headerSize', JSON.stringify(headerSize), { expires: 365 });
  };

  // Add QuickLinks handlers
  const handleQuickLinksDragStart = (e) => {
    if (!editMode) return;
    e.preventDefault();
    setQuickLinksDragging(true);
    setDragOffset({
      x: e.clientX - quickLinksPosition.x,
      y: e.clientY - quickLinksPosition.y
    });
  };

  const handleQuickLinksDragMove = (e) => {
    if (!quickLinksDragging || !editMode) return;
    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;
    const { x, y, guides } = snapToComponents(newX, newY, quickLinksSize.width, quickLinksSize.height, 'quickLinks', getVisibleComponents());
    setQuickLinksPosition({ x, y });
    setActiveGuides(guides);
  };

  const handleQuickLinksDragEnd = () => {
    if (!editMode) return;
    setQuickLinksDragging(false);
    setActiveGuides({ vertical: [], horizontal: [] });
    setCollisions([]);
    Cookies.set('quickLinksPosition', JSON.stringify(quickLinksPosition), { expires: 365 });
  };

  const getQuickLinksStyle = () => ({
    position: 'fixed',
    left: quickLinksPosition.x,
    top: quickLinksPosition.y,
    width: `${quickLinksSize.width}px`,
    height: `${quickLinksSize.height}px`,
    cursor: editMode ? 'move' : 'default',
    transform: editMode && resizing === 'quickLinks' ? 'scale(1.02)' : 'scale(1)',
    transition: (quickLinksDragging || resizing === 'quickLinks') ? 'none' : 'all 0.3s ease',
    zIndex: editMode ? 40 : 'auto'
  });

  // Add these handlers before the useEffect blocks
  const handleQuickLinksResizeStart = (e, direction) => {
    if (!editMode) return;
    e.preventDefault();
    e.stopPropagation();
    setResizing('quickLinks');
    setDragOffset({
      x: e.clientX,
      y: e.clientY,
      direction: direction
    });
  };

  const handleQuickLinksResize = (e) => {
    if (!resizing || !editMode || resizing !== 'quickLinks') return;

    const deltaX = e.clientX - dragOffset.x;
    const deltaY = e.clientY - dragOffset.y;
    
    const originalWidth = quickLinksSize.width;
    const originalHeight = quickLinksSize.height;
    const originalX = quickLinksPosition.x;
    const originalY = quickLinksPosition.y;
    
    let newWidth = originalWidth;
    let newHeight = originalHeight;
    let newX = originalX;
    let newY = originalY;

    switch (dragOffset.direction) {
      case 'right':
        newWidth = Math.max(300, originalWidth + deltaX);
        break;
      case 'left':
        newWidth = Math.max(300, originalWidth - deltaX);
        newX = originalX + (originalWidth - newWidth);
        break;
      case 'bottom':
        newHeight = Math.max(300, originalHeight + deltaY);
        break;
      case 'top':
        newHeight = Math.max(300, originalHeight - deltaY);
        newY = originalY + (originalHeight - newHeight);
        break;
      case 'bottom-right':
        newWidth = Math.max(300, originalWidth + deltaX);
        newHeight = Math.max(300, originalHeight + deltaY);
        break;
      case 'bottom-left':
        newWidth = Math.max(300, originalWidth - deltaX);
        newHeight = Math.max(300, originalHeight + deltaY);
        newX = originalX + (originalWidth - newWidth);
        break;
      case 'top-right':
        newWidth = Math.max(300, originalWidth + deltaX);
        newHeight = Math.max(300, originalHeight - deltaY);
        newY = originalY + (originalHeight - newHeight);
        break;
      case 'top-left':
        newWidth = Math.max(300, originalWidth - deltaX);
        newHeight = Math.max(300, originalHeight - deltaY);
        newX = originalX + (originalWidth - newWidth);
        newY = originalY + (originalHeight - newHeight);
        break;
    }

    setQuickLinksSize({ width: newWidth, height: newHeight });
    setQuickLinksPosition({ x: newX, y: newY });
    setDragOffset({ x: e.clientX, y: e.clientY, direction: dragOffset.direction });
  };

  const handleQuickLinksResizeEnd = () => {
    if (!editMode) return;
    setResizing(null);
    Cookies.set('quickLinksSize', JSON.stringify(quickLinksSize), { expires: 365 });
  };

  // Update effect to handle different drag states
  useEffect(() => {
    if (progressDragging) {
      document.addEventListener('mousemove', handleDragMove);
      document.addEventListener('mouseup', handleDragEnd);
      return () => {
        document.removeEventListener('mousemove', handleDragMove);
        document.removeEventListener('mouseup', handleDragEnd);
      };
    }
    if (scheduleDragging) {
      document.addEventListener('mousemove', handleScheduleDragMove);
      document.addEventListener('mouseup', handleScheduleDragEnd);
      return () => {
        document.removeEventListener('mousemove', handleScheduleDragMove);
        document.removeEventListener('mouseup', handleScheduleDragEnd);
      };
    }
    if (calendarDragging) {
      document.addEventListener('mousemove', handleCalendarDragMove);
      document.addEventListener('mouseup', handleCalendarDragEnd);
      return () => {
        document.removeEventListener('mousemove', handleCalendarDragMove);
        document.removeEventListener('mouseup', handleCalendarDragEnd);
      };
    }
    if (weatherDragging) {
      document.addEventListener('mousemove', handleWeatherDragMove);
      document.addEventListener('mouseup', handleWeatherDragEnd);
      return () => {
        document.removeEventListener('mousemove', handleWeatherDragMove);
        document.removeEventListener('mouseup', handleWeatherDragEnd);
      };
    }
    if (headerDragging) {
      document.addEventListener('mousemove', handleHeaderDragMove);
      document.addEventListener('mouseup', handleHeaderDragEnd);
      return () => {
        document.removeEventListener('mousemove', handleHeaderDragMove);
        document.removeEventListener('mouseup', handleHeaderDragEnd);
      };
    }
    if (quickLinksDragging) {
      document.addEventListener('mousemove', handleQuickLinksDragMove);
      document.addEventListener('mouseup', handleQuickLinksDragEnd);
      return () => {
        document.removeEventListener('mousemove', handleQuickLinksDragMove);
        document.removeEventListener('mouseup', handleQuickLinksDragEnd);
      };
    }
  }, [progressDragging, scheduleDragging, calendarDragging, weatherDragging, headerDragging, quickLinksDragging]);

  useEffect(() => {
    if (resizing) {
      const handleResize = resizing === 'progress' ? handleProgressResize : 
                          resizing === 'schedule' ? handleScheduleResize :
                          resizing === 'calendar' ? handleCalendarResize :
                          resizing === 'weather' ? handleWeatherResize :
                          resizing === 'header' ? handleHeaderResize :
                          handleQuickLinksResize;
      
      const handleResizeEnd = resizing === 'progress' ? handleProgressResizeEnd :
                             resizing === 'schedule' ? handleScheduleResizeEnd :
                             resizing === 'calendar' ? handleCalendarResizeEnd :
                             resizing === 'weather' ? handleWeatherResizeEnd :
                             resizing === 'header' ? handleHeaderResizeEnd :
                             handleQuickLinksResizeEnd;

      document.addEventListener('mousemove', handleResize);
      document.addEventListener('mouseup', handleResizeEnd);
      return () => {
        document.removeEventListener('mousemove', handleResize);
        document.removeEventListener('mouseup', handleResizeEnd);
      };
    }
  }, [resizing]);

  const toggleEditMode = () => {
    setEditMode(!editMode);
    if (editMode) {
      Cookies.set('progressBarPosition', JSON.stringify(position), { expires: 365 });
      Cookies.set('progressBarSize', JSON.stringify(size), { expires: 365 });
      Cookies.set('schedulePosition', JSON.stringify(schedulePosition), { expires: 365 });
      Cookies.set('scheduleSize', JSON.stringify(scheduleSize), { expires: 365 });
      Cookies.set('calendarPosition', JSON.stringify(calendarPosition), { expires: 365 });
      Cookies.set('calendarSize', JSON.stringify(calendarSize), { expires: 365 });
      Cookies.set('weatherPosition', JSON.stringify(weatherPosition), { expires: 365 });
      Cookies.set('weatherSize', JSON.stringify(weatherSize), { expires: 365 });
      Cookies.set('headerPosition', JSON.stringify(headerPosition), { expires: 365 });
      Cookies.set('headerSize', JSON.stringify(headerSize), { expires: 365 });
      Cookies.set('quickLinksPosition', JSON.stringify(quickLinksPosition), { expires: 365 });
      Cookies.set('quickLinksSize', JSON.stringify(quickLinksSize), { expires: 365 });
    }
  };

  const resetLayout = () => {
    setSize(DEFAULT_PROGRESS_SIZE);
    setPosition(DEFAULT_POSITIONS.progress);
    setScheduleSize(DEFAULT_SCHEDULE_SIZE);
    setSchedulePosition(DEFAULT_POSITIONS.schedule);
    setCalendarSize(DEFAULT_CALENDAR_SIZE);
    setCalendarPosition(DEFAULT_POSITIONS.calendar);
    setWeatherSize(DEFAULT_WEATHER_SIZE);
    setWeatherPosition(DEFAULT_POSITIONS.weather);
    setHeaderSize(DEFAULT_HEADER_SIZE);
    setHeaderPosition(DEFAULT_POSITIONS.header);
    setQuickLinksSize(DEFAULT_QUICK_LINKS_SIZE);
    setQuickLinksPosition(DEFAULT_POSITIONS.quickLinks);
    Cookies.set('progressBarSize', JSON.stringify(DEFAULT_PROGRESS_SIZE), { expires: 365 });
    Cookies.set('progressBarPosition', JSON.stringify(DEFAULT_POSITIONS.progress), { expires: 365 });
    Cookies.set('scheduleSize', JSON.stringify(DEFAULT_SCHEDULE_SIZE), { expires: 365 });
    Cookies.set('schedulePosition', JSON.stringify(DEFAULT_POSITIONS.schedule), { expires: 365 });
    Cookies.set('calendarSize', JSON.stringify(DEFAULT_CALENDAR_SIZE), { expires: 365 });
    Cookies.set('calendarPosition', JSON.stringify(DEFAULT_POSITIONS.calendar), { expires: 365 });
    Cookies.set('weatherSize', JSON.stringify(DEFAULT_WEATHER_SIZE), { expires: 365 });
    Cookies.set('weatherPosition', JSON.stringify(DEFAULT_POSITIONS.weather), { expires: 365 });
    Cookies.set('headerSize', JSON.stringify(DEFAULT_HEADER_SIZE), { expires: 365 });
    Cookies.set('headerPosition', JSON.stringify(DEFAULT_POSITIONS.header), { expires: 365 });
    Cookies.set('quickLinksSize', JSON.stringify(DEFAULT_QUICK_LINKS_SIZE), { expires: 365 });
    Cookies.set('quickLinksPosition', JSON.stringify(DEFAULT_POSITIONS.quickLinks), { expires: 365 });
  };

  const handleContextMenu = (e, component) => {
    if (!editMode) return;
    e.preventDefault();
    setContextMenu({
      show: true,
      x: e.clientX,
      y: e.clientY,
      component
    });
  };

  const hideComponent = (component) => {
    setVisibleComponents(prev => ({
      ...prev,
      [component]: false
    }));
    setContextMenu({ show: false, x: 0, y: 0, component: null });
    Cookies.set('componentVisibility', JSON.stringify({
      ...visibleComponents,
      [component]: false
    }), { expires: 365 });
  };

  const showComponent = (component) => {
    setVisibleComponents(prev => ({
      ...prev,
      [component]: true
    }));
    setShowComponentList(false);
    Cookies.set('componentVisibility', JSON.stringify({
      ...visibleComponents,
      [component]: true
    }), { expires: 365 });
  };

  const resetComponentScale = (component) => {
    switch(component) {
      case 'progress':
        setSize(DEFAULT_PROGRESS_SIZE);
        Cookies.set('progressBarSize', JSON.stringify(DEFAULT_PROGRESS_SIZE), { expires: 365 });
        break;
      case 'schedule':
        setScheduleSize(DEFAULT_SCHEDULE_SIZE);
        Cookies.set('scheduleSize', JSON.stringify(DEFAULT_SCHEDULE_SIZE), { expires: 365 });
        break;
      case 'calendar':
        setCalendarSize(DEFAULT_CALENDAR_SIZE);
        Cookies.set('calendarSize', JSON.stringify(DEFAULT_CALENDAR_SIZE), { expires: 365 });
        break;
      case 'weather':
        setWeatherSize(DEFAULT_WEATHER_SIZE);
        Cookies.set('weatherSize', JSON.stringify(DEFAULT_WEATHER_SIZE), { expires: 365 });
        break;
      case 'header':
        setHeaderSize(DEFAULT_HEADER_SIZE);
        Cookies.set('headerSize', JSON.stringify(DEFAULT_HEADER_SIZE), { expires: 365 });
        break;
      case 'quickLinks':
        setQuickLinksSize(DEFAULT_QUICK_LINKS_SIZE);
        Cookies.set('quickLinksSize', JSON.stringify(DEFAULT_QUICK_LINKS_SIZE), { expires: 365 });
        break;
    }
    setContextMenu({ show: false, x: 0, y: 0, component: null });
  };

  const resetComponentPosition = (component) => {
    switch(component) {
      case 'progress':
        setPosition(DEFAULT_POSITIONS.progress);
        Cookies.set('progressBarPosition', JSON.stringify(DEFAULT_POSITIONS.progress), { expires: 365 });
        break;
      case 'schedule':
        setSchedulePosition(DEFAULT_POSITIONS.schedule);
        Cookies.set('schedulePosition', JSON.stringify(DEFAULT_POSITIONS.schedule), { expires: 365 });
        break;
      case 'calendar':
        setCalendarPosition(DEFAULT_POSITIONS.calendar);
        Cookies.set('calendarPosition', JSON.stringify(DEFAULT_POSITIONS.calendar), { expires: 365 });
        break;
      case 'weather':
        setWeatherPosition(DEFAULT_POSITIONS.weather);
        Cookies.set('weatherPosition', JSON.stringify(DEFAULT_POSITIONS.weather), { expires: 365 });
        break;
      case 'header':
        setHeaderPosition(DEFAULT_POSITIONS.header);
        Cookies.set('headerPosition', JSON.stringify(DEFAULT_POSITIONS.header), { expires: 365 });
        break;
      case 'quickLinks':
        setQuickLinksPosition(DEFAULT_POSITIONS.quickLinks);
        Cookies.set('quickLinksPosition', JSON.stringify(DEFAULT_POSITIONS.quickLinks), { expires: 365 });
        break;
    }
    setContextMenu({ show: false, x: 0, y: 0, component: null });
  };

  // Close context menu on click outside
  useEffect(() => {
    const handleClick = () => setContextMenu({ show: false, x: 0, y: 0, component: null });
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  // Update transform style to use proper dragging state
  const getTransformStyle = () => ({
    position: 'fixed',
    left: position.x,
    top: position.y,
    width: `${size.width}px`,
    height: `${size.height}px`,
    cursor: editMode ? 'move' : 'default',
    transform: editMode && resizing === 'progress' ? 'scale(1.02)' : 'scale(1)',
    transition: (progressDragging || resizing === 'progress') ? 'none' : 'all 0.3s ease',
    zIndex: editMode ? 40 : 'auto'
  });

  const getScheduleStyle = () => ({
    position: 'fixed',
    left: schedulePosition.x,
    top: schedulePosition.y,
    width: `${scheduleSize.width}px`,
    height: `${scheduleSize.height}px`,
    cursor: editMode ? 'move' : 'default',
    transform: editMode && resizing === 'schedule' ? 'scale(1.02)' : 'scale(1)',
    transition: (scheduleDragging || resizing === 'schedule') ? 'none' : 'all 0.3s ease',
    zIndex: editMode ? 40 : 'auto'
  });

  const getCalendarStyle = () => ({
    position: 'fixed',
    left: calendarPosition.x,
    top: calendarPosition.y,
    width: `${calendarSize.width}px`,
    height: `${calendarSize.height}px`,
    cursor: editMode ? 'move' : 'default',
    transform: editMode && resizing === 'calendar' ? 'scale(1.02)' : 'scale(1)',
    transition: (calendarDragging || resizing === 'calendar') ? 'none' : 'all 0.3s ease',
    zIndex: editMode ? 40 : 'auto'
  });

  const getWeatherStyle = () => ({
    position: 'fixed',
    left: weatherPosition.x,
    top: weatherPosition.y,
    width: `${weatherSize.width}px`,
    height: `${weatherSize.height}px`,
    cursor: editMode ? 'move' : 'default',
    transform: editMode && resizing === 'weather' ? 'scale(1.02)' : 'scale(1)',
    transition: (weatherDragging || resizing === 'weather') ? 'none' : 'all 0.3s ease',
    zIndex: editMode ? 40 : 'auto'
  });

  const getHeaderStyle = () => ({
    position: 'fixed',
    left: headerPosition.x,
    top: headerPosition.y,
    width: `${headerSize.width}px`,
    height: `${headerSize.height}px`,
    cursor: editMode ? 'move' : 'default',
    transform: editMode && resizing === 'header' ? 'scale(1.02)' : 'scale(1)',
    transition: (headerDragging || resizing === 'header') ? 'none' : 'all 0.3s ease',
    zIndex: editMode ? 40 : 'auto'
  });

  const saveAsUserTemplate = () => {
    const userTemplate = {
      positions: {
        progress: position,
        schedule: schedulePosition,
        calendar: calendarPosition,
        weather: weatherPosition,
        header: headerPosition,
        quickLinks: quickLinksPosition
      },
      sizes: {
        progress: size,
        schedule: scheduleSize,
        calendar: calendarSize,
        weather: weatherSize,
        header: headerSize,
        quickLinks: quickLinksSize
      },
      visibility: visibleComponents,
      name: 'Custom Layout'
    };

    TEMPLATES.user = userTemplate;
    setCurrentTemplate('user');
    Cookies.set('userTemplate', JSON.stringify(userTemplate), { expires: 365 });
    Cookies.set('currentTemplate', 'user', { expires: 365 });
  };

  // Load user template on mount
  useEffect(() => {
    const savedUserTemplate = Cookies.get('userTemplate');
    if (savedUserTemplate) {
      TEMPLATES.user = JSON.parse(savedUserTemplate);
    }
  }, []);

  const handleTemplateSwitch = (name, config) => {
    setSize(config.sizes.progress || DEFAULT_PROGRESS_SIZE);
    setPosition(config.positions.progress || DEFAULT_POSITIONS.progress);
    setScheduleSize(config.sizes.schedule || DEFAULT_SCHEDULE_SIZE);
    setSchedulePosition(config.positions.schedule || DEFAULT_POSITIONS.schedule);
    setCalendarSize(config.sizes.calendar || DEFAULT_CALENDAR_SIZE);
    setCalendarPosition(config.positions.calendar || DEFAULT_POSITIONS.calendar);
    setWeatherSize(config.sizes.weather || DEFAULT_WEATHER_SIZE);
    setWeatherPosition(config.positions.weather || DEFAULT_POSITIONS.weather);
    setHeaderSize(config.sizes.header || DEFAULT_HEADER_SIZE);
    setHeaderPosition(config.positions.header || DEFAULT_POSITIONS.header);
    setQuickLinksSize(config.sizes.quickLinks || DEFAULT_QUICK_LINKS_SIZE);
    setQuickLinksPosition(config.positions.quickLinks || DEFAULT_POSITIONS.quickLinks);
    setVisibleComponents(config.visibility);
    setCurrentTemplate(name);
    setShowTemplates(false);
            
    Cookies.set('currentTemplate', name, { expires: 365 });
    Cookies.set('componentVisibility', JSON.stringify(config.visibility), { expires: 365 });
  };

  // Add DevOverlay component
  const DevOverlay = ({ component, position, size }) => {
    if (!showDevOverlay || !isAdmin()) return null;
    
    return (
      <div className="absolute top-0 left-0 bg-black bg-opacity-50 text-white p-2 text-xs z-50 pointer-events-none">
        <div>pos: {JSON.stringify(position)}</div>
        <div>size: {JSON.stringify(size)}</div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen ${currentTheme.main} ${currentTheme.text}`}>
      {/* Add SnapGuides at the top level */}
      <SnapGuides activeGuides={activeGuides} collisions={collisions} />
      
      {/* Remove existing toolbar from top-right */}
      
      {/* Components section - keep existing code */}
      {visibleComponents.progress && (
        <div 
          ref={containerRef}
          style={getTransformStyle()}
          onMouseDown={handleDragStart}
          onContextMenu={(e) => handleContextMenu(e, 'progress')}
          className={`select-none relative rounded-lg overflow-hidden fade-in-scale delay-1
            ${editMode ? 'ring-2 ring-blue-500 ring-opacity-50 shadow-lg' : 'border-2 border-opacity-20 border-slate-400'}`}
        >
          <DevOverlay component="progress" position={position} size={size} />
          <div 
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to top right, rgba(0, 0, 0, 0.5), transparent)`,
              zIndex: 0,
            }}
          />
          <div className="relative z-10 w-full h-full">
            <PeriodProgress weekSchedule={weekSchedule} />
          </div>

          {editMode && (
            <>
              {/* Corner handles - Add pointer-events-auto */}
              <div className="absolute right-0 bottom-0 w-4 h-4 cursor-se-resize hover:bg-blue-500 hover:bg-opacity-20 pointer-events-auto z-50"
                onMouseDown={(e) => handleResizeStart(e, 'bottom-right')} />
              <div className="absolute left-0 bottom-0 w-4 h-4 cursor-sw-resize hover:bg-blue-500 hover:bg-opacity-20 pointer-events-auto z-50"
                onMouseDown={(e) => handleResizeStart(e, 'bottom-left')} />
              <div className="absolute right-0 top-0 w-4 h-4 cursor-ne-resize hover:bg-blue-500 hover:bg-opacity-20 pointer-events-auto z-50"
                onMouseDown={(e) => handleResizeStart(e, 'top-right')} />
              <div className="absolute left-0 top-0 w-4 h-4 cursor-nw-resize hover:bg-blue-500 hover:bg-opacity-20 pointer-events-auto z-50"
                onMouseDown={(e) => handleResizeStart(e, 'top-left')} />
              
              {/* Edge handles - Add pointer-events-auto */}
              <div className="absolute right-0 top-4 bottom-4 w-2 cursor-e-resize hover:bg-blue-500 hover:bg-opacity-20 pointer-events-auto z-50"
                onMouseDown={(e) => handleResizeStart(e, 'right')} />
              <div className="absolute left-0 top-4 bottom-4 w-2 cursor-w-resize hover:bg-blue-500 hover:bg-opacity-20 pointer-events-auto z-50"
                onMouseDown={(e) => handleResizeStart(e, 'left')} />
              <div className="absolute top-0 left-4 right-4 h-2 cursor-n-resize hover:bg-blue-500 hover:bg-opacity-20 pointer-events-auto z-50"
                onMouseDown={(e) => handleResizeStart(e, 'top')} />
              <div className="absolute bottom-0 left-4 right-4 h-2 cursor-s-resize hover:bg-blue-500 hover:bg-opacity-20 pointer-events-auto z-50"
                onMouseDown={(e) => handleResizeStart(e, 'bottom')} />
            </>
          )}
        </div>
      )}

      {visibleComponents.schedule && (
        <div
          ref={scheduleRef}
          style={getScheduleStyle()}
          onMouseDown={handleScheduleDragStart}
          onContextMenu={(e) => handleContextMenu(e, 'schedule')}
          className={`select-none relative rounded-lg overflow-hidden fade-in-scale delay-2
            ${editMode ? 'ring-2 ring-blue-500 ring-opacity-50 shadow-lg' : 'border-2 border-opacity-20 border-slate-400'}`}
        >
          <DevOverlay component="schedule" position={schedulePosition} size={scheduleSize} />
          <div 
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to top right, rgba(0, 0, 0, 0.5), transparent)`,
              zIndex: 0,
            }}
          />
          <div className="relative z-10 w-full h-full">
            <Schedule weekSchedule={weekSchedule} />
          </div>

          {editMode && (
            <>
              {/* Corner handles */}
              <div className="absolute right-0 bottom-0 w-4 h-4 cursor-se-resize hover:bg-blue-500 hover:bg-opacity-20 pointer-events-auto z-50"
                onMouseDown={(e) => handleScheduleResizeStart(e, 'bottom-right')} />
              <div className="absolute left-0 bottom-0 w-4 h-4 cursor-sw-resize hover:bg-blue-500 hover:bg-opacity-20 pointer-events-auto z-50"
                onMouseDown={(e) => handleScheduleResizeStart(e, 'bottom-left')} />
              <div className="absolute right-0 top-0 w-4 h-4 cursor-ne-resize hover:bg-blue-500 hover:bg-opacity-20 pointer-events-auto z-50"
                onMouseDown={(e) => handleScheduleResizeStart(e, 'top-right')} />
              <div className="absolute left-0 top-0 w-4 h-4 cursor-nw-resize hover:bg-blue-500 hover:bg-opacity-20 pointer-events-auto z-50"
                onMouseDown={(e) => handleScheduleResizeStart(e, 'top-left')} />
              
              {/* Edge handles */}
              <div className="absolute right-0 top-4 bottom-4 w-2 cursor-e-resize hover:bg-blue-500 hover:bg-opacity-20 pointer-events-auto z-50"
                onMouseDown={(e) => handleScheduleResizeStart(e, 'right')} />
              <div className="absolute left-0 top-4 bottom-4 w-2 cursor-w-resize hover:bg-blue-500 hover:bg-opacity-20 pointer-events-auto z-50"
                onMouseDown={(e) => handleScheduleResizeStart(e, 'left')} />
              <div className="absolute top-0 left-4 right-4 h-2 cursor-n-resize hover:bg-blue-500 hover:bg-opacity-20 pointer-events-auto z-50"
                onMouseDown={(e) => handleScheduleResizeStart(e, 'top')} />
              <div className="absolute bottom-0 left-4 right-4 h-2 cursor-s-resize hover:bg-blue-500 hover:bg-opacity-20 pointer-events-auto z-50"
                onMouseDown={(e) => handleScheduleResizeStart(e, 'bottom')} />
            </>
          )}
        </div>
      )}

      {visibleComponents.calendar && (
        <div
          ref={calendarRef}
          style={getCalendarStyle()}
          onMouseDown={handleCalendarDragStart}
          onContextMenu={(e) => handleContextMenu(e, 'calendar')}
          className={`select-none relative rounded-lg overflow-hidden fade-in-scale delay-3
            ${editMode ? 'ring-2 ring-blue-500 ring-opacity-50 shadow-lg' : 'border-2 border-opacity-20 border-slate-400'}`}
        >
          <DevOverlay component="calendar" position={calendarPosition} size={calendarSize} />
          <div 
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to top right, rgba(0, 0, 0, 0.5), transparent)`,
              zIndex: 0,
            }}
          />
          <div className="relative z-10 w-full h-full">
            <GoogleCalendar />
          </div>

          {editMode && (
            <>
              {/* Add resize handles similar to Schedule container */}
              <div className="absolute right-0 bottom-0 w-4 h-4 cursor-se-resize hover:bg-blue-500 hover:bg-opacity-20 pointer-events-auto z-50"
                onMouseDown={(e) => handleCalendarResizeStart(e, 'bottom-right')} />
              <div className="absolute left-0 bottom-0 w-4 h-4 cursor-sw-resize hover:bg-blue-500 hover:bg-opacity-20 pointer-events-auto z-50"
                onMouseDown={(e) => handleCalendarResizeStart(e, 'bottom-left')} />
              <div className="absolute right-0 top-0 w-4 h-4 cursor-ne-resize hover:bg-blue-500 hover:bg-opacity-20 pointer-events-auto z-50"
                onMouseDown={(e) => handleCalendarResizeStart(e, 'top-right')} />
              <div className="absolute left-0 top-0 w-4 h-4 cursor-nw-resize hover:bg-blue-500 hover:bg-opacity-20 pointer-events-auto z-50"
                onMouseDown={(e) => handleCalendarResizeStart(e, 'top-left')} />
              
              {/* Edge handles */}
              <div className="absolute right-0 top-4 bottom-4 w-2 cursor-e-resize hover:bg-blue-500 hover:bg-opacity-20 pointer-events-auto z-50"
                onMouseDown={(e) => handleCalendarResizeStart(e, 'right')} />
              <div className="absolute left-0 top-4 bottom-4 w-2 cursor-w-resize hover:bg-blue-500 hover:bg-opacity-20 pointer-events-auto z-50"
                onMouseDown={(e) => handleCalendarResizeStart(e, 'left')} />
              <div className="absolute top-0 left-4 right-4 h-2 cursor-n-resize hover:bg-blue-500 hover:bg-opacity-20 pointer-events-auto z-50"
                onMouseDown={(e) => handleCalendarResizeStart(e, 'top')} />
              <div className="absolute bottom-0 left-4 right-4 h-2 cursor-s-resize hover:bg-blue-500 hover:bg-opacity-20 pointer-events-auto z-50"
                onMouseDown={(e) => handleCalendarResizeStart(e, 'bottom')} />
            </>
          )}
        </div>
      )}

      {visibleComponents.weather && (
        <div
          ref={weatherRef}
          style={getWeatherStyle()}
          onMouseDown={handleWeatherDragStart}
          onContextMenu={(e) => handleContextMenu(e, 'weather')}
          className={`select-none relative rounded-lg overflow-hidden ${weatherMounted ? 'fade-in-scale delay-4' : 'opacity-0'}
            ${editMode ? 'ring-2 ring-blue-500 ring-opacity-50 shadow-lg' : 'border-2 border-opacity-20 border-slate-400'}`}
        >
          <DevOverlay component="weather" position={weatherPosition} size={weatherSize} />
          <div 
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to top right, rgba(0, 0, 0, 0.5), transparent)`,
              zIndex: 0,
            }}
          />
          <div className="relative z-10 w-full h-full">
            <WeatherDashboard />  {/* Updated component name */}
          </div>

          {editMode && (
            <>
              {/* Add resize handles similar to other components */}
              <div className="absolute right-0 bottom-0 w-4 h-4 cursor-se-resize hover:bg-blue-500 hover:bg-opacity-20 pointer-events-auto z-50"
                onMouseDown={(e) => handleWeatherResizeStart(e, 'bottom-right')} />
              <div className="absolute left-0 bottom-0 w-4 h-4 cursor-sw-resize hover:bg-blue-500 hover:bg-opacity-20 pointer-events-auto z-50"
                onMouseDown={(e) => handleWeatherResizeStart(e, 'bottom-left')} />
              <div className="absolute right-0 top-0 w-4 h-4 cursor-ne-resize hover:bg-blue-500 hover:bg-opacity-20 pointer-events-auto z-50"
                onMouseDown={(e) => handleWeatherResizeStart(e, 'top-right')} />
              <div className="absolute left-0 top-0 w-4 h-4 cursor-nw-resize hover:bg-blue-500 hover:bg-opacity-20 pointer-events-auto z-50"
                onMouseDown={(e) => handleWeatherResizeStart(e, 'top-left')} />
              
              {/* Edge handles */}
              <div className="absolute right-0 top-4 bottom-4 w-2 cursor-e-resize hover:bg-blue-500 hover:bg-opacity-20 pointer-events-auto z-50"
                onMouseDown={(e) => handleWeatherResizeStart(e, 'right')} />
              <div className="absolute left-0 top-4 bottom-4 w-2 cursor-w-resize hover:bg-blue-500 hover:bg-opacity-20 pointer-events-auto z-50"
                onMouseDown={(e) => handleWeatherResizeStart(e, 'left')} />
              <div className="absolute top-0 left-4 right-4 h-2 cursor-n-resize hover:bg-blue-500 hover:bg-opacity-20 pointer-events-auto z-50"
                onMouseDown={(e) => handleWeatherResizeStart(e, 'top')} />
              <div className="absolute bottom-0 left-4 right-4 h-2 cursor-s-resize hover:bg-blue-500 hover:bg-opacity-20 pointer-events-auto z-50"
                onMouseDown={(e) => handleWeatherResizeStart(e, 'bottom')} />
            </>
          )}
        </div>
      )}

      {visibleComponents.header && (
        <div
          ref={headerRef}
          style={getHeaderStyle()}
          onMouseDown={handleHeaderDragStart}
          onContextMenu={(e) => handleContextMenu(e, 'header')}
          className={`select-none relative rounded-lg overflow-hidden fade-in-scale delay-0
            ${editMode ? 'ring-2 ring-blue-500 ring-opacity-50 shadow-lg' : 'border-2 border-opacity-20 border-slate-400'}`}
        >
          <DevOverlay component="header" position={headerPosition} size={headerSize} />
          <div className="relative z-10 w-full h-full">
            <DayHeader onAnnouncementClick={(data) => {
              setAnnouncement(data);
              setShowFullAnnouncement(true);
            }} />
          </div>

          {editMode && (
            <>
              {/* Add resize handles similar to other components */}
              <div className="absolute right-0 bottom-0 w-4 h-4 cursor-se-resize hover:bg-blue-500 hover:bg-opacity-20 pointer-events-auto z-50"
                onMouseDown={(e) => handleHeaderResizeStart(e, 'bottom-right')} />
              <div className="absolute left-0 bottom-0 w-4 h-4 cursor-sw-resize hover:bg-blue-500 hover:bg-opacity-20 pointer-events-auto z-50"
                onMouseDown={(e) => handleHeaderResizeStart(e, 'bottom-left')} />
              <div className="absolute right-0 top-0 w-4 h-4 cursor-ne-resize hover:bg-blue-500 hover:bg-opacity-20 pointer-events-auto z-50"
                onMouseDown={(e) => handleHeaderResizeStart(e, 'top-right')} />
              <div className="absolute left-0 top-0 w-4 h-4 cursor-nw-resize hover:bg-blue-500 hover:bg-opacity-20 pointer-events-auto z-50"
                onMouseDown={(e) => handleHeaderResizeStart(e, 'top-left')} />
              
              {/* Edge handles */}
              <div className="absolute right-0 top-4 bottom-4 w-2 cursor-e-resize hover:bg-blue-500 hover:bg-opacity-20 pointer-events-auto z-50"
                onMouseDown={(e) => handleHeaderResizeStart(e, 'right')} />
              <div className="absolute left-0 top-4 bottom-4 w-2 cursor-w-resize hover:bg-blue-500 hover:bg-opacity-20 pointer-events-auto z-50"
                onMouseDown={(e) => handleHeaderResizeStart(e, 'left')} />
              <div className="absolute top-0 left-4 right-4 h-2 cursor-n-resize hover:bg-blue-500 hover:bg-opacity-20 pointer-events-auto z-50"
                onMouseDown={(e) => handleHeaderResizeStart(e, 'top')} />
              <div className="absolute bottom-0 left-4 right-4 h-2 cursor-s-resize hover:bg-blue-500 hover:bg-opacity-20 pointer-events-auto z-50"
                onMouseDown={(e) => handleHeaderResizeStart(e, 'bottom')} />
            </>
          )}
        </div>
      )}

      {visibleComponents.quickLinks && (
        <div
          ref={quickLinksRef}
          style={getQuickLinksStyle()}
          onMouseDown={handleQuickLinksDragStart}
          onContextMenu={(e) => handleContextMenu(e, 'quickLinks')}
          className={`select-none relative rounded-lg overflow-hidden fade-in-scale delay-5
            ${editMode ? 'ring-2 ring-blue-500 ring-opacity-50 shadow-lg' : 'border-2 border-opacity-20 border-slate-400'}`}
        >
          <DevOverlay component="quickLinks" position={quickLinksPosition} size={quickLinksSize} />
          <div className="relative z-10 w-full h-full">
            <QuickLinks editMode={editMode} />
          </div>

          {editMode && (
            <>
              {/* Add resize handles similar to other components */}
              <div className="absolute right-0 bottom-0 w-4 h-4 cursor-se-resize hover:bg-blue-500 hover:bg-opacity-20 pointer-events-auto z-50"
                onMouseDown={(e) => handleQuickLinksResizeStart(e, 'bottom-right')} />
              <div className="absolute left-0 bottom-0 w-4 h-4 cursor-sw-resize hover:bg-blue-500 hover:bg-opacity-20 pointer-events-auto z-50"
                onMouseDown={(e) => handleQuickLinksResizeStart(e, 'bottom-left')} />
              <div className="absolute right-0 top-0 w-4 h-4 cursor-ne-resize hover:bg-blue-500 hover:bg-opacity-20 pointer-events-auto z-50"
                onMouseDown={(e) => handleQuickLinksResizeStart(e, 'top-right')} />
              <div className="absolute left-0 top-0 w-4 h-4 cursor-nw-resize hover:bg-blue-500 hover:bg-opacity-20 pointer-events-auto z-50"
                onMouseDown={(e) => handleQuickLinksResizeStart(e, 'top-left')} />
              
              {/* Edge handles */}
              <div className="absolute right-0 top-4 bottom-4 w-2 cursor-e-resize hover:bg-blue-500 hover:bg-opacity-20 pointer-events-auto z-50"
                onMouseDown={(e) => handleQuickLinksResizeStart(e, 'right')} />
              <div className="absolute left-0 top-4 bottom-4 w-2 cursor-w-resize hover:bg-blue-500 hover:bg-opacity-20 pointer-events-auto z-50"
                onMouseDown={(e) => handleQuickLinksResizeStart(e, 'left')} />
              <div className="absolute top-0 left-4 right-4 h-2 cursor-n-resize hover:bg-blue-500 hover:bg-opacity-20 pointer-events-auto z-50"
                onMouseDown={(e) => handleQuickLinksResizeStart(e, 'top')} />
              <div className="absolute bottom-0 left-4 right-4 h-2 cursor-s-resize hover:bg-blue-500 hover:bg-opacity-20 pointer-events-auto z-50"
                onMouseDown={(e) => handleQuickLinksResizeStart(e, 'bottom')} />
            </>
          )}
        </div>
      )}

      {/* Add PopupMessage at the root level */}
      {showFullAnnouncement && announcement && (
        <PopupMessage 
          isOpen={showFullAnnouncement}
          onClose={() => setShowFullAnnouncement(false)}
          data={announcement}
        />
      )}

      {/* Add new centered bottom toolbar */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 flex items-center gap-4">
        <div className={`${currentTheme.main} rounded-full shadow-lg p-2 flex items-center gap-2`}>
          {editMode ? (
            <>
              {isAdmin() && (
                <button
                  onClick={() => setShowDevOverlay(!showDevOverlay)}
                  className={`p-2 rounded-full ${currentTheme.accent} 
                    transition-all duration-300 hover:scale-110 
                    ${showDevOverlay ? 'bg-green-500' : ''}`}
                  title="Toggle Dev Overlay"
                >
                  DEV
                </button>
              )}
              <button
                onClick={() => setShowComponentList(true)}
                className={`p-2 rounded-full ${currentTheme.accent} 
                  transition-all duration-300 hover:scale-110`}
                title="Add Component"
              >
                <FaPlus size={24} />
              </button>
              
              <div className="relative">
                <button
                  onClick={() => setShowTemplates(prev => !prev)}
                  className={`p-2 rounded-full ${currentTheme.accent} 
                    transition-all duration-300 hover:scale-110`}
                  title="Templates"
                >
                  <FaLayerGroup size={24} />
                </button>
                
                {/* Templates dropdown */}
                {showTemplates && (
                  <div className={`absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 ${currentTheme.main} rounded-lg shadow-lg p-2 min-w-[200px]`}>
                    <div className="flex flex-col gap-2">
                      {Object.entries(TEMPLATES).map(([name, config]) => (
                        <button
                          key={name}
                          onClick={() => handleTemplateSwitch(name, config)}
                          className={`w-full text-left px-4 py-2 rounded ${currentTheme.accent} ${currentTheme.text} hover:opacity-80 transition-opacity flex items-center justify-between`}
                        >
                          <span className="capitalize">{config.name}</span>
                          {currentTemplate === name && (
                            <span className="text-green-400">●</span>
                          )}
                        </button>
                      ))}
                      {editMode && (
                        <button
                          onClick={saveAsUserTemplate}
                          className={`w-full text-left px-4 py-2 rounded ${currentTheme.accent} ${currentTheme.text} hover:opacity-80 transition-opacity mt-2 border-t border-gray-600`}
                        >
                          Save Current as Custom
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : null}
          
          <button
            onClick={toggleEditMode}
            className={`p-2 rounded-full ${currentTheme.accent} 
              transition-all duration-300 hover:scale-110`}
            title={editMode ? "Save Layout" : "Edit Layout"}
          >
            {editMode ? <FaSave size={24} /> : <FaEdit size={24} />}
          </button>
        </div>
      </div>
      
      {/* Keep existing modals and popups */}
      {showComponentList && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className={`${currentTheme.main} rounded-lg p-4 max-w-md w-full mx-4`}>
            <h2 className={`${currentTheme.text} text-xl font-bold mb-4`}>Available Components</h2>
            <div className="space-y-2">
              {!visibleComponents.progress && (
                <button
                  onClick={() => showComponent('progress')}
                  className={`w-full p-2 text-left ${currentTheme.accent} rounded-lg ${currentTheme.text}`}
                >
                  Period Progress
                </button>
              )}
              {!visibleComponents.schedule && (
                <button
                  onClick={() => showComponent('schedule')}
                  className={`w-full p-2 text-left ${currentTheme.accent} rounded-lg ${currentTheme.text}`}
                >
                  Schedule
                </button>
              )}
              {!visibleComponents.calendar && (
                <button
                  onClick={() => showComponent('calendar')}
                  className={`w-full p-2 text-left ${currentTheme.accent} rounded-lg ${currentTheme.text}`}
                >
                  Google Calendar
                </button>
              )}
              {!visibleComponents.weather && (
                <button
                  onClick={() => showComponent('weather')}
                  className={`w-full p-2 text-left ${currentTheme.accent} rounded-lg ${currentTheme.text}`}
                >
                  Weather
                </button>
              )}
              {!visibleComponents.header && (
                <button
                  onClick={() => showComponent('header')}
                  className={`w-full p-2 text-left ${currentTheme.accent} rounded-lg ${currentTheme.text}`}
                >
                  Day Header
                </button>
              )}
              {!visibleComponents.quickLinks && (
                <button
                  onClick={() => showComponent('quickLinks')}
                  className={`w-full p-2 text-left ${currentTheme.accent} rounded-lg ${currentTheme.text}`}
                >
                  Quick Links
                </button>
              )}
            </div>
            <button
              onClick={() => setShowComponentList(false)}
              className={`mt-4 w-full p-2 ${currentTheme.accent} rounded-lg ${currentTheme.text}`}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Context Menu */}
      {contextMenu.show && (
        <div 
          className={`fixed z-50 ${currentTheme.main} rounded-lg shadow-xl border-2 ${currentTheme.border}`}
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <div className="flex flex-col p-2 min-w-[200px]">
            <button
              onClick={() => hideComponent(contextMenu.component)}
              className={`${currentTheme.accent} p-2 rounded mb-1 text-left hover:opacity-80`}
            >
              Remove Component
            </button>
            <button
              onClick={() => resetComponentScale(contextMenu.component)}
              className={`${currentTheme.accent} p-2 rounded mb-1 text-left hover:opacity-80`}
            >
              Reset Size
            </button>
            <button
              onClick={() => resetComponentPosition(contextMenu.component)}
              className={`${currentTheme.accent} p-2 rounded text-left hover:opacity-80`}
            >
              Reset Position
            </button>
          </div>
        </div>
      )}

      {/* Keep existing ending code */}
    </div>
  );
});

export default V3;
