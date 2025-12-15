import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, UserPlus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const GuestLimitModal = ({ isOpen, onClose }) => {
    const navigate = useNavigate();

    const handleRegister = () => {
        onClose();
        navigate('/register');
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-md bg-gray-800 rounded-2xl border border-gray-700 shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-white/20 rounded-lg">
                                        <AlertCircle className="w-6 h-6 text-white" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-white">Guest Limit Reached</h2>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5 text-white" />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            {/* Message */}
                            <div className="mb-6">
                                <p className="text-gray-300 text-lg mb-4">
                                    You've reached the maximum of <span className="font-bold text-white">5 free screenings</span> as a guest user.
                                </p>
                                <p className="text-gray-400 text-sm">
                                    Create a free account to unlock unlimited screenings and additional features!
                                </p>
                            </div>

                            {/* Benefits */}
                            <div className="mb-6 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                                <h3 className="text-white font-semibold mb-3">Benefits of Registration:</h3>
                                <ul className="space-y-2 text-sm text-gray-300">
                                    <li className="flex items-start">
                                        <span className="text-green-400 mr-2">✓</span>
                                        <span>Unlimited sleep health screenings</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-green-400 mr-2">✓</span>
                                        <span>Save and track your screening history</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-green-400 mr-2">✓</span>
                                        <span>Access detailed analytics and insights</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-green-400 mr-2">✓</span>
                                        <span>Export your health reports</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-green-400 mr-2">✓</span>
                                        <span>100% free - no credit card required</span>
                                    </li>
                                </ul>
                            </div>

                            {/* Buttons */}
                            <div className="flex space-x-3">
                                <button
                                    onClick={onClose}
                                    className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                                >
                                    Maybe Later
                                </button>
                                <button
                                    onClick={handleRegister}
                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90 text-white rounded-lg font-medium transition-opacity flex items-center justify-center space-x-2"
                                >
                                    <UserPlus className="w-5 h-5" />
                                    <span>Register Now</span>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default GuestLimitModal;
