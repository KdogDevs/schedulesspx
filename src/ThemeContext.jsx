import React, { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext();

export const themes = {
  default: {
    name: 'Default',
    main: 'bg-stpius-blue',
    mainBackground: '#012143', // Assuming this is the color code for bg-stpius-blue
    accent: 'bg-stpius-gold',
    text: 'text-stpius-white',
    border: 'border-stpius-gold'
  },
  dark: {
    name: 'Dark',
    main: 'bg-gray-900',
    mainBackground: '#1a1a1a', // Color code for bg-gray-900
    accent: 'bg-gray-600',
    text: 'text-white',
    border: 'border-gray-600'
  },
  light: {
    name: 'Light',
    main: 'bg-gray-100',
    mainBackground: '#f7fafc', // Color code for bg-gray-100
    accent: 'bg-gray-300',
    text: 'text-gray-900',
    border: 'border-gray-300'
  },
  forest: {
    name: 'Forest',
    main: 'bg-green-800',
    mainBackground: '#22543d', // Color code for bg-green-800
    accent: 'bg-green-500',
    text: 'text-white',
    border: 'border-green-500'
  },
  ocean: {
    name: 'Ocean',
    main: 'bg-blue-800',
    mainBackground: '#2a4365', // Color code for bg-blue-800
    accent: 'bg-blue-500',
    text: 'text-white',
    border: 'border-blue-500'
  },
  // Holiday themes
  christmas: {
    name: 'Christmas',
    main: 'bg-red-700',
    mainBackground: '#c53030', // Color code for bg-red-700
    accent: 'bg-green-600',
    text: 'text-white',
    border: 'border-yellow-300'
  },
  halloween: {
    name: 'Halloween',
    main: 'bg-orange-600',
    mainBackground: '#dd6b20', // Color code for bg-orange-600
    accent: 'bg-purple-700',
    text: 'text-white',
    border: 'border-black'
  },
  valentines: {
    name: "Valentine's Day",
    main: 'bg-pink-500',
    mainBackground: '#d53f8c', // Color code for bg-pink-500
    accent: 'bg-red-400',
    text: 'text-white',
    border: 'border-pink-300'
  },
  stpatricks: {
    name: "St. Patrick's Day",
    main: 'bg-green-600',
    mainBackground: '#2f855a', // Color code for bg-green-600
    accent: 'bg-yellow-400',
    text: 'text-white',
    border: 'border-green-300'
  },
  easter: {
    name: 'Easter',
    main: 'bg-purple-400',
    mainBackground: '#9f7aea', // Color code for bg-purple-400
    accent: 'bg-yellow-300',
    text: 'text-gray-800',
    border: 'border-pink-300'
  },
  independence: {
    name: 'Independence Day',
    main: 'bg-blue-700',
    mainBackground: '#2c5282', // Color code for bg-blue-700
    accent: 'bg-red-600',
    text: 'text-white',
    border: 'border-white'
  },
  thanksgiving: {
    name: 'Thanksgiving',
    main: 'bg-orange-700',
    mainBackground: '#c05621', // Color code for bg-orange-700
    accent: 'bg-yellow-600',
    text: 'text-white',
    border: 'border-brown-400'
  }
};

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState(themes.default);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      try {
        const parsedTheme = JSON.parse(savedTheme);
        setCurrentTheme(parsedTheme);
      } catch (error) {
        const fallbackTheme = themes[savedTheme.toLowerCase()] || themes.default;
        setCurrentTheme(fallbackTheme);
      }
    }
  }, []);

  const changeTheme = (themeName) => {
    const normalizedThemeName = themeName.toLowerCase();
    const newTheme = themes[normalizedThemeName] || themes.default;
    setCurrentTheme(newTheme);
    localStorage.setItem('theme', JSON.stringify(newTheme));
  };

  const setCustomTheme = (customTheme) => {
    setCurrentTheme(customTheme);
    localStorage.setItem('theme', JSON.stringify(customTheme));
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, changeTheme, setCustomTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
