'use client';

import { useEffect } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

export default function ProductTour() {
  useEffect(() => {
    // Check if the tour has already been completed on this device
    const hasCompletedTour = localStorage.getItem('vero_tour_completed');
    
    if (!hasCompletedTour) {
      // Small delay to ensure all components are mounted and animations are finished
      const timer = setTimeout(() => {
        const driverObj = driver({
          showProgress: true,
          steps: [
            {
              element: '#tour-sidebar',
              popover: {
                title: 'Welcome to your Command Center',
                description: 'Navigate seamlessly between your Campaigns, Analytics, and AI Insights right here.',
                side: 'right',
                align: 'start'
              }
            },
            {
              element: '#tour-scale-radar',
              popover: {
                title: 'Scale Radar & Overview',
                description: 'Get an instant pulse on your ROAS, Spend, and winning creatives at a glance.',
                side: 'bottom',
                align: 'start'
              }
            },
            {
              element: '#tour-connect-btn',
              popover: {
                title: 'Connect Your Accounts',
                description: 'Ready to see your live data? Click here to securely connect your Meta Ads accounts.',
                side: 'left',
                align: 'center'
              }
            }
          ],
          onDestroyStarted: () => {
            if (!driverObj.hasNextStep() || confirm("Are you sure you want to skip the tour?")) {
              localStorage.setItem('vero_tour_completed', 'true');
              driverObj.destroy();
            }
          },
          onPopoverRender: (popover, { config, state }) => {
            // Apply custom styling dynamically
            popover.wrapper.style.borderRadius = '16px';
            popover.wrapper.style.backgroundColor = '#0F111A';
            popover.wrapper.style.color = '#fff';
            popover.wrapper.style.border = '1px solid rgba(255, 255, 255, 0.1)';
            popover.wrapper.style.boxShadow = '0 24px 60px rgba(0, 0, 0, 0.65)';
            
            const title = popover.title;
            if (title) {
                title.style.color = '#F97316';
                title.style.fontFamily = 'Outfit, sans-serif';
            }
            const desc = popover.description;
            if (desc) {
                desc.style.color = '#94A3B8';
            }
          }
        });

        driverObj.drive();
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, []);

  return null; // This component does not render any visible UI on its own
}
