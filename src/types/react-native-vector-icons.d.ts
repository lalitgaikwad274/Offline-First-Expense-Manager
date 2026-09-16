declare module 'react-native-vector-icons/*' {
  import { Component } from 'react';
  import { StyleProp, TextStyle, ViewStyle } from 'react-native';

  export interface IconProps {
    name: string;
    size?: number;
    color?: string;
    style?: StyleProp<TextStyle | ViewStyle>;
    [key: string]: any;
  }

  export default class Icon extends Component<IconProps> {}
}
