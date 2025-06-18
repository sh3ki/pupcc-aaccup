import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const COLORS = {
    primaryMaroon: '#7F0404',
    darkMaroon: '#4D1414',
    burntOrange: '#C46B02',
    brightYellow: '#F4BB00',
    softYellow: '#FDDE54',
    almostWhite: '#FEFEFE',
};

interface ConfirmationModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    loading?: boolean;
    type?: 'danger' | 'warning' | 'info';
}

export default function ConfirmationModal({
    open,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    loading = false,
    type = 'danger'
}: ConfirmationModalProps) {
    const getTypeColors = () => {
        switch (type) {
            case 'danger':
                return {
                    iconBg: 'bg-red-100',
                    iconColor: 'text-red-600',
                    confirmBg: 'bg-[#7F0404] hover:bg-[#4D1414]',
                    borderColor: 'border-[#7F0404]'
                };
            case 'warning':
                return {
                    iconBg: 'bg-[#FDDE54]/20',
                    iconColor: 'text-[#C46B02]',
                    confirmBg: 'bg-[#C46B02] hover:bg-[#7F0404]',
                    borderColor: 'border-[#C46B02]'
                };
            default:
                return {
                    iconBg: 'bg-[#7F0404]/10',
                    iconColor: 'text-[#7F0404]',
                    confirmBg: 'bg-[#7F0404] hover:bg-[#4D1414]',
                    borderColor: 'border-[#7F0404]'
                };
        }
    };

    const typeColors = getTypeColors();

    return (
        <Transition show={open} as={Fragment}>
            <Dialog as="div" className="fixed inset-0 z-50 flex items-center justify-center" onClose={onClose}>
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0 scale-95"
                    enterTo="opacity-100 scale-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100 scale-100"
                    leaveTo="opacity-0 scale-95"
                >
                    <div
                        className={`relative w-full max-w-lg mx-auto rounded-2xl shadow-2xl overflow-hidden bg-gradient-to-br from-white via-white to-gray-50 border-t-4 ${typeColors.borderColor}`}
                        style={{ margin: '0 1rem' }}
                    >
                        {/* Background decorations */}
                        <div className="absolute -top-6 -left-6 w-20 h-20 rounded-full bg-[#FDDE54]/30 blur-xl pointer-events-none"></div>
                        <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-[#C46B02]/20 blur-xl pointer-events-none"></div>
                        
                        <div className="relative z-10 p-8">
                            {/* Icon */}
                            <div className="flex items-center justify-center mb-6">
                                <div className={`w-16 h-16 rounded-full ${typeColors.iconBg} flex items-center justify-center shadow-lg transition-transform duration-300 hover:scale-110`}>
                                    <ExclamationTriangleIcon className={`w-8 h-8 ${typeColors.iconColor}`} />
                                </div>
                            </div>

                            {/* Content */}
                            <div className="text-center mb-8">
                                <Dialog.Title className="text-2xl font-bold text-gray-900 mb-4 tracking-tight">
                                    {title}
                                </Dialog.Title>
                                <p className="text-lg text-gray-600 leading-relaxed">
                                    {message}
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                                <button
                                    type="button"
                                    className="flex-1 px-6 py-3 rounded-lg font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all duration-200 hover:scale-105 border border-gray-200"
                                    onClick={onClose}
                                    disabled={loading}
                                >
                                    {cancelText}
                                </button>
                                <button
                                    type="button"
                                    className={`flex-1 px-6 py-3 rounded-lg font-bold text-white transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed ${typeColors.confirmBg}`}
                                    onClick={onConfirm}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <div className="flex items-center justify-center">
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                                            Deleting...
                                        </div>
                                    ) : (
                                        confirmText
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </Transition.Child>
            </Dialog>
        </Transition>
    );
}
