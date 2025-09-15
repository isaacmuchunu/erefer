// Simple toast utility for notifications
export const toast = {
    success: (message: string) => {
        console.log('Success:', message);
        // In a real implementation, you would show a toast notification
        // For now, we'll just log to console
        if (typeof window !== 'undefined') {
            alert(`Success: ${message}`);
        }
    },
    
    error: (message: string) => {
        console.error('Error:', message);
        // In a real implementation, you would show an error toast
        // For now, we'll just log to console
        if (typeof window !== 'undefined') {
            alert(`Error: ${message}`);
        }
    },
    
    info: (message: string) => {
        console.info('Info:', message);
        // In a real implementation, you would show an info toast
        // For now, we'll just log to console
        if (typeof window !== 'undefined') {
            alert(`Info: ${message}`);
        }
    },
    
    warning: (message: string) => {
        console.warn('Warning:', message);
        // In a real implementation, you would show a warning toast
        // For now, we'll just log to console
        if (typeof window !== 'undefined') {
            alert(`Warning: ${message}`);
        }
    }
};
