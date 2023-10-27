import {
  LayoutChangeEvent,
  StyleSheet,
  ViewStyle,
  Text,
  View,
  Image,
} from 'react-native';
import React from 'react';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {
  useSafeAreaInsets,
  SafeAreaView,
} from 'react-native-safe-area-context';
import GesturePanView, { GesturePanViewRefProps } from './GesturePanView';
import { PanDirectionsEnum } from '../type';
import { useTimer } from '../hooks/useTimer';
import { useToastPresets } from '../hooks/useToastPreset';

type ToastProps = {
  position: 'top' | 'bottom';
  onDismiss?: () => void;
  visible: boolean;
  message: string;
  preset: 'success' | 'failure';
  style?: ViewStyle;
  autoDismiss: number;
  zIndex?: number;
};

const ToastView = (props: ToastProps) => {
  const {
    position,
    onDismiss,
    visible,
    message,
    preset,
    style,
    autoDismiss,
    zIndex,
  } = props;
  const isTop = position === 'top';
  const { top, bottom } = useSafeAreaInsets();

  const GesturePanViewRef = React.useRef<GesturePanViewRefProps>(null);
  const directions = React.useRef([
    props.position === 'bottom' ? PanDirectionsEnum.DOWN : PanDirectionsEnum.UP,
    PanDirectionsEnum.LEFT,
    PanDirectionsEnum.RIGHT,
  ]).current;

  const [toastHeight, setToastHeight] = React.useState<number>(500);
  const { clearTimer, setTimer } = useTimer({ onDismiss, autoDismiss });

  const toastAnimatedValue = useSharedValue(0);

  const toastPreset = useToastPresets({
    message,
    preset,
  });

  const onLayout = React.useCallback(
    (event: LayoutChangeEvent) => {
      const height = event.nativeEvent.layout.height;
      if (height !== toastHeight) {
        const addon = isTop ? top : bottom;
        setToastHeight(height + addon);
      }
    },
    [toastHeight]
  );

  const toggleToast = React.useCallback(
    (show = false) => {
      toastAnimatedValue.value = withTiming(Number(show), {
        duration: 300,
        easing: Easing.bezier(0.215, 0.61, 0.355, 1),
      });

      // set close timer
      if (show) {
        setTimer();
      }
    },
    [setTimer, visible]
  );

  const positionMultiplier = isTop ? -1 : 1;
  const startOutputRange = React.useMemo(
    () => positionMultiplier * toastHeight,
    [positionMultiplier, toastHeight]
  );

  React.useEffect(() => {
    toggleToast(visible);
    return () => clearTimer();
  }, [clearTimer, toggleToast, visible]);

  const toastContainerStyle = useAnimatedStyle(() => {
    const toastTranslateY = interpolate(
      toastAnimatedValue.value,
      [0, 1],
      [startOutputRange, 0]
    );

    // Reset translation if toast is closed with swipe
    if (toastTranslateY === startOutputRange) {
      GesturePanViewRef.current?.returnToOrigin();
    }

    return {
      transform: [
        {
          translateY: toastTranslateY,
        },
      ],
    };
  });

  const renderMessage = () => {
    return (
      <View
        //   accessible={Constants.isIOS}
        style={styles.messageContainer}
      >
        <Text
          style={styles.message}
          accessibilityLabel={toastPreset.accessibilityMessage}
        >
          {message}
        </Text>
      </View>
    );
  };
  const renderIcon = () => {
    return (
      <Image
        source={toastPreset.icon}
        resizeMode={'contain'}
        style={styles.icon}
        tintColor={toastPreset.iconColor}
      />
    );
  };

  return (
    <Animated.View
      style={[
        toastContainerStyle,
        { position: 'absolute', left: 0, right: 0, zIndex, [position]: 0 },
      ]}
      pointerEvents={'box-none'}
    >
      <SafeAreaView>
        <Animated.View
          onLayout={onLayout}
          pointerEvents={props.visible ? 'box-none' : 'none'}
        >
          <GesturePanView
            ref={GesturePanViewRef}
            onDismiss={onDismiss}
            clearTimer={clearTimer}
            directions={directions}
            style={style}
          >
            {renderIcon()}
            {renderMessage()}
          </GesturePanView>
        </Animated.View>
      </SafeAreaView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  messageContainer: {
    flex: 1,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  message: {
    marginLeft: 8,
    marginRight: 20,
    textAlign: 'left',
  },
  icon: {
    width: 24,
    height: 24,
    marginRight: 4,
  },
});

export default ToastView;
