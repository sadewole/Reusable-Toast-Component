import { Dimensions, StyleSheet, ViewStyle } from 'react-native';
import React, { useImperativeHandle } from 'react';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { PanDirectionsEnum } from '../type';

const Constants = {
  windowHeight: Dimensions.get('window').height,
  screenWidth: Dimensions.get('screen').width,
};

const HIDDEN = {
  up: -Constants.windowHeight,
  down: Constants.windowHeight,
  left: -Constants.screenWidth,
  right: Constants.screenWidth,
};

const springConfig = {
  velocity: 300,
  damping: 18,
  stiffness: 100,
  mass: 0.4,
};

export type GesturePanViewRefProps = {
  returnToOrigin(): void;
};

type GesturePanViewProps = {
  directions: PanDirectionsEnum[];
  clearTimer(): void;
  onDismiss?(): void;
  style?: ViewStyle;
};

const GesturePanView = React.forwardRef<
  GesturePanViewRefProps,
  React.PropsWithChildren<GesturePanViewProps>
>(({ children, directions, clearTimer, onDismiss, style }, ref) => {
  const context = useSharedValue({ y: 0, x: 0 });
  const waitingForDismiss = useSharedValue(false);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const handleDismiss = React.useCallback(
    (isFinished?: boolean) => {
      'worklet';

      if (isFinished && waitingForDismiss.value && onDismiss) {
        waitingForDismiss.value = false;

        runOnJS(clearTimer)();
        runOnJS(onDismiss)();
      }
    },
    [clearTimer, onDismiss, waitingForDismiss]
  );

  const returnToOrigin = React.useCallback(() => {
    'worklet';

    translateX.value = withSpring(0, springConfig);
    translateY.value = withSpring(0, springConfig);
  }, []);

  useImperativeHandle(ref, () => ({ returnToOrigin }), [returnToOrigin]);

  const gesture = Gesture.Pan()
    .onStart(() => {
      context.value = { x: translateX.value, y: translateY.value };
    })
    .onUpdate((event) => {
      if (
        directions?.includes(PanDirectionsEnum.LEFT) &&
        directions?.includes(PanDirectionsEnum.RIGHT)
      ) {
        translateX.value = context.value.x + event.translationX;
      } else if (directions?.includes(PanDirectionsEnum.LEFT)) {
        translateX.value = Math.min(0, context.value.x + event.translationX);
      } else if (directions?.includes(PanDirectionsEnum.RIGHT)) {
        translateX.value = Math.max(0, context.value.x + event.translationX);
      }
      if (
        directions?.includes(PanDirectionsEnum.UP) &&
        directions?.includes(PanDirectionsEnum.DOWN)
      ) {
        translateY.value = context.value.y + event.translationY;
      } else if (directions?.includes(PanDirectionsEnum.UP)) {
        translateY.value = Math.min(0, context.value.y + event.translationY);
      } else if (directions?.includes(PanDirectionsEnum.DOWN)) {
        translateY.value = Math.max(0, context.value.y + event.translationY);
      }

      // clamp translation
      if (translateY.value < 0) {
        translateX.value = 0;
      }
    })
    .onEnd(() => {
      waitingForDismiss.value = true;
      if (translateX.value !== 0) {
        const toX = translateX.value > 0 ? HIDDEN.right : HIDDEN.left;
        translateX.value = withTiming(toX, { duration: 100 }, handleDismiss);
      }
      if (translateY.value !== 0) {
        const toY = translateY.value > 0 ? HIDDEN.down : HIDDEN.up;
        translateY.value = withTiming(toY, { duration: 100 }, handleDismiss);
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      transform: [
        {
          translateX: translateX.value,
        },
        {
          translateY: translateY.value,
        },
      ],
    };
  }, []);

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[animatedStyle, styles.toastContent, style]}>
        {children}
      </Animated.View>
    </GestureDetector>
  );
});

const styles = StyleSheet.create({
  toastContent: {
    backgroundColor: '#fff',
    minHeight: 48,
    flexDirection: 'row',
    alignSelf: 'center',
    alignItems: 'center',
    borderRadius: 12,
    shadowColor: 'black',
    shadowOffset: {
      width: 0,
      height: -1,
    },
    shadowOpacity: 4,
    shadowRadius: 8,
    elevation: 4,

    marginHorizontal: 20,
    marginVertical: 12,
    paddingLeft: 12,
  },
});


export default GesturePanView;