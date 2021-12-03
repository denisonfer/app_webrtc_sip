import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import Dialer from '../screens/Dialer';

const {Navigator, Screen} = createNativeStackNavigator();

const Routes = () => {
  return (
    <NavigationContainer>
      <Navigator>
        <Screen name="DialerScreen" component={Dialer} />
      </Navigator>
    </NavigationContainer>
  );
};

export default Routes;
