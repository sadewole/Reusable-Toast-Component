const checkMarkIcon = require('../assets/checkmarkFlat.png');
const exclamationIcon = require('../assets/exclamationFill.png');

const TOAST_PRESETS = {
  success: {
    icon: checkMarkIcon,
    iconColor: '#00AD50',
    accessibilityMessagePrefix: 'Success',
  },
  failure: {
    icon: exclamationIcon,
    iconColor: '#EA2424',
    accessibilityMessagePrefix: 'Alert',
  },
};

export const useToastPresets = ({
  preset,
  message,
}: {
  preset: keyof typeof TOAST_PRESETS;
  message: string;
}) => {
  const toastPreset = TOAST_PRESETS[preset];
  return {
    icon: toastPreset?.icon,
    iconColor: toastPreset?.iconColor,
    accessibilityMessage: `${toastPreset?.accessibilityMessagePrefix} notification, ${message}`,
  };
};
