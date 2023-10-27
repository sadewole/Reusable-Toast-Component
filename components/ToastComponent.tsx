import {
  LayoutChangeEvent,
  StyleSheet,
  ViewStyle,
  Text,
  View,
  Image,
  Animated,
  Easing,
} from 'react-native';
import React from 'react';
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

  // REFs
  const gesturePanViewRef = React.useRef<GesturePanViewRefProps>(null);
  const directions = React.useRef([
    props.position === 'bottom' ? PanDirectionsEnum.DOWN : PanDirectionsEnum.UP,
    PanDirectionsEnum.LEFT,
    PanDirectionsEnum.RIGHT,
  ]).current;
  // STATEs
  const [toastHeight, setToastHeight] = React.useState<number>(500);
  const toastAnimatedValue = React.useRef(new Animated.Value(0));

  const { clearTimer, setTimer } = useTimer({ onDismiss, autoDismiss });
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
      Animated.timing(toastAnimatedValue.current, {
        toValue: Number(show),
        duration: 300,
        delay: 100,
        easing: Easing.bezier(0.215, 0.61, 0.355, 1),
        useNativeDriver: true,
      }).start(() => {
        if (visible) {
          setTimer();
        }
      });
    },
    [setTimer, visible]
  );

  const positionMultiplier = isTop ? -1 : 1;
  const startOutputRange = React.useMemo(
    () => positionMultiplier * toastHeight,
    [positionMultiplier, toastHeight]
  );
  const toastTranslateY = toastAnimatedValue.current.interpolate({
    inputRange: [0, 1],
    outputRange: [startOutputRange, 0],
  });

  const toastContainerStyle = React.useMemo(
    () => ({
      zIndex,
      [position]: 0,
      transform: [
        {
          translateY: toastTranslateY,
        },
      ],
    }),
    [zIndex, position, toastTranslateY]
  );

  React.useEffect(() => {
    toggleToast(visible);
    return () => clearTimer();
  }, [clearTimer, toggleToast, visible]);

  React.useEffect(() => {
    toastTranslateY.addListener(({ value }) => {
      if (value === startOutputRange) {
        gesturePanViewRef.current?.returnToOrigin();
      }
    });
  }, [gesturePanViewRef.current, startOutputRange, toastTranslateY]);

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
      style={[toastContainerStyle, { position: 'absolute', left: 0, right: 0 }]}
      pointerEvents={'box-none'}
    >
      <SafeAreaView>
        <Animated.View
          onLayout={onLayout}
          pointerEvents={props.visible ? 'box-none' : 'none'}
        >
          <GesturePanView
            ref={gesturePanViewRef}
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
