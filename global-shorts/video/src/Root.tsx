import React from 'react';
import {Composition} from 'remotion';
import {EP03} from './EP03';
import {EP03v2} from './EP03v2';
import {EP01} from './EP01';
import {EP02} from './EP02';
export const Root: React.FC = () => (<>
  <Composition id="EP03" component={EP03} durationInFrames={450} fps={30} width={1080} height={1920} />
  <Composition id="EP03v2" component={EP03v2} durationInFrames={405} fps={30} width={1080} height={1920} />
  <Composition id="EP01" component={EP01} durationInFrames={420} fps={30} width={1080} height={1920} />
  <Composition id="EP02" component={EP02} durationInFrames={420} fps={30} width={1080} height={1920} />
</>);
