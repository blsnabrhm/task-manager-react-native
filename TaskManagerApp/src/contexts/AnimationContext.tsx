import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Animated, Dimensions } from 'react-native';
import { useTheme } from './ThemeContext';

interface AnimationContextType {
  fadeAnimation: Animated.Value;
  slideAnimation: Animated.Value;
  triggerFadeIn: () => void;
  triggerSlideIn: (direction?: 'left' | 'right') => void;
  triggerScreenTransition: (callback?: () => void) => void;
}

const AnimationContext = createContext<AnimationContextType | undefined>(undefined);

interface AnimationProviderProps {
  children: ReactNode;
}

export const AnimationProvider: React.FC<AnimationProviderProps> = ({ children }) => {
  const [fadeAnimation] = useState(new Animated.Value(1));
  const [slideAnimation] = useState(new Animated.Value(0));
  
  const screenWidth = Dimensions.get('window').width;

  const triggerFadeIn = () => {
    fadeAnimation.setValue(0);
    Animated.timing(fadeAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const triggerSlideIn = (direction: 'left' | 'right' = 'right') => {
    const startValue = direction === 'right' ? screenWidth : -screenWidth;
    slideAnimation.setValue(startValue);
    
    Animated.timing(slideAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const triggerScreenTransition = (callback?: () => void) => {
    // Fade out current screen with faster timing
    Animated.timing(fadeAnimation, {
      toValue: 0,
      duration: 100, // Reduced fade out duration for snappier feel
      useNativeDriver: true,
    }).start(() => {
      // Execute callback (screen change) immediately
      if (callback) {
        callback();
      }
      
      // Fade in new screen immediately with smoother timing
      Animated.timing(fadeAnimation, {
        toValue: 1,
        duration: 150, // Slightly faster fade in
        useNativeDriver: true,
      }).start();
    });
  };

  const value: AnimationContextType = {
    fadeAnimation,
    slideAnimation,
    triggerFadeIn,
    triggerSlideIn,
    triggerScreenTransition,
  };

  return (
    <AnimationContext.Provider value={value}>
      {children}
    </AnimationContext.Provider>
  );
};

export const useAnimation = (): AnimationContextType => {
  const context = useContext(AnimationContext);
  if (context === undefined) {
    throw new Error('useAnimation must be used within an AnimationProvider');
  }
  return context;
};