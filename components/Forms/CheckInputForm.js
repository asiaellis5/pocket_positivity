import React, { Component } from 'react';
import { View } from 'react-native';
import CircleSlider from './CircleSlider';
// import { CircleSlider } from 'react-circle-slider';

const CheckInForm = () => {
  const [userScrore, setUserScore] = useState('');
  const [userComment, setUserComment] = useState('');

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <CircleSlider
        value={userScore}
        strokeWidth={1}
        min={90}
        max={270}
        textSize={10}
        fillColor={'blue'}
        meterColor={'red'}
        // onChange={(input) => setUserScore(input)}
      />
    </View>
  );
};
export default CheckInForm;