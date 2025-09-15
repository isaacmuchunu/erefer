export default function AppLogo() {
    return (
        <div className="flex items-center space-x-3">
            <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
            </div>
            <div className="flex flex-col">
                <span className="font-bold text-xl text-gray-900 tracking-tight">CareLink</span>
                <span className="text-xs text-gray-500 -mt-1">Healthcare Network</span>
            </div>
        </div>
    );
}
